/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "tvktools"
const SITE_URL = "https://tvktools.lovable.app"

interface PurchaseRejectedProps {
  packageName?: string
  reason?: string
}

const PurchaseRejectedEmail = ({ packageName, reason }: PurchaseRejectedProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Update on your points purchase</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={logoText}>⚡ {SITE_NAME}</Text>
        </Section>
        <Section style={content}>
          <Heading style={h1}>Purchase Not Approved</Heading>
          <Text style={text}>
            Unfortunately, we were unable to verify your payment{packageName ? ` for the ${packageName} package` : ''}.
          </Text>
          {reason && (
            <Section style={detailsBox}>
              <Text style={detailText}>Reason: {reason}</Text>
            </Section>
          )}
          <Text style={text}>
            If you believe this is a mistake, please try again or contact our support team.
          </Text>
          <Button style={button} href={`${SITE_URL}/buy-points`}>
            Try Again
          </Button>
        </Section>
        <Text style={footer}>
          Need help? Contact us through the website.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: PurchaseRejectedEmail,
  subject: 'Update on your points purchase',
  displayName: 'Purchase rejected',
  previewData: { packageName: 'Standard', reason: 'Payment could not be verified' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Space Mono', 'Courier New', Courier, monospace" }
const container = { padding: '0', maxWidth: '480px', margin: '0 auto' }
const header = { backgroundColor: '#0a0a14', padding: '24px 25px', textAlign: 'center' as const }
const logoText = { color: '#00ffff', fontSize: '20px', fontWeight: 'bold' as const, fontFamily: "'Orbitron', 'Space Mono', monospace", margin: '0', letterSpacing: '2px' }
const content = { padding: '30px 25px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#0a0a14', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#4a6a6a', lineHeight: '1.6', margin: '0 0 20px' }
const detailsBox = { backgroundColor: '#fff5f5', borderRadius: '4px', padding: '16px', marginBottom: '20px', border: '1px solid #fecaca' }
const detailText = { fontSize: '14px', color: '#991b1b', margin: '0', lineHeight: '1.5' }
const button = { backgroundColor: '#0a0a14', color: '#00ffff', fontSize: '14px', borderRadius: '4px', padding: '12px 24px', textDecoration: 'none', fontFamily: "'Space Mono', monospace", fontWeight: 'bold' as const, letterSpacing: '1px' }
const footer = { fontSize: '12px', color: '#999999', margin: '0', padding: '0 25px 25px', lineHeight: '1.5' }
