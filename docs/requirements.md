# User Stories

## Story 1: Create Listing
As a property manager, I want to create a new listing
-[x] Can upload a video tour from my device
-[x] Can set listing price
-[x] Can input address/location
-[x] Can specify number of bedrooms/bathrooms
-[x] Can add detailed property description
-[x] Can provide contact information
-[x] Can mark listing as available/unavailable

## Story 2: Manage Listings
As a property manager, I want to manage my listings
-[x] Can view all my listed properties
-[x] Can edit listing details
-[x] Can toggle listing visibility
-[x] Can delete listings

## Story 3: Set Up Search
As a renter, I want to set up my apartment search
-[x] Can create an account
-[x] Can select my target city during onboarding
-[x] Can start viewing relevant listings immediately after city selection

## Story 4: Browse Listings
As a renter, I want to browse listings in a TikTok-style interface
-[x] Can swipe vertically through continuous feed of apartment videos
-[x] Can see price, location, beds/baths overlay while watching
-[x] Can tap to expand/collapse full property description
-[x] Videos autoplay and loop like TikTok
-[x] Feed only shows listings from selected city

## Story 5: Save Listings
As a renter, I want to save and review listings
-[x] Can double-tap to save a property
-[x] Can un-save a property
-[x] Can view list of saved properties
-[x] Can access saved property details and videos

## Story 6: Contact Property Managers
As a renter, I want to contact property managers
-[x] Can view contact information for each listing
-[x] Can tap to initiate contact (email/phone) directly from the app

## Story 7: Share Listings
As a renter, I want to share listings with friends
-[x] Can share a listing via text, email, or social media
-[x] Can copy a listing link to share
-[x] Can share a listing via social media

## Story 8: Contact Property Managers
As a renter, I want to contact property managers
-[x] Can view contact information for each listing
-[x] Can tap to initiate contact (email/phone) directly from the app

# Backlog

## Tech Debt
-[x] migrate from sqlite to postgres
-[x] setup mux premium for longer videos
-[x] migrate /videos routes to new /manager structure
-[x] clean up unused routes and components
-[x] standardize route naming convention
-[x] improve type safety across routes
-[ ] mux deletions
-[ ] gesture conflict: wiping + detail view fire simultaneously {desktop only}

## Enhancements
-[x] add functionality to settings link
-[x] add settings page for PMs — with change metro, update company
-[x] add settings page for renters — with change metro
-[x] restrict renter accounts from PM views
-[x] fix back button in feed
-[x] setup service worker for PWA
-[x] home screen icon
-styles:
-[ ] replace blue color
-[ ] style login and signup
-[ ] change fonts?
-[ ] screen size ratio
-[ ] make drawer translucent
-Features:
-[ ] double tap to save
-[ ] places API + map view

## Bugs
-[x] UI visible behind status bar
-[x] fix padding on upload and preview feed buttons
-[x] remove previous and next text in feed
-[x] consistent previews in confirm and edit views
-[x] video volume — why does only one video have sound on? why isnt it the first
-[x] video scrolling (w/ window and preloading)
-[ ] fix '/apple-touch-icon.png' 404 error

## code q
-[x] remove unused imports
-[x] fix linter errors
-[x] cleanup logs
-[x] audit code
-[x] fix unknown mux props

## Arch?
-[ ] make API for test data
-[ ] setup PG Vector
-[ ] put in capacitor
-[ ] test video annotations

## Logistics

### Demo Videos
-[x] make MVP Video with "Responsive Design Mode"
-[ ] get 20 test videos / listings
-[ ] voice over on phone video

##Portfolio readiness
-[x] bootstrap high convverting landing page with description.md
-[ ] add a video to the landing page
-[ ] add test account + login

### QA 
-[x] bug search
-[x] find enhancements
-[ ] vet user stories 





