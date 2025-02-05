# Remix Routes Documentation

## Auth & System
- `routes/_index.tsx` - Landing page
- `routes/healthcheck.tsx` - Server health check endpoint
- `routes/join.tsx` - Sign up page
- `routes/login.tsx` - Login page
- `routes/logout.tsx` - Logout handler
- `routes/onboarding.tsx` - User type & profile setup

## Property Manager UI
- `routes/manager._index.tsx` - PM dashboard with navigation
- `routes/manager.listings.tsx` - List of PM's properties (migrated from videos._index.tsx)
- `routes/manager.new.tsx` - Create new listing form (migrated from videos.upload.tsx)
- `routes/manager.edit.$id.tsx` - Edit existing listing
- `routes/manager.settings.tsx` - Account settings

## Video Processing
- `routes/videos.create-upload.tsx` - Mux upload endpoint wrapper
- `routes/mux.webhook.tsx` - Webhook handler for Mux video processing

## Renter UI
- `routes/listings.feed.tsx` - TikTok-style video feed
- `routes/listings.saved.tsx` - Saved listings page
- `routes/listings.$id.tsx` - Individual listing view
- `routes/listings.settings.tsx` - User settings & preferences

## Route Details

### Auth Routes
- `/login` - Email/password login
- `/join` - New user registration
- `/logout` - Session termination
- `/onboarding` - User type selection and profile completion

### Property Manager Routes
- `/manager` - Dashboard with navigation
- `/manager/listings` - List all properties
- `/manager/new` - Create new listing
- `/manager/edit/:id` - Edit specific listing
- `/manager/settings` - Account management

### Renter Routes
- `/listings/feed` → `/listings.feed` - Main video feed interface
- `/listings/saved` → `/listings.saved` - Saved properties
- `/listings/:id` → `/listings.$id` - Detailed listing view
- `/listings/settings` → `/listings.settings` - User preferences

## Migration Notes
- `videos._index.tsx` → `manager.listings.tsx`
- `videos.upload.tsx` → `manager.new.tsx`

## Notes
- All routes should implement proper authentication checks
- Manager routes should verify PM role
- Listing routes should check city preferences
- Forms should implement proper validation
- Video routes handle Mux integration