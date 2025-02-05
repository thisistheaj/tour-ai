# Week 1 User Stories

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

# tech requirements
-[x] migrate from sqlite to postgres
-[x] setup mux premium for longer videos
-[ ] get 20 test videos / listings
-[x] setup service worker for PWA

Design reqs:
-[ ] bootstrap high convverting landing page with description.md
-[ ] add a video to the landing page
-[ ] make app ready for portfolio demo

## Todos (scrap):
- [ ] basic dummy data? 
- [ ] take MVP Video
- [ ] stitch mvp video

# Tech Debt
-[x] migrate /videos routes to new /manager structure
-[ ] clean up unused routes and components
-[x] standardize route naming convention
-[ ] add proper error boundaries
-[x] improve type safety across routes

- [ ]