/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Hr, Button,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "tvktools"

interface AdminNotificationProps {
  subject?: string
  heading?: string
  messageBody?: string
  recipientName?: string
  buttonText?: string
  buttonUrl?: string
  footerText?: string
  accentColor?: string
}

const AdminNotificationEmail = ({
  subject,
  heading,
  messageBody,
  recipientName,
  buttonText,
  buttonUrl,
  footerText,
  accentColor = '#00ffff',
}: AdminNotificationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{subject || `A message from ${SITE_NAME}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={{ ...header, backgroundColor: '#0a0a14' }}>
          <Text style={{ ...logoText, color: accentColor }}>⚡ {SITE_NAME}</Text>
        </Section>
        <Section style={content}>
          <Heading style={h1}>{heading || subject || 'Notification'}</Heading>
          {recipientName && (
            <Text style={text}>Hi {recipientName},</Text>
          )}
          <Text style={messageStyle}>
            {messageBody || 'You have a new notification from the admin team.'}
          </Text>
          {buttonText && buttonUrl && (
            <Section style={{ textAlign: 'center' as const, margin: '24px 0' }}>
              <Button
                href={buttonUrl}
                style={{
                  display: 'inline-block',
                  padding: '12px 28px',
                  backgroundColor: accentColor,
                  color: '#0a0a14',
                  fontWeight: 'bold' as const,
                  fontSize: '13px',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  letterSpacing: '1px',
                  fontFamily: "'Space Mono', 'Courier New', Courier, monospace",
                }}
              >
                {buttonText}
              </Button>
            </Section>
          )}
          <Hr style={hr} />
          <Text style={footer}>
            {footerText || `This message was sent by the ${SITE_NAME} team.`}
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: AdminNotificationEmail,
  subject: (data: Record<string, any>) => data.subject || 'Notification from tvktools',
  displayName: 'Admin notification',
  previewData: {
    subject: 'Important Update',
    heading: 'Important Update',
    messageBody: 'This is a test notification from the admin.',
    recipientName: 'Jane',
    buttonText: 'Visit Dashboard',
    buttonUrl: 'https://tvktools.lovable.app/dashboard',
    accentColor: '#00ffff',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Space Mono', 'Courier New', Courier, monospace" }
const container = { padding: '0', maxWidth: '480px', margin: '0 auto' }
const header = { padding: '24px 25px', textAlign: 'center' as const }
const logoText = { fontSize: '20px', fontWeight: 'bold' as const, fontFamily: "'Orbitron', 'Space Mono', monospace", margin: '0', letterSpacing: '2px' }
const content = { padding: '30px 25px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#0a0a14', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#4a6a6a', lineHeight: '1.6', margin: '0 0 12px' }
const messageStyle = { fontSize: '14px', color: '#333333', lineHeight: '1.7', margin: '0 0 20px', whiteSpace: 'pre-wrap' as const }
const hr = { borderColor: '#e0e0e0', margin: '20px 0' }
const footer = { fontSize: '12px', color: '#999999', margin: '0', lineHeight: '1.5' }
