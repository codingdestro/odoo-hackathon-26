══════════════════════════════════════
1. Authentication
══════════════════════════════════════

□ Login with valid credentials
□ Login with invalid credentials
□ Verify RBAC
□ Logout

──────────────────────────────────────

══════════════════════════════════════
2. Vehicle Module
══════════════════════════════════════

□ Create Vehicle
□ Edit Vehicle
□ Delete Vehicle
□ Duplicate Registration Number (Should Fail)
□ Search Vehicle
□ Filter by Status

──────────────────────────────────────

══════════════════════════════════════
3. Driver Module
══════════════════════════════════════

□ Create Driver
□ Edit Driver
□ Delete Driver
□ Expired License
□ Suspended Driver
□ Search Driver

──────────────────────────────────────

══════════════════════════════════════
4. Trip Module
══════════════════════════════════════

Create Trip

□ Select Available Vehicle
□ Select Available Driver
□ Enter Cargo Weight
□ Save Draft

Validation

□ Cargo > Capacity (Should Fail)
□ Vehicle On Trip (Should Fail)
□ Driver On Trip (Should Fail)
□ Expired License (Should Fail)
□ Suspended Driver (Should Fail)

Dispatch

□ Dispatch Trip
□ Trip Status → DISPATCHED
□ Vehicle Status → ON_TRIP
□ Driver Status → ON_TRIP

Complete Trip

□ Enter Final Odometer
□ Enter Fuel Consumed
□ Complete Trip
□ Trip Status → COMPLETED
□ Vehicle Status → AVAILABLE
□ Driver Status → AVAILABLE

Cancel Trip

□ Create Another Trip
□ Dispatch
□ Cancel
□ Trip Status → CANCELLED
□ Vehicle Status → AVAILABLE
□ Driver Status → AVAILABLE

──────────────────────────────────────

══════════════════════════════════════
5. Maintenance Module
══════════════════════════════════════

□ Create Maintenance Record
□ Vehicle Status → IN_SHOP
□ Vehicle Hidden From Dispatcher
□ Complete Maintenance
□ Vehicle Status → AVAILABLE

──────────────────────────────────────

══════════════════════════════════════
6. Fuel Module
══════════════════════════════════════

□ Add Fuel Log
□ Verify Fuel Cost
□ Verify Fuel History

──────────────────────────────────────

══════════════════════════════════════
7. Expense Module
══════════════════════════════════════

□ Add Toll Expense
□ Add Repair Expense
□ Add Other Expense
□ Verify Total Cost

──────────────────────────────────────

══════════════════════════════════════
8. Dashboard
══════════════════════════════════════

Verify KPIs

□ Total Vehicles
□ Available Vehicles
□ Active Trips
□ Vehicles In Shop
□ Drivers On Duty
□ Fleet Utilization

──────────────────────────────────────

══════════════════════════════════════
9. Reports
══════════════════════════════════════

□ Fuel Efficiency
□ Operational Cost
□ Vehicle ROI
□ CSV Export
□ PDF Export (Optional)

──────────────────────────────────────

══════════════════════════════════════
10. Business Rules
══════════════════════════════════════

□ Duplicate Registration Blocked
□ Driver License Validation
□ Cargo Capacity Validation
□ Vehicle Availability Validation
□ Driver Availability Validation
□ Automatic Vehicle Status Updates
□ Automatic Driver Status Updates
□ Maintenance Status Updates
□ Reports Updated After Trip
□ Reports Updated After Fuel Log

──────────────────────────────────────

══════════════════════════════════════
11. End-to-End Scenario
══════════════════════════════════════

Login
    ↓
Create Vehicle
    ↓
Create Driver
    ↓
Create Trip
    ↓
Dispatch Trip
    ↓
Verify Vehicle = ON_TRIP
    ↓
Verify Driver = ON_TRIP
    ↓
Complete Trip
    ↓
Verify Vehicle = AVAILABLE
    ↓
Verify Driver = AVAILABLE
    ↓
Add Fuel Log
    ↓
Add Expense
    ↓
Create Maintenance
    ↓
Verify Vehicle = IN_SHOP
    ↓
Close Maintenance
    ↓
Verify Vehicle = AVAILABLE
    ↓
Open Dashboard
    ↓
Verify KPIs
    ↓
Export Report

══════════════════════════════════════