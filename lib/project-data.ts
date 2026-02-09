// ===== Cygnet Institute SOW – All project data =====

export const projectOverview = {
  title: "Cygnet Institute Website & Mobile Application Modernization",
  client: "Cygnet Institute",
  clientContact: "ted@CygnetInstitute.org",
  consultant: "David Melkonian",
  consultantEntity: "Melkonian Industries LLC",
  siteUrl: "https://cygnetinstitute.org",
  governingLaw: "Michigan",
  hourlyRate: 70,
  changeOrderRate: 70,
  projectDuration: "10–14 weeks",
  goals: [
    "Improve search visibility & Google Ads performance",
    "Increase organizational awareness & credibility",
    "Improve donation and fundraising outcomes",
    "Boost program enrollment & engagement",
    "Enhance mobile usability and reach",
  ],
}

export interface PhaseDeliverable {
  category: string
  items: string[]
}

export interface PaymentMilestone {
  label: string
  percentage: number
  amount: number
  trigger: string
}

export interface ProjectPhase {
  id: string
  name: string
  fixedCost: number
  baseHours?: number
  timeline: string
  scope: PhaseDeliverable[]
  deliverables: string[]
  payments: PaymentMilestone[]
}

export const phases: ProjectPhase[] = [
  {
    id: "website",
    name: "Phase 1 – Website Modernization",
    fixedCost: 8750,
    baseHours: 125,
    timeline: "5–7 weeks",
    scope: [
      {
        category: "Discovery & Strategy",
        items: [
          "Stakeholder discovery sessions",
          "UX, SEO, performance, and donation funnel audit",
          "Technical architecture planning",
          "Final implementation roadmap",
        ],
      },
      {
        category: "UX & Visual Design",
        items: [
          "Homepage redesign",
          "Donate page optimization",
          "About/Mission page redesign",
          "Program page templates",
          "Event page templates",
          "Mobile-first layouts",
          "Accessibility-first design (WCAG 2.1 AA target)",
        ],
      },
      {
        category: "Front-End Development",
        items: [
          "Responsive UI implementation",
          "Shared component library",
          "Performance optimization",
          "SEO-friendly architecture",
          "Accessibility compliance improvements",
        ],
      },
      {
        category: "Donation & Fundraising System",
        items: [
          "Stripe integration",
          "One-time & recurring donations",
          "Conversion tracking",
          "Secure backend handling",
        ],
      },
      {
        category: "Analytics & SEO Setup",
        items: [
          "Google Analytics 4",
          "Google Tag Manager",
          "Conversion tracking",
          "SEO foundation setup",
          "Google Ads readiness configuration",
        ],
      },
      {
        category: "QA, Testing & Launch",
        items: [
          "Cross-browser testing",
          "Accessibility testing",
          "Performance tuning",
          "Production deployment",
        ],
      },
    ],
    deliverables: [
      "Fully modernized public website",
      "Donation-optimized fundraising flows",
      "Analytics & conversion tracking",
      "CMS-driven content system",
      "Deployment documentation",
    ],
    payments: [
      { label: "Project Start", percentage: 40, amount: 3500, trigger: "At project start" },
      { label: "Design Approval", percentage: 30, amount: 2625, trigger: "At design approval" },
      { label: "Deployment", percentage: 30, amount: 2625, trigger: "At production deployment" },
    ],
  },
  {
    id: "mobile",
    name: "Phase 2 – Mobile Application Development",
    fixedCost: 9500,
    timeline: "8–10 weeks",
    scope: [
      {
        category: "UX & UI Design",
        items: [
          "Mobile-first UX flows",
          "iOS & Android layouts",
          "Accessibility considerations",
          "Donation experience optimization",
          "Program & event browsing flows",
        ],
      },
      {
        category: "Application Development (Cross-Platform)",
        items: [
          "Expo (React Native + TypeScript)",
          "Shared UI & logic with website",
          "Native navigation",
          "Performance optimization",
        ],
      },
      {
        category: "Core Features",
        items: [
          "Homepage & CMS-driven content",
          "Program listings",
          "Event listings",
          "Secure donation flow (Stripe)",
          "Contact & inquiry forms",
          "Push notification framework (foundation)",
        ],
      },
      {
        category: "Backend Integration",
        items: [
          "Supabase database integration",
          "Secure API access",
          "Data schema design",
          "Stripe server-side payment handling",
        ],
      },
      {
        category: "Analytics & Tracking",
        items: [
          "Engagement tracking",
          "Donation funnel analytics",
          "Event tracking",
        ],
      },
      {
        category: "QA, Testing & Deployment",
        items: [
          "iOS & Android testing",
          "Expo EAS build pipelines",
          "App Store & Play Store submission support",
          "Production release packaging",
        ],
      },
    ],
    deliverables: [
      "Production-ready iOS application",
      "Production-ready Android application",
      "Unified codebase shared with website",
      "Deployment documentation",
      "Admin instructions",
    ],
    payments: [
      { label: "Project Start", percentage: 40, amount: 3800, trigger: "At project start" },
      { label: "Design Approval", percentage: 30, amount: 2850, trigger: "At design approval" },
      { label: "Store Submission", percentage: 30, amount: 2850, trigger: "At App Store & Play Store submission" },
    ],
  },
]

