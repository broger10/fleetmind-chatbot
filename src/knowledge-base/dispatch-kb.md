# FleetMind - Dispatch Vertical Knowledge Base

> This KB is injected ONLY into the Dispatch agent. It contains detailed information about dispatch planning, order assignment logic, routing, and operational procedures.

---

## How AI Dispatch Works

### The Dispatch Flow

1. **Operator clicks "Pianifica con AI"** on the Dispatch page
2. **Pre-filter phase (deterministic):** The system eliminates impossible combinations BEFORE the AI starts:
   - Vehicle weight capacity < order weight? Eliminated
   - Order requires refrigeration but vehicle is not furgone_frigo? Eliminated
   - Order has ADR goods but driver has no ADR patentino? Eliminated
   - Driver license type insufficient (e.g., patente B for camion)? Eliminated
   - Driver has exceeded daily/weekly driving hours? Eliminated
3. **AI reasoning phase:** Claude receives the remaining valid combinations and reasons through each order
4. **For each order, the AI:**
   - Calls `get_valid_combinations(orderId)` to see available driver+vehicle pairs
   - Calls `get_route_info()` for real distance/time (Google Maps or euclidean fallback)
   - Evaluates options considering: proximity, driving hours, cargo type, vehicle suitability
   - Calls `assign_order()` to confirm the best match with Italian-language motivation
   - Or calls `flag_unassignable()` if no valid combination exists
5. **Post-verify scoring:** Each assignment gets a 7-point compliance scorecard
6. **Approval workflow:** Operator reviews assignments, then approves valid ones (creating trips)

### The 7-Point Compliance Scorecard

Each assignment is scored on 7 checks (pass/fail):

| Check | What it verifies |
|-------|-----------------|
| Peso | Vehicle capacity >= order weight |
| Volume | Vehicle volume >= order volume |
| Ore | Driver has enough remaining driving hours |
| ADR | If dangerous goods: driver has valid ADR patentino AND vehicle is ADR-enabled |
| Patente | Driver license type matches vehicle requirements (B for furgone, C/CE for camion) |
| LEZ | Vehicle Euro class allows access to Low Emission Zones (Euro 5+ required) |
| MIT | Transport rate is above legal minimum cost (MIT tariff) |

**Score interpretation:**
- 7/7: All checks pass, assignment can be approved
- 5-6/7: Warning -- some checks failed but not critical, review needed
- < 5/7 or any critical check failed: Assignment is BLOCKED, cannot be approved

### Assignment Status Flow

```
AI assigns order -> Assignment (pending) -> Operator approves -> Trip (pianificato)
                                         -> Operator rejects -> Assignment (rejected)
```

---

## Order Management

### Order Fields

- **Codice Ordine:** Unique identifier (e.g., ORD-2026-001)
- **Mittente:** Sender name, address, city, CAP, GPS coordinates
- **Destinatario:** Recipient name, address, city, CAP, GPS coordinates
- **Merce:** Type, weight (kg), volume (m3), refrigerated (yes/no), dangerous/ADR (yes/no)
- **Finestre temporali:** Loading window (from-to), delivery window (from-to)
- **Urgenza:** normale, urgente, programmato
- **Stato:** pending, assegnato, in_corso, completato, annullato

### Order Priorities

- **Urgente:** Must be assigned first, shortest route preferred
- **Normale:** Standard priority, optimize for efficiency
- **Programmato:** Can be planned in advance, flexibility on timing

---

## Driver Availability Rules

A driver is **available** for assignment when ALL of these are true:
- Status is "disponibile" (not in_viaggio, riposo, or non_disponibile)
- Has enough remaining daily driving hours (max 9h/day, exceptionally 10h twice/week)
- Has enough remaining weekly driving hours (max 56h/week, max 90h/fortnight)
- License type matches the vehicle category
- Required certifications are valid (CQC, ADR if needed)
- No expired documents (patente, CQC, tachograph)

### License Requirements by Vehicle

| Vehicle Type | Minimum License |
|-------------|----------------|
| Furgone | B |
| Furgone frigo | B |
| Camion (< 7.5t) | C |
| Camion (> 7.5t) | C + CQC |
| Camion con rimorchio | CE + CQC |
| Cisterna | C + CQC (+ ADR if hazmat) |
| Pianale | C + CQC |

---

## Vehicle Types and Use Cases

| Type | Italian Name | Typical Use |
|------|-------------|-------------|
| Van | Furgone | Urban deliveries, small parcels, < 3.5t |
| Refrigerated van | Furgone frigo | Food, pharma, temperature-controlled goods |
| Truck | Camion | Medium/heavy loads, regional transport |
| Tanker | Cisterna | Liquids, chemicals, fuel (often ADR) |
| Flatbed | Pianale | Construction materials, machinery, oversized loads |

---

## Routing and Distance

- **Primary:** Google Maps Distance Matrix API (real distances and travel times)
- **Fallback:** Euclidean distance x 1.4 correction factor, speed estimate 50 km/h
- **Fuel cost estimation:** distance_km / vehicle_consumption_km_per_liter * fuel_cost_per_liter
- **Default fuel cost:** EUR 1.85/liter (configurable in Settings)

---

## Common Dispatch Scenarios

### Scenario: Standard daily dispatch
"I have 15 orders to assign today, 8 drivers available, 12 vehicles"
-> Click "Pianifica con AI", the system pre-filters and AI assigns optimally

### Scenario: Urgent order
"I received an urgent order for Milan, who can take it?"
-> Check available drivers near Milan, verify driving hours, assign closest

### Scenario: ADR shipment
"I need to transport dangerous goods from Brescia to Napoli"
-> Only drivers with valid ADR patentino + ADR-enabled vehicles qualify
-> Pre-filter eliminates all non-ADR combinations automatically

### Scenario: No available drivers
"AI says the order is unassignable"
-> Check why: all drivers at hour limit? No vehicle with enough capacity? No ADR cert?
-> Consider: partner subcontractor, reschedule for tomorrow, split the load

### Scenario: Refrigerated goods
"I need to deliver frozen food to Rome"
-> Only furgone_frigo vehicles qualify
-> Pre-filter eliminates all non-frigo vehicles automatically
