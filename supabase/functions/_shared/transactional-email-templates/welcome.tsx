/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Link, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "tvktools"
const SITE_URL = "https://tvktools.lovable.app"

interface WelcomeEmailProps {
  name?: string
}

const WelcomeEmail = ({ name }: WelcomeEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Welcome to {SITE_NAME} — your toolkit awaits!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={logoText}>⚡ {SITE_NAME}</Text>
        </Section>
        <Section style={content}>
          <Heading style={h1}>
            {name ? `Welcome, ${name}!` : 'Welcome aboard!'}
          </Heading>
          <Text style={text}>
            Thanks for joining <strong>{SITE_NAME}</strong>. You now have access to 50+ powerful tools — all in one place.
          </Text>
          <Text style={text}>
            Start exploring tools, earn points, and supercharge your workflow.
          </Text>
          <Button style={button} href={`${SITE_URL}/tools`}>
            Explore Tools
          </Button>
        </Section>
        <Text style={footer}>
          If you have questions, visit our documentation or contact support.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: WelcomeEmail,
  subject: 'Welcome to tvktools!',
  displayName: 'Welcome email',
  previewData: { name: 'Jane' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Space Mono', 'Courier New', Courier, monospace" }
const container = { padding: '0', maxWidth: '480px', margin: '0 auto' }
const header = { backgroundColor: '#0a0a14', padding: '24px 25px', textAlign: 'center' as const }
const logoText = { color: '#00ffff', fontSize: '20px', fontWeight: 'bold' as const, fontFamily: "'Orbitron', 'Space Mono', monospace", margin: '0', letterSpacing: '2px' }
const content = { padding: '30px 25px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#0a0a14', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#4a6a6a', lineHeight: '1.6', margin: '0 0 20px' }
const button = { backgroundColor: '#0a0a14', color: '#00ffff', fontSize: '14px', borderRadius: '4px', padding: '12px 24px', textDecoration: 'none', fontFamily: "'Space Mono', monospace", fontWeight: 'bold' as const, letterSpacing: '1px' }
const footer = { fontSize: '12px', color: '#999999', margin: '0', padding: '0 25px 25px', lineHeight: '1.5' }