export const socialMediaCampaign = {
  totalAnnual: 9700,
  effectiveMonthly: 808,
  phases: [
    {
      name: "Strategy & Setup (One-Time)",
      cost: 1450,
      scope: [
        "Audience research",
        "Platform strategy",
        "Messaging framework",
        "Brand voice & style guide",
        "90-day content calendar",
        "KPI definitions",
      ],
    },
    {
      name: "Monthly Campaign Execution",
      cost: 640,
      annualCost: 7680,
      scope: [
        "8–12 posts per month",
        "Facebook, Instagram, LinkedIn",
        "Engagement monitoring & responses",
        "Monthly analytics reporting",
        "Quarterly strategy tuning",
      ],
    },
    {
      name: "Fundraising Campaign Bursts (Quarterly)",
      cost: 570,
      scope: [
        "Campaign creative",
        "Messaging strategy",
        "Funnel optimization",
      ],
    },
  ],
  platforms: {
    primary: ["Facebook", "Instagram", "LinkedIn"],
    secondary: ["YouTube Shorts", "TikTok (short-form video, Phase 2)"],
  },
  kpis: [
    { objective: "Awareness", metric: "Reach, impressions, follower growth" },
    { objective: "Engagement", metric: "Likes, shares, comments, saves" },
    { objective: "Fundraising", metric: "Donation clicks, conversions" },
    { objective: "Programs", metric: "Form submissions, signups" },
  ],
  expectedROI: [
    { metric: "Website traffic", goal: "+30–60%" },
    { metric: "Engagement", goal: "+80–150%" },
    { metric: "Donation conversions", goal: "+20–40%" },
    { metric: "Program signups", goal: "+25–50%" },
  ],
}

export const maintenance = {
  monthlyFee: 120,
  annualFee: 1440,
  includes: [
    "Security updates & patching",
    "CMS updates",
    "Backup monitoring",
    "Uptime monitoring",
    "Emergency technical fixes",
    "Minor content updates",
    "Light SEO & analytics checks",
    "Mobile application monitoring",
  ],
}

export const thirdPartyCosts = {
  monthlyRange: { low: 125, high: 250 },
  annualRange: { low: 1500, high: 3000 },
  categories: [
    "Hosting & Infrastructure",
    "CMS (Sanity)",
    "Supabase",
    "Stripe",
    "Analytics & Monitoring",
    "Security monitoring",
  ],
}

export const investmentSummary = [
  { component: "Website Development", cost: "$8,750", type: "one-time" },
  { component: "Mobile App Development", cost: "$9,500", type: "one-time" },
  { component: "Total One-Time Cost", cost: "$18,250", type: "one-time" },
  { component: "Maintenance (Annual)", cost: "$1,440", type: "recurring" },
  { component: "Software Subscriptions (Annual)", cost: "$1,500 – $3,000", type: "recurring" },
  { component: "Social Media Campaign (Annual)", cost: "$9,700", type: "recurring" },
]

