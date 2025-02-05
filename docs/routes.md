# Remix Routes Documentation

## Existing Routes

### Auth & System
- `routes/_index.tsx` - Landing page
- `routes/healthcheck.tsx` - Server health check endpoint
- `routes/join.tsx` - Sign up page
- `routes/login.tsx` - Login page
- `routes/logout.tsx` - Logout handler

### Video Processing
- `routes/videos.upload.tsx` - Video upload page
- `routes/videos.create-upload.tsx` - Mux upload endpoint wrapper
- `routes/mux.webhook.tsx` - Webhook handler for Mux video processing

## Needed Routes

### Property Manager UI
- `routes/manager._index.tsx` - PM dashboard overview
- `routes/manager.listings.tsx` - List of PM's properties
- `routes/manager.new.tsx` - Create new listing form
- `routes/manager.edit.$id.tsx` - Edit existing listing
- `routes/manager.settings.tsx` - Account settings

### Renter UI
- `routes/listings.feed.tsx` - TikTok-style video feed
- `routes/listings.saved.tsx` - Saved listings page
- `routes/listings.$id.tsx` - Individual listing view
- `routes/listings.settings.tsx` - User settings & preferences
- `routes/listings.onboarding.tsx` - City selection during first login

## Route Details

### Auth Routes
- `/login` - Email/password login
- `/join` - New user registration
- `/logout` - Session termination
- `/listings/onboarding` - First-time city selection

### Property Manager Routes
- `/manager` - Dashboard home
- `/manager/listings` - List all properties
- `/manager/new` - Create new listing
- `/manager/edit/:id` - Edit specific listing
- `/manager/settings` - Account management

### Renter Routes
- `/listings/feed` - Main video feed interface
- `/listings/saved` - Saved properties
- `/listings/:id` - Detailed listing view
- `/listings/settings` - User preferences

### Video Processing
- `/videos/upload` - Video upload interface
- `/videos/create-upload` - Mux endpoint
- `/mux.webhook` - Mux status updates

## Notes
- All routes should implement proper authentication checks
- Manager routes should verify PM role
- Listing routes should check city preferences
- Forms should implement proper validation
- Video routes handle Mux integration