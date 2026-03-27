/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "tvktools"

interface AdminNotificationProps {
  subject?: string
  messageBody?: string
  recipientName?: string
}

const AdminNotificationEmail = ({ subject, messageBody, recipientName }: AdminNotificationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{subject || `A message from ${SITE_NAME}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={logoText}>⚡ {SITE_NAME}</Text>
        </Section>
        <Section style={content}>
          <Heading style={h1}>{subject || 'Notification'}</Heading>
          {recipientName && (
            <Text style={text}>Hi {recipientName},</Text>
          )}
          <Text style={messageStyle}>
            {messageBody || 'You have a new notification from the admin team.'}
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            This message was sent by the {SITE_NAME} team.
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
  previewData: { subject: 'Important Update', messageBody: 'This is a test notification from the admin.', recipientName: 'Jane' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Space Mono', 'Courier New', Courier, monospace" }
const container = { padding: '0', maxWidth: '480px', margin: '0 auto' }
const header = { backgroundColor: '#0a0a14', padding: '24px 25px', textAlign: 'center' as const }
const logoText = { color: '#00ffff', fontSize: '20px', fontWeight: 'bold' as const, fontFamily: "'Orbitron', 'Space Mono', monospace", margin: '0', letterSpacing: '2px' }
const content = { padding: '30px 25px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#0a0a14', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#4a6a6a', lineHeight: '1.6', margin: '0 0 12px' }
const messageStyle = { fontSize: '14px', color: '#333333', lineHeight: '1.7', margin: '0 0 20px', whiteSpace: 'pre-wrap' as const }
const hr = { borderColor: '#e0e0e0', margin: '20px 0' }
const footer = { fontSize: '12px', color: '#999999', margin: '0', lineHeight: '1.5' }
