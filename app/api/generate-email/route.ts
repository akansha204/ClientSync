import { NextRequest, NextResponse } from "next/server";
import axios from 'axios';

interface EmailGenerationRequest {
    clientName: string;
    clientEmail: string;
    clientCompany: string;
    emailType: string;
    customType?: string;
    clientNotes?: string;
}

export async function POST(req: NextRequest) {
    try {
        const {
            clientName,
            clientEmail,
            clientCompany,
            emailType,
            customType,
            clientNotes
        }: EmailGenerationRequest = await req.json();

        // Validate required fields
        if (!clientName || !clientEmail || !emailType) {
            return NextResponse.json(
                { error: "Missing required fields: clientName, clientEmail, emailType" },
                { status: 400 }
            );
        }

        // Check for Groq API key
        if (!process.env.GROQ_API_KEY) {
            return NextResponse.json(
                { error: "Groq API key not configured" },
                { status: 500 }
            );
        }

        // Determine the email type for the prompt
        const finalEmailType = emailType === 'other' ? (customType || 'general') : emailType;

        // Create the prompt for Groq
        const prompt = createEmailPrompt(clientName, clientCompany, finalEmailType, clientNotes);

        // Call Groq API
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: 'llama3-8b-8192', // Fast and good model for email generation
            messages: [
                {
                    role: 'system',
                    content: 'You are a professional email writer. Generate clear, concise, and professional emails. Always include a subject line at the beginning.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 500,
            temperature: 0.7,
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        const generatedEmail = response.data.choices[0]?.message?.content;

        if (!generatedEmail) {
            return NextResponse.json(
                { error: "No email content generated" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            email: generatedEmail.trim(),
            usage: response.data.usage
        });

    } catch (error) {
        console.error('Email generation error:', error);

        // Handle axios errors specifically
        if (axios.isAxiosError(error)) {
            console.error('Groq API error:', error.response?.data);
            return NextResponse.json(
                { error: "Failed to generate email with AI" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

function createEmailPrompt(
    clientName: string,
    clientCompany: string,
    emailType: string,
    clientNotes?: string
): string {
    const baseContext = `
Client Information:
- Name: ${clientName}
- Company: ${clientCompany}
${clientNotes ? `- Notes: ${clientNotes}` : ''}

Email Type: ${emailType}
`;

    const typeSpecificInstructions = {
        'Follow-up Email': 'Write a professional follow-up email to check on the status of our previous conversation or proposal.',
        'Check-in Email': 'Write a friendly check-in email to see how the client is doing and if they need any assistance.',
        'Proposal Follow-up': 'Write a follow-up email specifically about a proposal that was sent to the client.',
        'Meeting Request': 'Write an email requesting a meeting or call with the client.',
        'Project Update': 'Write an email providing an update on a current project or work.',
    };

    const instruction = typeSpecificInstructions[emailType as keyof typeof typeSpecificInstructions] ||
        `Write a professional ${emailType.toLowerCase()} email.`;

    return `${baseContext}

Instructions: ${instruction}

Requirements:
- Start with "Subject: [email subject]"
- Use a professional but friendly tone
- Keep it concise (2-3 short paragraphs)
- Include a clear call-to-action
- End with "Best regards," and leave [Your Name] as placeholder
- Personalize it based on the client information provided

Generate the email:`;
}