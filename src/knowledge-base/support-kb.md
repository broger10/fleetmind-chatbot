# FleetMind - Support Vertical Knowledge Base

> This KB is injected ONLY into the Support agent. It contains information about platform features, troubleshooting, onboarding, account management, and billing.

---

## Onboarding Process

### First-Time Setup (Onboarding Wizard)

When a new user signs up, they go through a 3-step wizard:

1. **Step 1 - Company Info:** Enter company name, address, city, CAP, P.IVA (VAT number), phone, email
2. **Step 2 - First Vehicle:** Add at least one vehicle with: targa, type, marca, modello, anno, capacity (peso/volume), Euro class, ADR certification if applicable
3. **Step 3 - First Driver:** Add at least one driver with: nome, cognome, codice fiscale, license (tipo, numero, scadenza), CQC, tachograph calibration date, ADR patentino if applicable

All steps can be skipped -- the user can explore the platform first and fill in data later from the respective management pages.

### API Key Configuration

FleetMind requires an Anthropic API key to use the AI Dispatch feature:
1. Go to Settings page
2. Find "API Keys" section
3. Enter your Anthropic API key (starts with `sk-ant-`)
4. Optionally add a Google Maps API key for real-time routing (otherwise euclidean fallback is used)

**Important:** The API key is stored securely and is never visible after saving. It is used server-side only.

---

## Feature Guides

### How to Create an Order

1. Go to Orders page
2. Click "Nuovo Ordine" button
3. Fill in sender details (name, address, city, GPS coordinates optional)
4. Fill in recipient details
5. Specify cargo: type, weight (kg), volume (m3)
6. Check "Merce Refrigerata" if temperature-controlled
7. Check "Merce Pericolosa" if hazardous (ADR)
8. Set loading and delivery time windows
9. Set urgency level (normale/urgente/programmato)
10. Click "Crea Ordine"

### How to Add a Driver

1. Go to Drivers page
2. Click "Aggiungi Autista"
3. Fill in personal data: nome, cognome, codice fiscale
4. License details: type (B, C, CE), number, expiry date
5. CQC: card number, expiry date, type (merci/persone)
6. Tachograph calibration date
7. ADR: patentino number and expiry (if applicable)
8. Phone number (optional)
9. Click "Salva"

### How to Add a Vehicle

1. Go to Vehicles page
2. Click "Aggiungi Veicolo"
3. Fill in: targa, type (furgone/camion/frigo/cisterna/pianale), marca, modello, anno
4. Capacity: weight (kg), volume (m3), PTT (peso complessivo)
5. Fuel consumption (km/L)
6. Euro class (Euro 3 through 6E)
7. Document dates: insurance, bollo, next inspection, next maintenance
8. ADR enabled (yes/no) with certification expiry
9. Click "Salva"

### How to Run AI Dispatch

1. Make sure you have pending orders and available drivers/vehicles
2. Go to Dispatch page
3. Click "Pianifica con AI"
4. Watch the real-time AI reasoning log as it processes each order
5. Review assignment cards: each shows driver, vehicle, compliance scorecard (7 checks)
6. Green checks = OK, Yellow = warning, Red = blocked
7. Click "Approva Piano" to confirm all valid assignments (creates trips)
8. Or reject individual assignments and re-run

### How to Use Live Tracking

1. Go to the driver's profile
2. Copy the tracking link (format: /track/[driverId])
3. Share the link with the driver via WhatsApp
4. The driver opens the link on their phone and allows GPS access
5. Their position updates every 10 seconds on the fleet map (Dashboard)
6. No app installation needed -- works in any mobile browser

### How to Check Compliance

1. Go to Compliance page
2. **Tab 1 - Document Alerts:** See all upcoming expirations, color-coded by severity
3. **Tab 2 - MIT Calculator:** Enter vehicle weight, distance, customer rate to check if above minimum
4. **Tab 3 - Regulatory Calendar:** View upcoming regulatory deadlines for 2026

---

## Troubleshooting

### "AI Dispatch is not working"
**Possible causes:**
- No Anthropic API key configured -> Go to Settings, add your API key
- API key invalid or expired -> Check at console.anthropic.com
- No pending orders -> Create orders first
- No available drivers/vehicles -> Check driver/vehicle status (must be "disponibile")
- Credits exhausted -> Check your Anthropic account balance

### "Live tracking not updating"
**Possible causes:**
- Driver did not allow GPS access in browser -> They need to click "Allow" on the permission popup
- Driver's phone is in airplane mode
- Driver closed the tracking page -> They need to keep it open
- Network connection issues

### "Orders show as 'pending' after dispatch"
- Did you click "Approva Piano" after reviewing assignments? Assignments need manual approval
- Check if assignments are BLOCKED (red scorecard) -- blocked assignments cannot be approved

### "Vehicle shows as 'manutenzione'"
- A vehicle in maintenance cannot be assigned to orders
- Go to Vehicles page, find the vehicle, change status to "disponibile" when maintenance is complete

### "Compliance alerts are not showing"
- Compliance alerts are generated based on document expiry dates
- Make sure all document dates are filled in for drivers and vehicles
- Alerts appear when documents expire within 90 days

### "Vercel deploy fails"
- Check that environment variables are set in Vercel dashboard (ANTHROPIC_API_KEY, DATABASE_URL, NEXTAUTH_SECRET, etc.)
- Check build logs in Vercel for specific error messages
- Common issue: serverless function timeout -- increase to 30s in vercel.json

---

## Account & Billing

### Subscription Plans
- **Starter (EUR 149/mo):** Up to 10 vehicles, all core features
- **Professional (EUR 299/mo):** Up to 30 vehicles, partner management, regulatory calendar
- **Business (EUR 499/mo):** Up to 100 vehicles, dedicated account manager, custom integrations

### Trial
- 14-day free trial on all plans
- No credit card required to start
- Full access to all features during trial

### Managing Subscription
1. Go to Settings page
2. Find "Billing" section
3. See current plan, status, and renewal date
4. Click "Gestisci abbonamento" to open Stripe portal
5. From there: upgrade, downgrade, cancel, update payment method

### Authentication Methods
- **Google OAuth:** Click "Accedi con Google"
- **Magic Link:** Enter email, receive a login link, click to access
- **Demo Login:** Instant access with pre-loaded sample data (for testing)

---

## Common Support Questions

### "How do I reset demo data?"
-> There is a seed endpoint that populates sample data. Contact support or check the Settings page.

### "Can I export my data?"
-> Currently, data export is not available as a self-service feature. Contact info@fleetmind.it for data export requests.

### "How many users can access my account?"
-> Multiple users can be added to a company account. All users share the same company data. Go to Settings to manage team members.

### "Is my data secure?"
-> Yes. FleetMind uses encryption in transit (HTTPS), secure authentication (NextAuth with JWT), and data isolation per company (multi-tenant architecture). API keys are stored securely and never exposed to the frontend.

### "How do I contact support?"
-> Email: info@fleetmind.it
-> The FleetMind team typically responds within 24 hours on business days.
