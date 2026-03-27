/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as welcomeEmail } from './welcome.tsx'
import { template as purchaseApproved } from './purchase-approved.tsx'
import { template as purchaseRejected } from './purchase-rejected.tsx'
import { template as contactConfirmation } from './contact-confirmation.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'welcome': welcomeEmail,
  'purchase-approved': purchaseApproved,
  'purchase-rejected': purchaseRejected,
  'contact-confirmation': contactConfirmation,
}