export const timelinePhases = [
  { phase: "Website Phase", duration: "5–7 weeks" },
  { phase: "Mobile App Phase", duration: "8–10 weeks" },
  { phase: "Total Program", duration: "13–17 weeks" },
]

export interface EnvVarGroup {
  category: string
  vars: { name: string; location: string; note?: string }[]
}

export const envVarGroups: EnvVarGroup[] = [
  {
    category: "Sanity CMS",
    vars: [
      { name: "SANITY_PROJECT_ID / EXPO_PUBLIC_SANITY_PROJECT_ID", location: "Sanity Dashboard > Project > Settings" },
      { name: "SANITY_DATASET", location: "Sanity Dashboard > Project > Datasets tab" },
      { name: "SANITY_API_VERSION", location: "YYYY-MM-DD format (e.g., 2024-01-01)" },
      { name: "SANITY_API_TOKEN", location: "Sanity Dashboard > Project > API > Tokens", note: "Read permissions" },
    ],
  },
  {
    category: "Supabase",
    vars: [
      { name: "SUPABASE_URL / EXPO_PUBLIC_SUPABASE_URL", location: "Supabase Dashboard > Settings > API > Project URL" },
      { name: "SUPABASE_ANON_KEY / EXPO_PUBLIC_SUPABASE_ANON_KEY", location: "Supabase Dashboard > Settings > API > anon public" },
      { name: "SUPABASE_SERVICE_ROLE_KEY", location: "Supabase Dashboard > Settings > API > service_role secret", note: "Keep secret - server-side only" },
    ],
  },
  {
    category: "Stripe",
    vars: [
      { name: "STRIPE_PUBLISHABLE_KEY / EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY", location: "Stripe Dashboard > Developers > API Keys" },
      { name: "STRIPE_SECRET_KEY", location: "Stripe Dashboard > Developers > API Keys", note: "Keep secret - server-side only" },
      { name: "STRIPE_WEBHOOK_SECRET", location: "Stripe Dashboard > Developers > Webhooks > Signing Secret" },
    ],
  },
  {
    category: "Web Analytics",
    vars: [
      { name: "NEXT_PUBLIC_GA_MEASUREMENT_ID", location: "Google Analytics > Admin > Data Streams (G-XXXXXXXXXX)" },
      { name: "NEXT_PUBLIC_GTM_ID", location: "Google Tag Manager > Container Settings (GTM-XXXXXXX)" },
    ],
  },
  {
    category: "Mobile Analytics",
    vars: [
      { name: "EXPO_PUBLIC_POSTHOG_API_KEY", location: "PostHog > Project Settings > Project API Key" },
      { name: "EXPO_PUBLIC_POSTHOG_HOST", location: "https://app.posthog.com or self-hosted URL" },
    ],
  },
  {
    category: "App Config",
    vars: [
      { name: "NEXT_PUBLIC_SITE_URL / EXPO_PUBLIC_SITE_URL", location: "Production domain (e.g., https://cygnetinstitute.org)" },
    ],
  },
  {
    category: "Deployment",
    vars: [
      { name: "VERCEL_URL", location: "Auto-populated by Vercel deployment" },
      { name: "EAS_PROJECT_ID", location: "Expo Dashboard > Project > Project ID (in eas.json)" },
    ],
  },
]

export const clientResponses = {
  submissionDate: "1/26/26, 1:38 PM EST",
  respondentEmail: "ted@CygnetInstitute.org",
  answers: [
    {
      question: "Main goal of this work?",
      selected: [
        "Primarily improve search visibility and Google Ads performance",
        "Increase awareness and credibility of the organization",
        "Increase donations and fundraising effectiveness",
        "Improve usability and experience for visitors",
        "Support program enrollment or engagement",
      ],
    },
    { question: "Do you want a new design?", selected: ["No – current design is fine"] },
    { question: "Do you need new functionality?", selected: ["Yes – event registration and management"] },
    { question: "Google Nonprofit Ads Program?", selected: ["Yes – approved but not yet active"] },
    { question: "Satisfied with current hosting?", selected: ["We would like recommendations"] },
    { question: "Administrative control level?", selected: ["Minimal control – we prefer you maintain the site"] },
    { question: "Interest in AI features?", selected: ["Yes – AI chatbot for visitors"] },
    { question: "Need a mobile app?", selected: ["Yes – full mobile app"] },
    { question: "Currently use analytics?", selected: ["No – no meaningful analytics"] },
    { question: "Materials for board funding?", selected: ["Combination of the above"] },
    { question: "Sensitive data transmitted?", selected: ["Yes – personal but non-medical data"] },
    { question: "Security certifications required?", selected: ["None currently required"] },
    { question: "E-commerce / payment solution?", selected: ["Yes – donations"] },
  ],
}

