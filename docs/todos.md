# AI Chat Interface for Listings

## Principles
- Keep it simple - just Q&A between renter and AI
- Reuse existing UI patterns from feed
- Store chat history in browser (localStorage)
- Focus on helpful, contextual responses

## What We're Building
- Chat bubble UI in listing feed
- AI responses based on listing data
- Per-user, per-listing chat history
- Basic text Q&A only

## Implementation Sequence

### Phase 1: Chat UI Shell ✓
- [x] Add chat bubble trigger in listing actions
- [x] Create slide-up chat panel (similar to description panel)
- [x] Add message input and history display
- [x] Style with existing feed UI patterns
- [x] Add loading states
- [x] Test UI interactions with mock data

### Phase 2: E2E AI Integration (Current)
- [ ] Create listing-ai.server.ts for LLM wrapper:
  ```typescript
  async function getListingResponse(
    question: string,
    listing: Video,
    chatHistory: ChatMessage[]
  ): Promise<string>
  ```
- [ ] Format listing data as context
- [ ] Add temperature/prompt tuning
- [ ] Add "chat" action to feed handler
- [ ] Wire up UI to send/receive messages
- [ ] Add error handling
- [ ] Test with real questions

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
- [ ] Responses feel natural and helpful
- [ ] Fast response times (<2s)
- [ ] Graceful error handling
- [ ] Chat history persists across refreshes

## Testing Notes
- [x] After Phase 1: Test UI flow with mock data
- [ ] After Phase 2: Test real AI responses
- [ ] After Phase 3: Test history persistence 