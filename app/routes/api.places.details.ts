import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const placeId = url.searchParams.get("place_id");
  const key = url.searchParams.get("key");

  if (!placeId || !key) {
    return json({ error: { message: "Missing required parameters" } }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${key}&fields=formatted_address,address_components`
    );

    const data = await response.json();
    return json(data);
  } catch (error) {
    return json(
      { error: { message: "Failed to fetch place details" } },
      { status: 500 }
    );
  }
} 