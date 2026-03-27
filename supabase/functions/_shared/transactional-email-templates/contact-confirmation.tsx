/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "tvktools"

interface ContactConfirmationProps {
  name?: string
}

const ContactConfirmationEmail = ({ name }: ContactConfirmationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Thanks for reaching out to {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={logoText}>⚡ {SITE_NAME}</Text>
        </Section>
        <Section style={content}>
          <Heading style={h1}>
            {name ? `Thank you, ${name}!` : 'Thank you for reaching out!'}
          </Heading>
          <Text style={text}>
            We have received your message and will get back to you as soon as possible.
          </Text>
          <Text style={text}>
            Our team typically responds within 24-48 hours.
          </Text>
        </Section>
        <Text style={footer}>
          Best regards, The {SITE_NAME} Team
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ContactConfirmationEmail,
  subject: 'Thanks for contacting us',
  displayName: 'Contact confirmation',
  previewData: { name: 'Jane' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Space Mono', 'Courier New', Courier, monospace" }
const container = { padding: '0', maxWidth: '480px', margin: '0 auto' }
const header = { backgroundColor: '#0a0a14', padding: '24px 25px', textAlign: 'center' as const }
const logoText = { color: '#00ffff', fontSize: '20px', fontWeight: 'bold' as const, fontFamily: "'Orbitron', 'Space Mono', monospace", margin: '0', letterSpacing: '2px' }
const content = { padding: '30px 25px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#0a0a14', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#4a6a6a', lineHeight: '1.6', margin: '0 0 20px' }
const footer = { fontSize: '12px', color: '#999999', margin: '0', padding: '0 25px 25px', lineHeight: '1.5' }
