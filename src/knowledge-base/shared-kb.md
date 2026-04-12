# FleetMind - Shared Knowledge Base

> This KB is injected into ALL agents. It contains company identity, product overview, key features, and general policies that every agent must know.

---

## Company Identity

**FleetMind** is an AI-powered fleet management and dispatch planning SaaS built for Italian transport companies (SMEs, 1-100 vehicles).

**Core problem solved:** Small and mid-size Italian logistics companies manually plan routes using Excel, WhatsApp, and phone calls. FleetMind automates dispatch with an AI agent while ensuring full regulatory compliance.

**Tagline:** "Il tuo pianificatore logistico AI"

**Competitive positioning:** 3.4x cheaper than Webfleet (EUR 149/mo vs EUR 510-810/mo). Focus on Italian regulatory compliance (MIT tariffs, LEZ zones, EU 561/2006).

**Target market:** Italian transport companies, 1-100 vehicles. Fleet managers, dispatchers, and logistics operators.

---

## Product Overview

### Core Features

1. **AI Dispatch Planning** -- Claude AI agent automatically assigns orders to drivers/vehicles with real-time compliance checking. Uses 6 tools: get_valid_combinations, get_route_info, get_mit_tariff, check_lez, assign_order, flag_unassignable.

2. **Live Fleet Tracking** -- No-app tracking via shareable mobile-friendly links. Drivers share a link; customers can track deliveries. Browser geolocation, 10-second refresh.

3. **Compliance Monitoring** -- Automated alerts for document expiry (licenses, CQC, ADR, tachograph), driving hours limits, LEZ restrictions, MIT tariff violations.

4. **MIT Minimum Tariff Calculator** -- Calculates legal minimum transport costs based on vehicle weight class and distance. Alerts when customer rates are below legal minimum.

5. **Document Management** -- Tracks licenses (patente), CQC cards, tachograph calibration, ADR certifications, vehicle inspections, insurance, registration (bollo).

6. **Trip Planning & Management** -- Full lifecycle from order creation to trip completion. Estimated vs actual time/km/cost.

7. **Partner Management** -- Manage subcontractors with operating zones, vehicle types, cost per km, and ratings.

8. **Regulatory Calendar** -- 2026+ deadlines for tachograph requirements, emergency braking systems, Euro 5 bans.

### Platform Pages (Dashboard)

| Page | What it shows |
|------|---------------|
| Dashboard | KPI cards (pending orders, available drivers, km planned, fuel cost), fleet map, activity feed |
| Dispatch | "Pianifica con AI" button, real-time AI reasoning log, assignment cards with compliance scorecard |
| Orders | Order table with filtering, new order dialog, order details |
| Drivers | Driver grid with documents status, driving hours bars, GPS location |
| Vehicles | Vehicle grid with capacity, Euro class, maintenance history |
| Partners | Subcontractor table with zones, vehicle types, cost per km |
| Compliance | Document alerts, MIT tariff calculator, regulatory calendar |
| Settings | Company profile, API keys, billing/subscription, fuel cost |
| Trips | Trip list with status, estimated vs actual data |

---

## Pricing Plans

| Plan | Price | Vehicles | Features |
|------|-------|----------|----------|
| Starter | EUR 149/month | Up to 10 | AI dispatch, tracking, compliance alerts |
| Professional | EUR 299/month | Up to 30 | + Partner management, regulatory calendar, priority support |
| Business | EUR 499/month | Up to 100 | + Dedicated account manager, custom integrations, SLA |

All plans include 14-day free trial, no credit card required.

---

## Technical Stack (for Support agent reference)

- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS, shadcn/ui, Leaflet maps
- **Backend:** Next.js API Routes, Prisma ORM, PostgreSQL (Neon)
- **AI:** Anthropic Claude API with tool use
- **Auth:** NextAuth (Google OAuth + Magic Link email + Demo login)
- **Payments:** Stripe (subscriptions, checkout, webhooks)
- **Deploy:** Vercel

---

## Key Database Entities

| Entity | Key Fields |
|--------|------------|
| Company | nome, indirizzo, citta, piva, subscription status, trial dates |
| Driver | nome, cognome, patente (tipo, numero, scadenza), CQC, ADR, tachograph, driving hours (giorno/settimana), GPS position, status |
| Vehicle | targa, tipo (furgone/camion/frigo/cisterna/pianale), capacity (peso/volume), classe Euro, fuel consumption, maintenance dates |
| Order | codice, sender/recipient (address, GPS), cargo (tipo, peso, volume, frigo, ADR), time windows, urgency, status |
| Trip | driver, vehicle, route, km, estimated time/cost, status (pianificato/approvato/in_corso/completato) |
| Assignment | order+driver+vehicle, compliance score (0-7), checks detail, motivation |
| Partner | nome, piva, zone operative, tipi veicoli, costo/km, rating |

---

## Communication Rules (All Agents)

- Always respond in Italian (the user is an Italian logistics operator)
- Never use markdown formatting, bullet lists, or headers in client-facing messages unless showing data tables
- Be professional but approachable -- these are busy operators, not tech experts
- Never invent data not present in the Knowledge Base
- If asked about real company data (specific drivers, vehicles, orders), explain this is a demo chatbot and suggest checking the FleetMind dashboard
- Contact for human support: info@fleetmind.it
