# Video Room Analysis Implementation Plan

## Overview
We need to add AI-powered room analysis to our listing creation flow. This will analyze apartment tour videos to automatically identify and timestamp different rooms, improving the listing experience.

## Requirements
- Add room analysis as step 2 of 4 in listing creation
- Process video through Gemini AI after Mux upload
- Show analysis progress with appropriate UI states
- Store results in existing Video model
- Allow manual skip if analysis fails

## Implementation Steps

### 1. Database Update
Add a JSONB `rooms` field to the Video table to store room timestamps. Create a migration:

```sql
-- Add rooms field to Video table
ALTER TABLE "Video" ADD COLUMN "rooms" JSONB;
```

### 2. Video Analysis Function
Create this function to handle Gemini API interaction. Here's the core logic to implement:

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function analyzeVideoRooms(muxPlaybackId: string) {
  // Get video from Mux
  const muxUrl = `https://stream.mux.com/${muxPlaybackId}/low.mp4`;
  const videoResponse = await fetch(muxUrl);
  const videoBlob = await videoResponse.blob();
  const base64 = await blobToBase64(videoBlob);

  // Initialize Gemini
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      temperature: 1,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
    }
  });

  // Start chat session
  const chatSession = model.startChat({
    history: [
      {
        role: "user",
        parts: [
          {
            fileData: {
              mimeType: "video/mp4",
              fileUri: base64
            },
          },
        ],
      },
      {
        role: "user",
        parts: [
          {
            text: "Using this apartment tour video, please answer the below questions:\n\nwhat rooms are shown? (try to differentiate between a living room and bedrooms; if you cannot, label them \"room 1\", \"room 2\" etc — label all bathrooms and kitchens as such)\nwhat are the timestamps in the video where each room begins to be shown\noutput as a JSON array if possible, like so: \n\n```[{ \"room\": \"Bedroom 1\", \"timestamp\": \"1:23\" }, ... ]```"
          },
        ],
      },
    ],
  });

  const result = await chatSession.sendMessage("Please analyze the video");
  return JSON.parse(result.response.text());
}
```

### 3. Route Updates

1. Create a new route handler for room analysis:
- Path: `app/routes/videos.analyze-rooms.tsx`
- Handle POST requests with muxAssetId
- Implement proper error handling
- Return room analysis results

2. Update `manager.new.tsx`:
- Add new step for room analysis
- Implement loading states
- Handle success/error cases
- Allow manual skip if needed

### 4. UI Requirements

Create a new step in the listing creation flow that shows:
1. Loading state with spinner while processing
2. Success state showing identified rooms
3. Error state with retry and skip options
4. Auto-advance to property info on success

### 5. Error Handling

Implement these error cases:
- Video not found
- Gemini API failures
- Invalid response format
- File size limits
- Network issues

### 6. Type Updates

Add types for:
- Room analysis response
- Video model with rooms field
- API response formats

## Implementation Notes

1. **Video Processing**
- Use Mux's low.mp4 quality to stay under Gemini's 4MB limit
- Implement proper error handling for size issues

2. **Security**
- Verify user owns video before analysis
- Validate all API responses
- Implement rate limiting

3. **UI/UX**
- Show clear progress indicators
- Make skip option easily accessible
- Preserve analysis results if user goes back

4. **Performance**
- Don't block UI during processing
- Consider implementing a job queue for analysis
- Cache results when possible

## Testing Requirements

1. **Happy Path**
- Video uploads successfully
- Analysis completes
- Results displayed correctly
- Auto-advances to next step

2. **Error Cases**
- Network failures
- Invalid videos
- API errors
- Skip functionality

3. **Edge Cases**
- Very short/long videos
- Different room layouts
- Various video qualities

## Next Steps
After implementation, we should:
- Monitor success rates
- Gather feedback on accuracy
- Consider adding room verification
- Optimize performance if needed

Please implement this feature following our existing patterns and UI components. Use shadcn components for consistency and follow the error handling patterns from our other routes.

# Appendix: Original Prompt from Gemini API

This is an example script replicating an interaction with the Gemini API to annotate a video.


```javascript
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);

/**
 * Uploads the given file to Gemini.
 *
 * See https://ai.google.dev/gemini-api/docs/prompting_with_media
 */
async function uploadToGemini(path, mimeType) {
  const uploadResult = await fileManager.uploadFile(path, {
    mimeType,
    displayName: path,
  });
  const file = uploadResult.file;
  console.log(`Uploaded file ${file.displayName} as: ${file.name}`);
  return file;
}

/**
 * Waits for the given files to be active.
 *
 * Some files uploaded to the Gemini API need to be processed before they can
 * be used as prompt inputs. The status can be seen by querying the file's
 * "state" field.
 *
 * This implementation uses a simple blocking polling loop. Production code
 * should probably employ a more sophisticated approach.
 */
async function waitForFilesActive(files) {
  console.log("Waiting for file processing...");
  for (const name of files.map((file) => file.name)) {
    let file = await fileManager.getFile(name);
    while (file.state === "PROCESSING") {
      process.stdout.write(".")
      await new Promise((resolve) => setTimeout(resolve, 10_000));
      file = await fileManager.getFile(name)
    }
    if (file.state !== "ACTIVE") {
      throw Error(`File ${file.name} failed to process`);
    }
  }
  console.log("...all files ready\n");
}

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

async function run() {
  // TODO Make these files available on the local file system
  // You may need to update the file paths
  const files = [
    await uploadToGemini("IMG_2959.MOV", "video/quicktime"),
  ];

  // Some files have a processing delay. Wait for them to be ready.
  await waitForFilesActive(files);

  const chatSession = model.startChat({
    generationConfig,
    history: [
      {
        role: "user",
        parts: [
          {
            fileData: {
              mimeType: files[0].mimeType,
              fileUri: files[0].uri,
            },
          },
        ],
      },
      {
        role: "user",
        parts: [
          {text: "Using this apartment tour video, please answer the below questions:\n\nwhat rooms are shown? (try to differentiate between a living room and bedrooms; if you cannot, label them \"room 1\", \"room 2\" etc — label all bathrooms and kitchens as such)\nwhat are the timestamps in the video where each room begins to be shown\noutput as a JSON array if possible, like so: \n\n```[{ \"room\": \"Bedroom 1\", \"timestamp\": \"1:23\" }, ... ]```"},
        ],
      },
    ],
  });

  const result = await chatSession.sendMessage("INSERT_INPUT_HERE");
  console.log(result.response.text());
}

run();
```