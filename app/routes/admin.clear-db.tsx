import { json, type ActionFunctionArgs } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { clearDatabase } from "~/lib/clear-db.server";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

export async function action({ request }: ActionFunctionArgs) {
  const authHeader = request.headers.get("Authorization");
  
  if (!ADMIN_TOKEN || authHeader !== `Bearer ${ADMIN_TOKEN}`) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  await clearDatabase();
  return json({ success: true });
}

export default function ClearDbRoute() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Clear Database</h1>
      <Form method="post" className="space-y-4">
        <p className="text-red-600 font-semibold">
          Warning: This will delete all data in the database. This action cannot be undone.
        </p>
        <button
          type="submit"
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Clear Database
        </button>
      </Form>
    </div>
  );
} 