/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "tvktools"
const SITE_URL = "https://tvktools.lovable.app"

interface PurchaseApprovedProps {
  packageName?: string
  pointsAmount?: number
  priceInr?: number
}

const PurchaseApprovedEmail = ({ packageName, pointsAmount, priceInr }: PurchaseApprovedProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your points purchase has been approved!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={logoText}>⚡ {SITE_NAME}</Text>
        </Section>
        <Section style={content}>
          <Heading style={h1}>Purchase Approved ✅</Heading>
          <Text style={text}>
            Great news! Your payment has been verified and your points have been credited.
          </Text>
          {packageName && (
            <Section style={detailsBox}>
              <Text style={detailText}>📦 Package: <strong>{packageName}</strong></Text>
              {pointsAmount && <Text style={detailText}>💎 Points: <strong>{pointsAmount}</strong></Text>}
              {priceInr && <Text style={detailText}>💰 Amount: <strong>₹{priceInr}</strong></Text>}
            </Section>
          )}
          <Text style={text}>
            Your points are ready to use. Start exploring premium tools now!
          </Text>
          <Button style={button} href={`${SITE_URL}/dashboard`}>
            View Dashboard
          </Button>
        </Section>
        <Text style={footer}>
          Thank you for your purchase!
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: PurchaseApprovedEmail,
  subject: 'Your points purchase has been approved!',
  displayName: 'Purchase approved',
  previewData: { packageName: 'Standard', pointsAmount: 700, priceInr: 499 },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Space Mono', 'Courier New', Courier, monospace" }
const container = { padding: '0', maxWidth: '480px', margin: '0 auto' }
const header = { backgroundColor: '#0a0a14', padding: '24px 25px', textAlign: 'center' as const }
const logoText = { color: '#00ffff', fontSize: '20px', fontWeight: 'bold' as const, fontFamily: "'Orbitron', 'Space Mono', monospace", margin: '0', letterSpacing: '2px' }
const content = { padding: '30px 25px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#0a0a14', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#4a6a6a', lineHeight: '1.6', margin: '0 0 20px' }
const detailsBox = { backgroundColor: '#f0fafa', borderRadius: '4px', padding: '16px', marginBottom: '20px', border: '1px solid #d0e8e8' }
const detailText = { fontSize: '14px', color: '#0a0a14', margin: '0 0 8px', lineHeight: '1.5' }
const button = { backgroundColor: '#0a0a14', color: '#00ffff', fontSize: '14px', borderRadius: '4px', padding: '12px 24px', textDecoration: 'none', fontFamily: "'Space Mono', monospace", fontWeight: 'bold' as const, letterSpacing: '1px' }
const footer = { fontSize: '12px', color: '#999999', margin: '0', padding: '0 25px 25px', lineHeight: '1.5' }
