/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You've been invited to join {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={logoText}>⚡ {siteName}</Text>
        </Section>
        <Section style={content}>
          <Heading style={h1}>You've been invited</Heading>
          <Text style={text}>
            You've been invited to join{' '}
            <Link href={siteUrl} style={link}>
              <strong>{siteName}</strong>
            </Link>
            . Click the button below to accept the invitation and create your
            account.
          </Text>
          <Button style={button} href={confirmationUrl}>
            Accept Invitation
          </Button>
        </Section>
        <Text style={footer}>
          If you weren't expecting this invitation, you can safely ignore this
          email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Space Mono', 'Courier New', Courier, monospace" }
const container = { padding: '0', maxWidth: '480px', margin: '0 auto' }
const header = { backgroundColor: '#0a0a14', padding: '24px 25px', textAlign: 'center' as const }
const logoText = { color: '#00ffff', fontSize: '20px', fontWeight: 'bold' as const, fontFamily: "'Orbitron', 'Space Mono', monospace", margin: '0', letterSpacing: '2px' }
const content = { padding: '30px 25px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#0a0a14', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#4a6a6a', lineHeight: '1.6', margin: '0 0 20px' }
const link = { color: '#0099a0', textDecoration: 'underline' }
const button = { backgroundColor: '#0a0a14', color: '#00ffff', fontSize: '14px', borderRadius: '4px', padding: '12px 24px', textDecoration: 'none', fontFamily: "'Space Mono', monospace", fontWeight: 'bold' as const, letterSpacing: '1px' }
const footer = { fontSize: '12px', color: '#999999', margin: '0', padding: '0 25px 25px', lineHeight: '1.5' }
