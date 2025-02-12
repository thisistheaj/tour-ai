# User Stories — Application

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

# User Stories — AI

## AI Feature I: Video Analysis

## Story 1: Video Processing Status
**As a property manager**, I want to track the AI analysis of my video tour
- [x] Video is automatically sent to Gemini for analysis after Mux upload completes
- [x] Analysis progress is shown in a dedicated pane during listing creation
- [x] Progress updates are shown with a clear status indicator
- [x] Error states are clearly displayed with error messages
- [x] A retry button is available if analysis fails
- [x] A skip option is available if analysis cannot be completed

## Story 2: Room Detection
**As a property manager**, I want the AI to identify and timestamp rooms in my video
- [x] AI identifies distinct rooms (kitchen, living room, bathrooms, bedrooms)
- [x] Each bedroom is uniquely labeled (Bedroom 1, Bedroom 2, etc.)
- [x] Each room is associated with its timestamp in the video
- [x] Room timestamps are stored in the database for later use
- [x] Room data is formatted as structured JSON for programmatic use

## Story 3: Field Recognition
**As a property manager**, I want the AI to extract listing fields from my video
- [x] AI identifies number of bedrooms and bathrooms
- [x] AI identifies property type (apartment, house, studio, etc.)
- [x] AI detects key amenities (washer/dryer, dishwasher, etc.)
- [x] Extracted fields are returned in structured JSON format
- [x] Fields can be used for search and filtering

## Story 4: Auto-Tagging
**As a property manager**, I want the AI to generate relevant tags for my listing
- [x] AI generates tags based on video content and features
- [x] Tags cover amenities, styles, and property features
- [x] Tags are standardized for consistent searching
- [x] Tags are stored in structured JSON format
- [x] Tags can be reviewed and modified by user

## AI Feature II: AI Chat

## Story 5: Chat Interface
**As a renter**, I want to chat with AI about apartment listings
- [ ] Chat interface is accessible via a persistent chat bubble
- [ ] Chat bubble is positioned at the bottom of the video feed
- [ ] Chat interface opens in an overlay without interrupting video playback
- [ ] Chat maintains context about the current listing being viewed
- [ ] AI responses are based on listing details and video analysis

## Story 6: Room Navigation
**As a renter**, I want to use chat to navigate to specific rooms in the video
- [ ] Can ask natural language questions about specific rooms
- [ ] AI recognizes room-related queries (e.g., "show me the kitchen")
- [ ] Video automatically jumps to the timestamp of the requested room
- [ ] AI provides context about the room being shown
- [ ] Navigation works with all identified room types

## Story 7: Listing Information Queries
**As a renter**, I want to ask the AI specific questions about the listing
- [ ] Can ask about property features and amenities
- [ ] Can ask about pricing and availability
- [ ] Can ask about location and neighborhood
- [ ] AI responses are based on listing data and video analysis
- [ ] AI indicates if requested information is not available

## AI Feature III: Smart Filtering

## Story 8: AI-Powered Search
**As a renter**, I want to search listings using natural language
- [ ] Can search using conversational queries (e.g., "modern apartments with hardwood floors")
- [ ] AI understands and matches on extracted video features
- [ ] Results are ranked by relevance to search criteria
- [ ] Search includes both explicit fields and AI-detected features
- [ ] Results explain why each listing matched the search

## Story 9: Feature-Based Filtering
**As a renter**, I want to filter listings by AI-detected features
- [ ] Can filter by detected amenities (e.g., "granite countertops")
- [ ] Can filter by architectural features (e.g., "open concept")
- [ ] Can filter by design style (e.g., "modern", "traditional")
- [ ] Filters can be combined with traditional search criteria
- [ ] UI clearly shows which filters are AI-powered

## AI Feature IV: AI Voiceover

## Story 10: Automated Tour Narration
**As a property manager**, I want AI to generate professional voiceovers for my tours
- [ ] AI generates natural-sounding narration based on video content
- [ ] Voiceover is synchronized with room transitions
- [ ] Narration highlights key features of each room
- [ ] Multiple voice options are available
- [ ] Generated audio can be previewed and regenerated

## Story 11: Multilingual Support
**As a renter**, I want to hear tour narration in my preferred language
- [ ] Voiceover can be generated in multiple languages
- [ ] Language can be changed on the fly during playback
- [ ] Translation maintains accurate property terminology
- [ ] Voice remains natural in all supported languages
- [ ] Original narration is preserved as an option

# Backlog

## Tech Debt
-[x] migrate from sqlite to postgres
-[x] setup mux premium for longer videos
-[x] migrate /videos routes to new /manager structure
-[x] clean up unused routes and components
-[x] standardize route naming convention
-[x] improve type safety across routes
-[x] gesture conflict: wiping + detail view fire simultaneously {desktop only}
-[ ] mux deletions

## Enhancements
-[x] add functionality to settings link
-[x] add settings page for PMs — with change metro, update company
-[x] add settings page for renters — with change metro
-[x] restrict renter accounts from PM views
-[x] fix back button in feed
-[x] setup service worker for PWA
-[x] home screen icon
-styles:
-[x] replace blue color
-[x] style login and signup
-[x] make drawer translucent
-[x] screen size ratio
-Features:
-[x] double tap to save
-[x] places API + map view
-stack
-[x] test video annotations
-[ ] make API for test data
-[ ] put in capacitor

## Bugs
-[x] UI visible behind status bar
-[x] fix padding on upload and preview feed buttons
-[x] remove previous and next text in feed
-[x] consistent previews in confirm and edit views
-[x] video volume — why does only one video have sound on? why isnt it the first
-[x] video scrolling (w/ window and preloading)
-[x] screen size on load
-[x] mute by default
-[x] replace video in edit
-[ ] fix '/apple-touch-icon.png' 404 error
-[ ] fix video controls + gesture conflict

### Demo Videos
-[x] make MVP Video with "Responsive Design Mode"
-[x] voice over on phone video
-[ ] get 20 test videos / listings

##Portfolio readiness
-[x] bootstrap high convverting landing page with description.md
-[ ] add a video to the landing page
-[ ] add test account + login

### QA 
-[x] bug search
-[x] find enhancements
-[x] vet user stories 
-[ ] test long descriptions
