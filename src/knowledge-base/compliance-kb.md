# FleetMind - Compliance Vertical Knowledge Base

> This KB is injected ONLY into the Compliance agent. It contains detailed information about Italian/EU transport regulations, document management, MIT tariffs, LEZ zones, and the regulatory calendar.

---

## EU Regulation 561/2006 - Driving Hours

### Daily Driving Limits
- **Maximum:** 9 hours per day
- **Exception:** Can extend to 10 hours, maximum 2 times per week
- **Break requirement:** 45 minutes after 4.5 continuous hours of driving
- **Break can be split:** 15 min + 30 min (in this order only)

### Weekly Driving Limits
- **Maximum:** 56 hours per week
- **Fortnightly maximum:** 90 hours over any 2 consecutive weeks
- **Weekly rest:** Minimum 45 hours (can be reduced to 24h, compensated within 3 weeks)

### Daily Rest
- **Regular:** 11 consecutive hours within each 24-hour period
- **Reduced:** 9 hours (minimum), maximum 3 times between weekly rests
- **Split:** 3 hours + 9 hours (in this order)

### Sanctions for Violations
- Driving hours exceeded: EUR 400-1,600 per violation
- Missing rest periods: EUR 300-1,200
- Falsified tachograph records: criminal offense, up to EUR 6,000

---

## Document Management - Types and Deadlines

### Driver Documents

| Document | Duration | Alert Threshold | Consequence if Expired |
|----------|----------|-----------------|----------------------|
| Patente (driving license) | 10 years (5 years after age 50) | 60 days before expiry | Driver cannot drive legally |
| CQC (Carta Qualificazione Conducente) | 5 years | 90 days before expiry | Driver cannot drive commercial vehicles |
| ADR Patentino | 5 years | 90 days before expiry | Driver cannot transport dangerous goods |
| Tachograph card download | Every 28 days (card) / 90 days (vehicle memory) | 7 days before deadline | Fine EUR 800-2,400 |

### Vehicle Documents

| Document | Duration | Alert Threshold | Consequence if Expired |
|----------|----------|-----------------|----------------------|
| Assicurazione (insurance) | 1 year | 30 days before expiry | Vehicle cannot circulate |
| Bollo (road tax) | 1 year | 30 days before expiry | Fine EUR 50-200 + surcharges |
| Revisione (inspection) | 1 year (commercial) | 30 days before expiry | Vehicle blocked, fine EUR 169-680 |
| Manutenzione programmata | Based on km/time | As configured | Risk of breakdown, liability issues |

### Compliance Alert Severity Levels

- **Critico (Red):** Document expires within 7 days or already expired. Immediate action required.
- **Avviso (Yellow):** Document expires within 30 days. Plan renewal.
- **Info (Blue):** Document expires within 60-90 days. Awareness only.

---

## MIT Minimum Tariffs (Costi Minimi - June 2025 Data)

The Italian Ministry of Transport (MIT) sets minimum transport costs that carriers must charge. Operating below these costs is a regulatory violation.

### Tariff Classes by Vehicle Weight (PTT)

| Class | PTT Range | Min EUR/km | Avg EUR/km | Max EUR/km | Hourly Rate |
|-------|-----------|-----------|-----------|-----------|------------|
| A | Up to 7.5t | 1.12 | 1.34 | 1.56 | EUR 32.50 |
| B | 7.5t - 16t | 1.38 | 1.65 | 1.92 | EUR 40.00 |
| C | 16t - 26t | 1.71 | 2.05 | 2.39 | EUR 50.00 |
| D | Over 26t | 2.08 | 2.50 | 2.92 | EUR 62.00 |

### How to Calculate

1. Determine vehicle weight class (A, B, C, or D) based on PTT (peso totale a terra)
2. Multiply distance in km by the minimum cost per km for that class
3. Compare with the customer's agreed rate
4. If customer rate < minimum cost: **violation alert**

### Example
- Vehicle: Camion 18t (Class C)
- Distance: 200 km
- Minimum cost: 200 x 1.71 = EUR 342.00
- Customer rate: EUR 300.00
- Result: **BELOW MINIMUM** -- regulatory violation risk

---

