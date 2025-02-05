## Principles for Todo Items 
- Each item should be a concrete, checkable unit of work
- Implied work (loading states, responsiveness, etc.) should not be listed
- Items should be grouped and ordered in implementation sequence
- Keep items focused on feature requirements, not implementation details
- Avoid duplicate work across sections
- Use existing data/fields to determine state instead of adding flags

# Edit Listing Implementation

## 1. Create Edit Route and Form
-[x] Create `manager.edit.$id.tsx` route
-[x] Add loader to fetch video data
-[x] Create form with existing video data pre-filled
-[x] Add validation for required fields
-[x] Style form using shadcn components

## 2. Server-side Implementation
-[x] Add updateVideo function to video.server.ts
-[x] Add action handler for form submission
-[x] Add error handling for invalid/missing data
-[x] Add success message and redirect

## 3. Delete Functionality
-[x] Add delete button with confirmation dialog
-[x] Add deleteVideo function to video.server.ts
-[ ] Handle video deletion in Mux (TODO later)
-[x] Add success message and redirect to dashboard

## 4. UI/UX Improvements
-[x] Add loading states for form submission
-[x] Add error messages for validation
-[ ] Add unsaved changes warning
-[x] Add preview of current video

## Notes
- Reuse components from create listing form
- Maintain mobile-first design
- Keep error messages clear and actionable
- Consider optimistic UI updates 