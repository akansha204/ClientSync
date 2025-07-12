"use client"
import React, { useState } from 'react'
import { Mail, Send, Edit, Sparkles } from 'lucide-react'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import axios from 'axios'
import useSupabaseSession from '@/hooks/useSupabaseSession'

interface GenerateEmailDialogProps {
    clientName?: string
    clientEmail?: string
    clientCompany?: string
    trigger?: React.ReactNode
    className?: string
}

const emailTypes = [
    { value: 'follow-up', label: 'Follow-up Email' },
    { value: 'check-in', label: 'Check-in Email' },
    { value: 'proposal', label: 'Proposal Follow-up' },
    { value: 'meeting-request', label: 'Meeting Request' },
    { value: 'project-update', label: 'Project Update' },
    { value: 'other', label: 'Other (Specify)' }
]

export default function GenerateEmailDialog({
    clientName = '',
    clientEmail = '',
    clientCompany = '',
    trigger,
    className
}: GenerateEmailDialogProps) {
    const session = useSupabaseSession()
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [emailType, setEmailType] = useState('')
    const [customType, setCustomType] = useState('')
    const [generatedEmail, setGeneratedEmail] = useState('')
    const [isEditing, setIsEditing] = useState(false)
    const [step, setStep] = useState<'select' | 'generate' | 'preview'>('select')

    const handleGenerateEmail = async () => {
        setLoading(true)
        setStep('generate')

        try {
            const selectedType = emailType === 'other' ? customType : emailTypes.find(t => t.value === emailType)?.label || 'Follow-up Email'

            const response = await axios.post('/api/generate-email', {
                clientName,
                clientEmail,
                clientCompany,
                emailType: selectedType,
                customType: emailType === 'other' ? customType : undefined
            })

            setGeneratedEmail(response.data.email)
            setStep('preview')
        } catch (error) {
            console.error('Error generating email:', error)

            let errorMessage = 'Failed to generate email. Please try again.'

            if (axios.isAxiosError(error)) {
                if (error.response?.status === 500 && error.response?.data?.error?.includes('API key')) {
                    errorMessage = 'AI service not configured. Please contact administrator.'
                } else if (error.response?.status === 400) {
                    errorMessage = 'Invalid request. Please check your input.'
                }
            }

            alert(errorMessage)
            setStep('select')
        } finally {
            setLoading(false)
        }
    }

    const handleSendEmail = async () => {
        setLoading(true)

        try {
            // Check if user is authenticated
            if (!session?.access_token) {
                alert('You must be logged in to send emails.')
                return
            }

            // Extract subject from the generated email
            const emailLines = generatedEmail.split('\n')
            const subjectLine = emailLines.find(line => line.startsWith('Subject:'))
            const subject = subjectLine ? subjectLine.replace('Subject: ', '').trim() : 'Follow-up Email'

            // Remove subject line from content
            const content = generatedEmail.replace(/^Subject:.*\n\n?/, '').trim()

            const response = await axios.post('/api/send-email', {
                to: clientEmail,
                subject: subject,
                content: content,
                clientName: clientName
            }, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            })

            if (response.data.success) {
                alert(`Email sent successfully to ${clientName} from ${session.user?.email}!`)
                setIsOpen(false)
                // Reset state
                setStep('select')
                setEmailType('')
                setCustomType('')
                setGeneratedEmail('')
                setIsEditing(false)
            } else {
                alert('Failed to send email. Please try again.')
            }
        } catch (error) {
            console.error('Error sending email:', error)

            let errorMessage = 'Failed to send email. Please try again.'

            if (axios.isAxiosError(error)) {
                if (error.response?.status === 401) {
                    errorMessage = 'Authentication failed. Please log in again.'
                } else if (error.response?.status === 500 && error.response?.data?.error?.includes('API key')) {
                    errorMessage = 'Email service not configured. Please contact administrator.'
                } else if (error.response?.status === 400) {
                    errorMessage = 'Invalid email data. Please check the email content.'
                } else if (error.response?.data?.error) {
                    errorMessage = error.response.data.error
                }
            }

            alert(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const resetDialog = () => {
        setStep('select')
        setEmailType('')
        setCustomType('')
        setGeneratedEmail('')
        setIsEditing(false)
    }

    const defaultTrigger = (
        <Button variant="outline" className={`w-full ${className}`} size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Generate Follow-up Email
        </Button>
    )

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open)
            if (!open) resetDialog()
        }}>
            <DialogTrigger asChild>
                {trigger || defaultTrigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Generate AI Follow-up Email
                    </DialogTitle>
                    <DialogDescription>
                        {step === 'select' && 'Select the type of email you want to generate'}
                        {step === 'generate' && 'Generating your personalized email...'}
                        {step === 'preview' && `Preview and edit your email for ${clientName}`}
                    </DialogDescription>
                </DialogHeader>

                {/* Step 1: Select Email Type */}
                {step === 'select' && (
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="emailType">Email Type</Label>
                            <Select value={emailType} onValueChange={setEmailType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select email type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {emailTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {emailType === 'other' && (
                            <div className="grid gap-2">
                                <Label htmlFor="customType">Specify Email Type</Label>
                                <Input
                                    id="customType"
                                    placeholder="e.g., Thank you email, Contract reminder..."
                                    value={customType}
                                    onChange={(e) => setCustomType(e.target.value)}
                                />
                            </div>
                        )}

                        {/* Client Info Preview */}
                        <Card>
                            <CardContent className="pt-4">
                                <div className="text-sm text-muted-foreground mb-2">Email will be generated for:</div>
                                <div className="space-y-1">
                                    <div><strong>To:</strong> {clientName} ({clientEmail})</div>
                                    <div><strong>Company:</strong> {clientCompany}</div>
                                    <div><strong>From:</strong> {session?.user?.email || 'Your account'}</div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setIsOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleGenerateEmail}
                                disabled={!emailType || (emailType === 'other' && !customType.trim())}
                            >
                                <Sparkles className="h-4 w-4 mr-2" />
                                Generate Email
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 2: Generating */}
                {step === 'generate' && (
                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <div className="text-center">
                            <div className="font-medium">Generating your email...</div>
                            <div className="text-sm text-muted-foreground mt-1">
                                AI is crafting a personalized message for {clientName}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Preview and Edit */}
                {step === 'preview' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                                To: {clientEmail}
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsEditing(!isEditing)}
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                {isEditing ? 'Preview' : 'Edit'}
                            </Button>
                        </div>

                        {isEditing ? (
                            <Textarea
                                value={generatedEmail}
                                onChange={(e) => setGeneratedEmail(e.target.value)}
                                className="min-h-[300px] font-mono text-sm"
                                placeholder="Edit your email..."
                            />
                        ) : (
                            <Card>
                                <CardContent className="pt-4">
                                    <pre className="whitespace-pre-wrap text-sm font-mono">
                                        {generatedEmail}
                                    </pre>
                                </CardContent>
                            </Card>
                        )}

                        <div className="flex justify-between">
                            <Button variant="outline" onClick={() => setStep('select')}>
                                Back
                            </Button>
                            <div className="space-x-2">
                                {/* <Button variant="outline" onClick={() => setIsOpen(false)}>
                                    Save Draft
                                </Button> */}
                                <Button onClick={handleSendEmail} disabled={loading}>
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4 mr-2" />
                                            Send Email
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