// ===== Clients =====
export interface Client {
  id: string
  name: string
  storageKeyPrefix: string
}

export const defaultClients: Client[] = [
  { id: "cygnet", name: "Cygnet Institute", storageKeyPrefix: "cygnet" },
  { id: "client-b", name: "Client B", storageKeyPrefix: "client-b" },
  { id: "client-c", name: "Client C", storageKeyPrefix: "client-c" },
]

// ===== Software Subscriptions =====
export interface Subscription {
  id: string
  name: string
  category: string
  billingCycle: "monthly" | "annual"
  amount: number
  renewalDate: string
  notes: string
}

export const defaultSubscriptions: Subscription[] = [
  {
    id: "1",
    name: "Vercel Pro",
    category: "Hosting & Infrastructure",
    billingCycle: "monthly",
    amount: 20,
    renewalDate: "2025-03-01",
    notes: "Next.js hosting and deployment",
  },
  {
    id: "2",
    name: "Sanity CMS",
    category: "CMS (Sanity)",
    billingCycle: "monthly",
    amount: 15,
    renewalDate: "2025-03-01",
    notes: "Content management system",
  },
  {
    id: "3",
    name: "Supabase Pro",
    category: "Supabase",
    billingCycle: "monthly",
    amount: 25,
    renewalDate: "2025-03-01",
    notes: "Database and auth backend",
  },
  {
    id: "4",
    name: "Stripe",
    category: "Stripe",
    billingCycle: "monthly",
    amount: 0,
    renewalDate: "",
    notes: "Pay-per-transaction, no fixed subscription",
  },
  {
    id: "5",
    name: "PostHog",
    category: "Analytics & Monitoring",
    billingCycle: "monthly",
    amount: 0,
    renewalDate: "",
    notes: "Free tier for analytics",
  },
  {
    id: "6",
    name: "Yoast SEO",
    category: "SEO",
    billingCycle: "annual",
    amount: 118.80,
    renewalDate: "2026-02-06",
    notes: "SEO plugin for WordPress",
  },
]

export const subscriptionCategories = [
  "Hosting & Infrastructure",
  "CMS (Sanity)",
  "Supabase",
  "Stripe",
  "Analytics & Monitoring",
  "SEO",
]

// ===== Attachments =====
export interface Attachment {
  name: string
  path: string
  size: number
  uploadedAt: string
}

// ===== Time Tracking =====
export interface TimeEntry {
  id: string
  date: string
  startTime: string
  endTime: string
  timeRange: string
  totalHours: number
  tasks: string
  notes: string
  attachments: Attachment[]
}

export const defaultTimeEntries: TimeEntry[] = [
  {
    id: "1",
    date: "2025-02-06",
    startTime: "15:30",
    endTime: "21:25",
    timeRange: "3:30 PM - 9:25 PM",
    totalHours: 4.67,
    tasks: "Activated the Yoast SEO plugin. Ran SEO scans on pages. Made text and image updates based on SEO scan findings.",
    notes: "Yoast SEO plugin activated",
    attachments: [],
  },
  {
    id: "2",
    date: "2025-02-08",
    startTime: "12:45",
    endTime: "13:25",
    timeRange: "12:45 PM - 1:25 PM",
    totalHours: 0.67,
    tasks: "Took baseline screenshots of SEO numbers and enabled further Yoast SEO features.",
    notes: "",
    attachments: [],
  },
]

export const timeTrackingMeta = {
  payableTo: "Melkonian Industries LLC",
  rate: 62,
  reportingPeriod: "Feb 1 - Feb 27",
}
