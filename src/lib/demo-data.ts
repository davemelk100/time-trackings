import type { Client, Invoice, TimeEntry, Subscription, Payable } from "@/lib/project-data"
import type { PasscodeRow } from "@/lib/supabase"
import type { TimeEntryWithClient, SubscriptionWithClient, PayableWithClient } from "@/lib/supabase"

// ===== Demo Clients =====
export const demoClients: Client[] = [
  {
    id: "acme-corp",
    name: "Acme Corp",
    hourlyRate: 85,
    flatRate: null,
    billingPeriodStart: "2026-01-06",
    billingPeriodEnd: null,
  },
  {
    id: "greenfield-labs",
    name: "Greenfield Labs",
    hourlyRate: null,
    flatRate: 4500,
    billingPeriodStart: "2026-01-13",
    billingPeriodEnd: null,
  },
  {
    id: "brightpath-edu",
    name: "Brightpath Education",
    hourlyRate: 70,
    flatRate: null,
    billingPeriodStart: "2026-01-20",
    billingPeriodEnd: null,
  },
]

// ===== Demo Time Entries =====
const acmeEntries: TimeEntry[] = [
  { id: "d-te-1", date: "2026-01-06", startTime: "09:00", endTime: "12:30", timeRange: "9:00 AM - 12:30 PM", totalHours: 3.5, tasks: "Sprint planning and backlog grooming for Q1 roadmap", notes: "", attachments: [], links: [] },
  { id: "d-te-2", date: "2026-01-08", startTime: "10:00", endTime: "15:00", timeRange: "10:00 AM - 3:00 PM", totalHours: 5, tasks: "Built authentication flow with OAuth2 and session management", notes: "Using NextAuth.js", attachments: [], links: [] },
  { id: "d-te-3", date: "2026-01-13", startTime: "13:00", endTime: "17:30", timeRange: "1:00 PM - 5:30 PM", totalHours: 4.5, tasks: "Designed and implemented dashboard analytics components", notes: "", attachments: [], links: [] },
  { id: "d-te-4", date: "2026-01-15", startTime: "09:30", endTime: "13:00", timeRange: "9:30 AM - 1:00 PM", totalHours: 3.5, tasks: "API integration for real-time data feeds and websocket setup", notes: "Websocket reconnection logic added", attachments: [], links: [] },
  { id: "d-te-5", date: "2026-01-20", startTime: "10:00", endTime: "16:00", timeRange: "10:00 AM - 4:00 PM", totalHours: 6, tasks: "Database schema migration and data integrity validation", notes: "", attachments: [], links: [] },
  { id: "d-te-6", date: "2026-01-22", startTime: "14:00", endTime: "18:00", timeRange: "2:00 PM - 6:00 PM", totalHours: 4, tasks: "Code review, bug fixes, and performance optimizations", notes: "Reduced API response time by 40%", attachments: [], links: [] },
  { id: "d-te-7", date: "2026-01-27", startTime: "09:00", endTime: "11:30", timeRange: "9:00 AM - 11:30 AM", totalHours: 2.5, tasks: "Client demo prep and staging environment deployment", notes: "", attachments: [], links: [] },
  { id: "d-te-8", date: "2026-02-03", startTime: "10:00", endTime: "14:30", timeRange: "10:00 AM - 2:30 PM", totalHours: 4.5, tasks: "Implemented role-based access control and permissions system", notes: "", attachments: [], links: [] },
  { id: "d-te-9", date: "2026-02-10", startTime: "11:00", endTime: "16:00", timeRange: "11:00 AM - 4:00 PM", totalHours: 5, tasks: "End-to-end testing suite and CI/CD pipeline configuration", notes: "Using Playwright + GitHub Actions", attachments: [], links: [] },
]

const greenfieldEntries: TimeEntry[] = [
  { id: "d-te-10", date: "2026-01-13", startTime: "", endTime: "", timeRange: "", totalHours: 0, tasks: "Initial project kickoff and requirements gathering", notes: "Flat rate engagement", attachments: [], links: [] },
  { id: "d-te-11", date: "2026-01-16", startTime: "", endTime: "", timeRange: "", totalHours: 0, tasks: "UX wireframes and component library setup with Figma handoff", notes: "", attachments: [], links: [] },
  { id: "d-te-12", date: "2026-01-20", startTime: "", endTime: "", timeRange: "", totalHours: 0, tasks: "React component development for patient intake forms", notes: "", attachments: [], links: [] },
  { id: "d-te-13", date: "2026-01-27", startTime: "", endTime: "", timeRange: "", totalHours: 0, tasks: "HIPAA-compliant data handling and encryption implementation", notes: "", attachments: [], links: [] },
  { id: "d-te-14", date: "2026-02-03", startTime: "", endTime: "", timeRange: "", totalHours: 0, tasks: "Integration testing with lab management API endpoints", notes: "", attachments: [], links: [] },
  { id: "d-te-15", date: "2026-02-10", startTime: "", endTime: "", timeRange: "", totalHours: 0, tasks: "Responsive design polish and accessibility audit (WCAG 2.1 AA)", notes: "", attachments: [], links: [] },
  { id: "d-te-16", date: "2026-02-17", startTime: "", endTime: "", timeRange: "", totalHours: 0, tasks: "Deployment to staging and QA review with stakeholders", notes: "", attachments: [], links: [] },
]

