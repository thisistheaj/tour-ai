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

# TikTok-Style Listing Feed Implementation

## Principles
- Keep UI minimal and focused on the video
- Ensure all property details are easily visible
- Make interactions intuitive and smooth
- Follow TikTok's proven UX patterns

## 1. Property Info Overlay
-[ ] Add persistent property details overlay
  - Price in large text
  - Beds/baths count
  - Location (city/neighborhood)
  - Available/unavailable status
-[ ] Style overlay with gradient background for readability
-[ ] Position overlay at bottom of screen
-[ ] Ensure text is readable on any video background

## 2. Property Description
-[ ] Add expandable description panel
  - Collapsed by default
  - Shows first 2 lines when collapsed
  - Full screen overlay when expanded
-[ ] Add tap-to-expand interaction
-[ ] Add smooth expand/collapse animation
-[ ] Include all property details in expanded view:
  - Full description
  - Amenities
  - Contact information
  - Map preview

## 3. Video Player Improvements
-[ ] Remove unnecessary player controls
-[ ] Add loading state for video buffering
-[ ] Add double-tap to like interaction
-[ ] Add progress bar at top of screen

## 4. Navigation
-[ ] Improve swipe sensitivity
-[ ] Add pull-to-refresh at top
-[ ] Add infinite scroll loading
-[ ] Remove navigation hints (up/down arrows)
-[ ] Add haptic feedback on swipe

## 5. Action Buttons & Sharing
-[ ] Simplify side buttons to essential actions:
  - Like/Save
  - Share
  - Contact
-[ ] Remove message/comment functionality
-[ ] Add contact button that shows PM details
-[ ] Create individual video page route (`/listings/$id`)
-[ ] Add share functionality that links to individual page

## 6. Performance Optimization (Optional)
-[ ] Add placeholder thumbnails
-[ ] Optimize animation performance
-[ ] Add error boundaries for failed video loads
-[ ] Implement retry mechanism for failed loads
-[ ] Optimize video preloading (next/previous)

## Notes
- Focus on core viewing experience first
- Keep interactions simple and intuitive
- Prioritize video playback performance
- Follow mobile-first design principles 