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

        // Simulate AI generation delay
        setTimeout(() => {
            const selectedType = emailType === 'other' ? customType : emailTypes.find(t => t.value === emailType)?.label || 'default'

            // Mock generated email based on type
            const mockEmail = generateMockEmail(selectedType, clientName, clientCompany)
            setGeneratedEmail(mockEmail)
            setStep('preview')
            setLoading(false)
        }, 2000)
    }

    const generateMockEmail = (type: string, name: string, company: string) => {
        const templates: { [key: string]: string } = {
            'Follow-up Email': `Subject: Following up on our recent conversation

Hi ${name},

I hope this email finds you well. I wanted to follow up on our recent conversation regarding ${company}'s needs.

I've been thinking about the points we discussed, and I believe we can provide exactly what you're looking for. Would you be available for a brief call this week to discuss the next steps?

Looking forward to hearing from you.

Best regards,
[Your Name]`,

            'Check-in Email': `Subject: Checking in - How are things going?

Hi ${name},

I hope you're doing well! I wanted to reach out and see how things are progressing with ${company}.

Is there anything I can help you with or any questions you might have? I'm always here to support you and ensure everything is running smoothly.

Let me know if you'd like to schedule a quick catch-up call.

Best regards,
[Your Name]`,

            'Proposal Follow-up': `Subject: Following up on our proposal for ${company}

Hi ${name},

I hope you're well. I wanted to follow up on the proposal we sent over for ${company} last week.

Have you had a chance to review it? I'd be happy to answer any questions or discuss any aspects in more detail.

Would you be available for a brief call to go over the proposal together?

Best regards,
[Your Name]`,

            'default': `Subject: Following up with ${company}

Hi ${name},

I hope this email finds you well. I wanted to reach out regarding ${company} and see how I can best support your current needs.

Please let me know if you have any questions or if there's anything specific you'd like to discuss.

Looking forward to connecting soon.

Best regards,
[Your Name]`
        }

        return templates[type] || templates['default']
    }

    const handleSendEmail = async () => {
        setLoading(true)

        // Simulate sending email
        setTimeout(() => {
            setLoading(false)
            setIsOpen(false)
            // Reset state
            setStep('select')
            setEmailType('')
            setCustomType('')
            setGeneratedEmail('')
            setIsEditing(false)

            // Show success message (you can replace this with a toast)
            alert('Email sent successfully!')
        }, 1500)
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
                                    <div><strong>Name:</strong> {clientName}</div>
                                    <div><strong>Email:</strong> {clientEmail}</div>
                                    <div><strong>Company:</strong> {clientCompany}</div>
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
                                <Button variant="outline" onClick={() => setIsOpen(false)}>
                                    Save Draft
                                </Button>
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
