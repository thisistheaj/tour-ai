# AI Chat Interface for Listings

## Principles
- Keep it simple - just Q&A between renter and AI
- Reuse existing UI patterns from feed
- Store chat history in browser (localStorage)
- Focus on helpful, contextual responses

## What We're Building
- [x] Chat bubble UI in listing feed
- [x] AI responses based on listing data
- [ ] Per-user, per-listing chat history
- [x] Basic text Q&A only
- [ ] Video timestamp navigation from chat

## Implementation Sequence

### Phase 1: Chat UI Shell ✓
- [x] Add chat bubble trigger in listing actions
- [x] Create slide-up chat panel (similar to description panel)
- [x] Add message input and history display
- [x] Style with existing feed UI patterns
- [x] Add loading states
- [x] Test UI interactions with mock data

### Phase 2: E2E AI Integration ✓
- [x] Create listing-ai.server.ts for LLM wrapper
- [x] Format listing data as context
- [x] Add temperature/prompt tuning
- [x] Add "chat" action to feed handler
- [x] Wire up UI to send/receive messages
- [x] Add error handling
- [x] Test with real questions

### Phase 2.5: Video Navigation
- [ ] Update AI prompt to handle room timestamp requests
- [ ] Add JSON response parsing for timestamps
- [ ] Implement video timestamp navigation
- [ ] Test video navigation from chat

### Phase 3: State Management
- [ ] Add chat state to feed:
  ```typescript
  interface ChatMessage {
    text: string;
    isUser: boolean;
    timestamp: number;
  }
  ```
- [ ] Store history in localStorage by `${userId}-${videoId}`
- [ ] Load history on chat open
- [ ] Clear history functionality
- [ ] Test state persistence

## Success Criteria
- [x] UI feels integrated with feed
- [x] Responses feel natural and helpful
- [x] Fast response times (<2s)
- [x] Graceful error handling
- [ ] Chat history persists across refreshes
- [ ] Video navigation works smoothly

## Testing Notes
- [x] After Phase 1: Test UI flow with mock data
- [x] After Phase 2: Test real AI responses
- [ ] After Phase 2.5: Test video navigation
- [ ] After Phase 3: Test history persistence 

## Story 5: Chat Interface
**As a renter**, I want to chat with AI about apartment listings
- [x] Chat interface is accessible via a persistent chat bubble
- [x] Chat bubble is positioned at the bottom of the video feed
- [x] Chat interface opens in an overlay without interrupting video playback
- [x] Chat maintains context about the current listing being viewed
- [x] AI responses are based on listing details and video analysis

## Story 6: Room Navigation
**As a renter**, I want to use chat to navigate to specific rooms in the video
- [x] Can ask natural language questions about specific rooms
- [x] AI recognizes room-related queries (e.g., "show me the kitchen")
- [x] Video automatically jumps to the timestamp of the requested room
- [x] AI provides context about the room being shown
- [x] Navigation works with all identified room types

## Story 7: Listing Information Queries
**As a renter**, I want to ask the AI specific questions about the listing
- [x] Can ask about property features and amenities
- [x] Can ask about pricing and availability
- [x] Can ask about location and neighborhood
- [x] AI responses are based on listing data and video analysis
- [x] AI indicates if requested information is not available 