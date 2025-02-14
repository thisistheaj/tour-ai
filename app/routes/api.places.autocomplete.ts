import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const input = url.searchParams.get("input");
  const key = url.searchParams.get("key");

  if (!input || !key) {
    return json({ predictions: [] });
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        input
      )}&key=${key}&components=country:us&types=address`
    );

    const data = await response.json();
    
    if (!data.predictions || data.status === "ZERO_RESULTS") {
      return json({ predictions: [] });
    }

    if (data.status !== "OK") {
      return json({ 
        error: { message: data.error_message || "Failed to fetch suggestions" },
        predictions: []
      });
    }

    return json({ predictions: data.predictions.slice(0, 3) });
  } catch (error) {
    return json({ 
      error: { message: "Failed to fetch suggestions" },
      predictions: []
    });
  }
} 