## LEZ - Low Emission Zones (Zone a Traffico Limitato Emissioni)

### Current Rules (2026)
- Northern Italy cities (Milano, Torino, Bologna, Padova, Brescia) restrict vehicle access based on Euro class
- **Euro 4 and below:** Banned from LEZ zones in most northern cities (already in effect)
- **Euro 5:** Gradual ban starting October 2026 for commercial vehicles in Lombardia, Piemonte, Emilia-Romagna, Veneto
- **Euro 6 and 6E:** Full access everywhere

### Vehicle Euro Class Check

| Euro Class | LEZ Access 2026 | Notes |
|-----------|-----------------|-------|
| Euro 3 | DENIED | Banned everywhere |
| Euro 4 | DENIED | Banned in northern cities |
| Euro 5 | RESTRICTED | Banned from Oct 2026 in 4 regions |
| Euro 6 | ALLOWED | Full access |
| Euro 6E | ALLOWED | Full access, newest standard |

### Impact on Dispatch
- When assigning orders to northern Italy destinations, the dispatch system checks vehicle Euro class
- Euro 5 vehicles get a warning (LEZ check fails in scorecard)
- Euro 4 or below: assignment is BLOCKED for LEZ zone destinations

---

## ADR - Dangerous Goods Transport

### Requirements
1. **Driver:** Must have valid ADR patentino (certificate)
2. **Vehicle:** Must be ADR-enabled (adrAbilitato = true) with valid ADR certification
3. **Both must be valid:** If either is expired, transport is illegal

### ADR Classes (Most Common in Italy)
- Class 2: Gases
- Class 3: Flammable liquids (most common: fuel, solvents)
- Class 4: Flammable solids
- Class 5: Oxidizing substances
- Class 6: Toxic substances
- Class 8: Corrosive substances
- Class 9: Miscellaneous dangerous goods

### Sanctions
- Transport without ADR certification: EUR 2,000-8,000
- Expired ADR documents: EUR 1,000-4,000
- Criminal liability in case of accident with improper ADR handling

---

## Regulatory Calendar 2026

### Key Deadlines

| Date | Regulation | Impact |
|------|-----------|--------|
| 1 January 2026 | Tachograph download interval reduced | Card: every 28 days, Memory: every 90 days |
| 1 March 2026 | DL 73/2025 load/unload times | Max 90 minutes for loading/unloading operations |
| 1 July 2026 | Smart tachograph Gen 2 mandatory | All new commercial vehicles must have Gen 2 |
| 1 October 2026 | Euro 5 commercial ban (LEZ regions) | Euro 5 commercial vehicles banned from northern Italy LEZ zones |
| 31 December 2026 | AEBS mandatory | Advanced Emergency Braking System required on new heavy vehicles |

### Sources
- Regolamento UE 561/2006 (driving hours)
- Regolamento UE 1054/2020 (tachograph requirements)
- DL 73/2025 (load/unload times)
- Delibere regionali Lombardia, Piemonte, Emilia-Romagna, Veneto (LEZ zones)
- MIT Decreto Costi Minimi Giugno 2025

---

## Common Compliance Questions

### "When does my driver's CQC expire?"
-> Check the driver profile in FleetMind. The compliance page shows all upcoming expirations with color-coded alerts.

### "Are we allowed to send Euro 5 trucks to Milan?"
-> As of October 2026, Euro 5 commercial vehicles will be banned from LEZ zones in Lombardia. Plan to upgrade to Euro 6 or use Euro 6 vehicles for Milan deliveries.

### "How do I know if our rates are above MIT minimum?"
-> Use the MIT Tariff Calculator in the Compliance section. Enter vehicle weight, distance, and customer rate. The system tells you if you're compliant.

### "What happens if a driver exceeds 9 hours?"
-> This is a violation of EU 561/2006. The driver must take mandatory rest. Sanctions range from EUR 400 to EUR 1,600. FleetMind tracks driving hours and alerts you before the limit is reached.

### "Do we need ADR certification for all shipments?"
-> Only for dangerous goods (merce pericolosa). Regular goods, food, and general cargo do not require ADR. When creating an order, mark it as "merce pericolosa" if it contains hazardous materials.
