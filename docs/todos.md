## Principles for Todo Items 
- Each item should be a concrete, checkable unit of work
- Implied work (loading states, responsiveness, etc.) should not be listed
- Items should be grouped and ordered in implementation sequence
- Keep items focused on feature requirements, not implementation details
- Avoid duplicate work across sections
- Use existing data/fields to determine state instead of adding flags

# Create Listing Implementation

## 1. Database Schema Updates
- [x] Add new fields to Video model:
  - [x] price (Decimal)
  - [x] address (String)
  - [x] city (String)
  - [x] bedrooms (Int)
  - [x] bathrooms (Int)
  - [x] description (String)
  - [x] available (Boolean)
- [x] Run migrations

## 2. Update Create Listing Form
- [x] Create multi-step form in manager.new:
  - [x] Step 1: Basic Info (existing video upload)
  - [x] Step 2: Property Details
    - [x] Price input with validation
    - [x] Address input
    - [x] City selection (match renter cities)
    - [x] Beds/baths number inputs
    - [x] Description textarea
    - [x] Availability toggle
- [x] Add form state management
- [x] Add loading states
- [x] Add error handling

## 3. Server-side Implementation
- [x] Update video creation endpoint
- [x] Add input validation
- [x] Add error handling

## 4. UI/UX Improvements
- [ ] Add progress indicator for form steps
- [ ] Add preview of entered information
- [ ] Add confirmation before final submission
- [ ] Add success message and redirect

## Notes
- Use shadcn components for consistency
- Maintain mobile-first design
- Keep error messages clear and actionable
- Consider adding save draft functionality 