const brightpathEntries: TimeEntry[] = [
  { id: "d-te-17", date: "2026-01-20", startTime: "09:00", endTime: "12:00", timeRange: "9:00 AM - 12:00 PM", totalHours: 3, tasks: "Learning management system architecture and database design", notes: "", attachments: [], links: [] },
  { id: "d-te-18", date: "2026-01-23", startTime: "13:00", endTime: "17:00", timeRange: "1:00 PM - 5:00 PM", totalHours: 4, tasks: "Course enrollment and progress tracking module", notes: "", attachments: [], links: [] },
  { id: "d-te-19", date: "2026-01-28", startTime: "10:00", endTime: "14:00", timeRange: "10:00 AM - 2:00 PM", totalHours: 4, tasks: "Video player integration with bookmark and resume features", notes: "Using Video.js", attachments: [], links: [] },
  { id: "d-te-20", date: "2026-02-04", startTime: "09:30", endTime: "13:30", timeRange: "9:30 AM - 1:30 PM", totalHours: 4, tasks: "Quiz and assessment engine with auto-grading logic", notes: "", attachments: [], links: [] },
  { id: "d-te-21", date: "2026-02-06", startTime: "14:00", endTime: "17:30", timeRange: "2:00 PM - 5:30 PM", totalHours: 3.5, tasks: "Student dashboard with progress charts and certificates", notes: "", attachments: [], links: [] },
  { id: "d-te-22", date: "2026-02-11", startTime: "10:00", endTime: "15:00", timeRange: "10:00 AM - 3:00 PM", totalHours: 5, tasks: "Stripe payment integration for course purchases", notes: "", attachments: [], links: [] },
  { id: "d-te-23", date: "2026-02-13", startTime: "11:00", endTime: "14:00", timeRange: "11:00 AM - 2:00 PM", totalHours: 3, tasks: "Email notification system for enrollment confirmations", notes: "", attachments: [], links: [] },
  { id: "d-te-24", date: "2026-02-18", startTime: "09:00", endTime: "12:30", timeRange: "9:00 AM - 12:30 PM", totalHours: 3.5, tasks: "Admin panel for content management and user analytics", notes: "", attachments: [], links: [] },
]

export const demoTimeEntries: Record<string, TimeEntry[]> = {
  "acme-corp": acmeEntries,
  "greenfield-labs": greenfieldEntries,
  "brightpath-edu": brightpathEntries,
}

// ===== Demo Subscriptions =====
const acmeSubs: Subscription[] = [
  { id: "d-sub-1", name: "AWS (EC2 + S3)", category: "Hosting & Infrastructure", billingCycle: "monthly", amount: 89, renewalDate: "2026-03-01", notes: "Production hosting", attachments: [], links: [] },
  { id: "d-sub-2", name: "GitHub Team", category: "Development Tools", billingCycle: "monthly", amount: 25, renewalDate: "2026-03-01", notes: "5 seats", attachments: [], links: [] },
  { id: "d-sub-3", name: "Vercel Pro", category: "Hosting & Infrastructure", billingCycle: "monthly", amount: 20, renewalDate: "2026-03-01", notes: "Frontend deployment", attachments: [], links: [] },
]

const greenfieldSubs: Subscription[] = [
  { id: "d-sub-4", name: "Figma Professional", category: "Design Tools", billingCycle: "monthly", amount: 15, renewalDate: "2026-03-01", notes: "Design collaboration", attachments: [], links: [] },
  { id: "d-sub-5", name: "Supabase Pro", category: "Database", billingCycle: "monthly", amount: 25, renewalDate: "2026-03-01", notes: "Backend and auth", attachments: [], links: [] },
]

const brightpathSubs: Subscription[] = [
  { id: "d-sub-6", name: "Vercel Pro", category: "Hosting & Infrastructure", billingCycle: "monthly", amount: 20, renewalDate: "2026-03-01", notes: "LMS hosting", attachments: [], links: [] },
  { id: "d-sub-7", name: "Mux Video", category: "Media Services", billingCycle: "monthly", amount: 45, renewalDate: "2026-03-01", notes: "Video streaming", attachments: [], links: [] },
  { id: "d-sub-8", name: "SendGrid", category: "Email Services", billingCycle: "monthly", amount: 19.95, renewalDate: "2026-03-01", notes: "Transactional email", attachments: [], links: [] },
  { id: "d-sub-9", name: "Sentry", category: "Monitoring", billingCycle: "annual", amount: 312, renewalDate: "2027-01-15", notes: "Error tracking", attachments: [], links: [] },
]

export const demoSubscriptions: Record<string, Subscription[]> = {
  "acme-corp": acmeSubs,
  "greenfield-labs": greenfieldSubs,
  "brightpath-edu": brightpathSubs,
}

