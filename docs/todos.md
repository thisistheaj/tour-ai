# Onboarding Flow Implementation Plan

## Principles for Todo Items
- Each item should be a concrete, checkable unit of work
- Implied work (loading states, responsiveness, etc.) should not be listed
- Items should be grouped and ordered in implementation sequence
- Keep items focused on feature requirements, not implementation details
- Avoid duplicate work across sections
- Use existing data/fields to determine state instead of adding flags

## 1. Database Schema Updates
- [x] Add userType field to User model (enum: "PROPERTY_MANAGER" | "RENTER")
- [x] Add city field to User model for renters
- [x] Add companyName and contactInfo fields for property managers
- [x] Run migrations

## 2. Auth Flow
- [x] Keep existing email/password signup at /join and /login
- [x] Update root route (/) to check user completion:
  - [x] If !user → /login
  - [x] If !user.userType → /onboarding
  - [x] If user.userType === "RENTER" && !user.city → /onboarding
  - [x] If user.userType === "PROPERTY_MANAGER" && !user.companyName → /onboarding
  - [x] Otherwise → /listings/feed or /manager based on type

## 3. Onboarding Flow
- [ ] Create /onboarding route with step handling
- [ ] Step 1: User Type Selection
  - [ ] Two-card choice between PM/Renter
  - [ ] Save to user.userType
- [ ] Step 2: Profile Details (based on userType)
  - [ ] PM: Company name and contact form
  - [ ] Renter: City selection dropdown
- [ ] After completion, redirect to appropriate home:
  - [ ] PMs → /manager
  - [ ] Renters → /listings/feed

## Notes
- Use shadcn components
- Keep forms simple and minimal
- Store city names in standardized format 