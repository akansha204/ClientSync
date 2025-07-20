import { NextRequest, NextResponse } from "next/server";
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

interface SendEmailRequest {
    to: string;
    subject: string;
    content: string;
    clientName: string;
}

export async function POST(req: NextRequest) {
    try {
        const { to, subject, content, clientName }: SendEmailRequest = await req.json();

        // Validate required fields
        if (!to || !subject || !content) {
            return NextResponse.json(
                { error: "Missing required fields: to, subject, content" },
                { status: 400 }
            );
        }

        // Check for Resend API key
        if (!process.env.RESEND_API_KEY) {
            return NextResponse.json(
                { error: "Resend API key not configured" },
                { status: 500 }
            );
        }

        // Get user session from Supabase
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Get Authorization header
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        // Get user from JWT token
        const jwt = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);

        if (authError || !user) {
            return NextResponse.json(
                { error: "Invalid authentication" },
                { status: 401 }
            );
        }

        // Use user's email as sender
        const senderEmail = user.email;
        if (!senderEmail) {
            return NextResponse.json(
                { error: "User email not found" },
                { status: 400 }
            );
        }

        // Initialize Resend
        const resend = new Resend(process.env.RESEND_API_KEY);

        const senderName = user.user_metadata?.full_name || user.email; // Use full_name, fallback to email

        // Send email
        const fromEmail = `"Client-Sync" <${process.env.FROM_EMAIL}>`;

        const replyToAddress = `"${senderName}" <${user.email}>`;


        // // In development/testing mode, check if we can send to the recipient
        // const isDevelopment = process.env.NODE_ENV === 'development';
        // const isTestingMode = fromEmail === 'onboarding@resend.dev';
        // const userEmail = user.email;

        // if (isDevelopment && isTestingMode && to !== userEmail) {
        //     return NextResponse.json(
        //         {
        //             error: `Testing mode: Can only send emails to your own email address (${userEmail}). To send to other recipients, please verify a domain at resend.com/domains.`,
        //             suggestion: "For testing, try sending the email to your own email address instead."
        //         },
        //         { status: 403 }
        //     );
        // }

        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: to,
            subject: subject,
            html: formatEmailContent(content, senderEmail),
            text: content, // Plain text version
            replyTo: replyToAddress, // Set user's email as reply-to
        });

        if (error) {
            console.error('Resend API error:', error);

            // Check for specific Resend error types
            if (error.message && error.message.includes('testing emails')) {
                return NextResponse.json(
                    { error: "Email service is in testing mode. You can only send emails to your own verified email address. Please verify your domain at resend.com/domains to send to all recipients." },
                    { status: 403 }
                );
            }

            if (error.message && error.message.includes('domain')) {
                return NextResponse.json(
                    { error: "Email domain not verified. Please verify your domain at resend.com/domains." },
                    { status: 403 }
                );
            }

            return NextResponse.json(
                { error: error.message || "Failed to send email" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            messageId: data?.id,
            message: `Email sent successfully to ${clientName} from ${senderEmail}`
        });

    } catch (error) {
        console.error('Email sending error:', error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

function formatEmailContent(content: string, senderEmail: string): string {
    // Convert plain text email to HTML and replace [Your Name] with sender email
    return content
        .split('\n')
        .map(line => {
            if (line.startsWith('Subject:')) {
                return ''; // Remove subject line from content as it's handled separately
            }
            if (line.trim() === '') {
                return '<br>';
            }
            // Replace [Your Name] placeholder with sender email
            const processedLine = line.replace(/\[Your Name\]/g, senderEmail);
            return `<p>${processedLine}</p>`;
        })
        .filter(line => line !== '')
        .join('');
}
