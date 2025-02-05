# Implementing Mux Video Streaming in Remix

This guide explains how to implement video uploading and streaming using Mux in a Remix application. We'll break down each component and explain how they work together.

## Prerequisites

1. Create a Mux account at [dashboard.mux.com](https://dashboard.mux.com)
2. Get your API credentials from the Mux dashboard
3. Install required packages:
```bash
npm install @mux/mux-node @mux/mux-player-react @mux/mux-uploader-react
```

## Component Overview

The implementation consists of several key files that work together:

1. Mux Client Setup
2. Video Upload Component
3. Upload Status Checker
4. Video Playback Component
5. Webhook Handler (Optional)

Let's break down each component:

### 1. Mux Client Setup (`app/lib/mux.server.ts`)

This file initializes the Mux client for server-side operations:

```typescript
import Mux from "@mux/mux-node";

const mux = new Mux();
export default mux;
```

Add your Mux credentials to your `.env` file:
```
MUX_TOKEN_ID=your-token-id
MUX_TOKEN_SECRET=your-token-secret
```

### 2. Video Upload Component (`app/routes/_index.tsx` or your desired route)

The upload component handles:
- Creating a direct upload URL
- Handling the upload process
- Redirecting to a status page

Key implementation steps:

1. Create a loader to get the upload URL:
```typescript
export const loader = async () => {
  const upload = await mux.video.uploads.create({
    new_asset_settings: {
      playback_policy: ["public"],
      encoding_tier: "baseline",
    },
    cors_origin: "*", // Change this to your domain in production
  });
  return json({ id: upload.id, url: upload.url });
};
```

2. Create the upload form:
```typescript
export default function UploadPage() {
  const { id, url } = useLoaderData<typeof loader>();
  const [isUploadSuccess, setIsUploadSuccess] = useState(false);

  return (
    <Form method="post">
      <MuxUploader 
        endpoint={url} 
        onSuccess={() => setIsUploadSuccess(true)} 
      />
      <input type="hidden" name="uploadId" value={id} />
      <button type="submit" disabled={!isUploadSuccess}>
        {isUploadSuccess ? "Watch video" : "Waiting for upload..."}
      </button>
    </Form>
  );
}
```

### 3. Upload Status Checker (`app/routes/status.$assetId.tsx`)

This component polls the Mux API to check the status of the uploaded video:

```typescript
export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { assetId } = params;
  const asset = await mux.video.assets.retrieve(assetId);

  if (asset.status === "ready") {
    const playbackIds = asset.playback_ids;
    if (Array.isArray(playbackIds)) {
      const playbackId = playbackIds.find((id) => id.policy === "public");
      if (playbackId) {
        return redirect(`/playback/${playbackId.id}`);
      }
    }
  }

  return json({
    status: asset.status,
    errors: asset.errors,
  });
};
```

### 4. Video Playback Component (`app/routes/playback.$playbackId.tsx`)

This component handles video playback using the Mux Player:

```typescript
export default function Page() {
  const { playbackId } = useParams();
  return (
    <MuxPlayer
      style={{
        width: "100%",
        height: "auto",
        aspectRatio: "16/9",
      }}
      playbackId={playbackId}
      metadata={{ player_name: "your-app-name" }}
    />
  );
}
```

### 5. Webhook Handler (Optional, `app/routes/mux.webhook.ts`)

For production applications, implement a webhook handler to receive real-time updates about video processing:

```typescript
export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const body = await request.text();
  const event = mux.webhooks.unwrap(
    body,
    request.headers,
    process.env.MUX_WEBHOOK_SIGNING_SECRET
  );

  switch (event.type) {
    case "video.asset.ready":
      // Handle video ready event
      break;
    // Handle other events as needed
  }

  return json({ message: "ok" });
};
```

## Implementation Steps

1. **Setup**:
   - Install required packages
   - Create `.env` file with Mux credentials
   - Create the Mux client file

2. **Create Routes**:
   - Upload page
   - Status checker
   - Playback page
   - Webhook handler (optional)

3. **Configure Environment**:
   - Add environment variables to your hosting platform
   - Set up CORS for your domain
   - Configure webhook URL in Mux dashboard (if using webhooks)

4. **Testing**:
   - Test upload flow
   - Verify video processing
   - Check playback
   - Test webhook handling (if implemented)

## Best Practices

1. **Security**:
   - Always validate webhook signatures in production
   - Use environment variables for sensitive credentials
   - Set appropriate CORS origins

2. **User Experience**:
   - Show upload progress
   - Provide clear status updates
   - Handle errors gracefully

3. **Performance**:
   - Use appropriate encoding settings
   - Implement proper error handling
   - Consider implementing retry logic for failed uploads

4. **SEO & Sharing**:
   - Implement proper meta tags for video content
   - Add OpenGraph and Twitter card meta tags
   - Consider implementing structured data

## Additional Features

You can enhance your implementation with:

1. Upload progress indicators
2. Custom player themes
3. Analytics integration
4. Thumbnail generation
5. Video preprocessing
6. Adaptive bitrate streaming

Remember to check [Mux's documentation](https://docs.mux.com) for the latest features and best practices. 