// ===== Demo Payables =====
const acmePayables: Payable[] = [
  { id: "d-pay-1", description: "SSL certificate renewal", amount: 79, date: "2026-01-10", paid: true, paidDate: "2026-01-10", notes: "DigiCert Wildcard", attachments: [], links: [] },
  { id: "d-pay-2", description: "Stock photo license pack", amount: 199, date: "2026-01-18", paid: true, paidDate: "2026-01-18", notes: "Shutterstock annual", attachments: [], links: [] },
  { id: "d-pay-3", description: "Domain registration (acmecorp.io)", amount: 35, date: "2026-02-01", paid: false, paidDate: "", notes: "", attachments: [], links: [] },
]

const greenfieldPayables: Payable[] = [
  { id: "d-pay-4", description: "HIPAA compliance audit", amount: 450, date: "2026-01-25", paid: true, paidDate: "2026-01-25", notes: "Third-party security assessment", attachments: [], links: [] },
  { id: "d-pay-5", description: "Custom icon set", amount: 120, date: "2026-02-05", paid: false, paidDate: "", notes: "Noun Project license", attachments: [], links: [] },
]

const brightpathPayables: Payable[] = [
  { id: "d-pay-6", description: "Stripe processing fees", amount: 87.50, date: "2026-01-31", paid: true, paidDate: "2026-01-31", notes: "January transactions", attachments: [], links: [] },
  { id: "d-pay-7", description: "Content proofreading service", amount: 225, date: "2026-02-08", paid: false, paidDate: "", notes: "10 course descriptions", attachments: [], links: [] },
  { id: "d-pay-8", description: "Accessibility audit tool license", amount: 149, date: "2026-02-12", paid: false, paidDate: "", notes: "axe DevTools Pro", attachments: [], links: [] },
]

export const demoPayables: Record<string, Payable[]> = {
  "acme-corp": acmePayables,
  "greenfield-labs": greenfieldPayables,
  "brightpath-edu": brightpathPayables,
}

// ===== Demo Invoices =====
export const demoInvoices: Record<string, Invoice[]> = {
  "acme-corp": [
    {
      id: "d-inv-1",
      clientId: "acme-corp",
      invoiceNumber: "INV-2025-12-ACME",
      periodStart: "2025-12-01",
      periodEnd: "2025-12-31",
      totalTime: 2720,
      totalSubscriptions: 1608,
      totalPayables: 250,
      grandTotal: 4078,
      notes: "December 2025 - Initial discovery and architecture phase",
      createdAt: "2026-01-02T00:00:00Z",
      paid: true,
      paidDate: "2026-01-10",
    },
  ],
  "greenfield-labs": [],
  "brightpath-edu": [
    {
      id: "d-inv-2",
      clientId: "brightpath-edu",
      invoiceNumber: "INV-2025-12-BP",
      periodStart: "2025-12-08",
      periodEnd: "2025-12-31",
      totalTime: 1540,
      totalSubscriptions: 1019.40,
      totalPayables: 150,
      grandTotal: 2409.40,
      notes: "December 2025 - LMS foundation and course module prototyping",
      createdAt: "2026-01-03T00:00:00Z",
      paid: false,
      paidDate: "",
    },
  ],
}

// ===== Demo Passcodes =====
export const demoPasscodes: PasscodeRow[] = [
  { id: "d-pc-1", code: "10001", role: "admin", client_id: null, label: "Admin Access", created_at: "2026-01-01T00:00:00Z" },
  { id: "d-pc-2", code: "20001", role: "client", client_id: "acme-corp", label: "Acme Corp", created_at: "2026-01-01T00:00:00Z" },
  { id: "d-pc-3", code: "20002", role: "client", client_id: "greenfield-labs", label: "Greenfield Labs", created_at: "2026-01-01T00:00:00Z" },
  { id: "d-pc-4", code: "20003", role: "client", client_id: "brightpath-edu", label: "Brightpath Education", created_at: "2026-01-01T00:00:00Z" },
]

// ===== All invoices (for archives page) =====
export const demoAllInvoices: Invoice[] = [
  ...demoInvoices["acme-corp"],
  ...demoInvoices["brightpath-edu"],
]

// ===== Flat arrays for reports page =====
export const demoAllTimeEntries: TimeEntryWithClient[] = [
  ...acmeEntries.map((e) => ({ ...e, clientId: "acme-corp" })),
  ...greenfieldEntries.map((e) => ({ ...e, clientId: "greenfield-labs" })),
  ...brightpathEntries.map((e) => ({ ...e, clientId: "brightpath-edu" })),
]

export const demoAllSubscriptions: SubscriptionWithClient[] = [
  ...acmeSubs.map((s) => ({ ...s, clientId: "acme-corp" })),
  ...greenfieldSubs.map((s) => ({ ...s, clientId: "greenfield-labs" })),
  ...brightpathSubs.map((s) => ({ ...s, clientId: "brightpath-edu" })),
]

export const demoAllPayables: PayableWithClient[] = [
  ...acmePayables.map((p) => ({ ...p, clientId: "acme-corp" })),
  ...greenfieldPayables.map((p) => ({ ...p, clientId: "greenfield-labs" })),
  ...brightpathPayables.map((p) => ({ ...p, clientId: "brightpath-edu" })),
]
