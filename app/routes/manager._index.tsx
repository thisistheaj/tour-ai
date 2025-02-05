import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getUser } from "~/session.server";
import { Button } from "~/components/ui/button";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  if (!user) {
    return redirect("/login");
  }
  if (user.userType !== "PROPERTY_MANAGER") {
    return redirect("/");
  }
  return json({ user });
}

export default function ManagerDashboard() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <div className="mr-8 font-semibold">TourAI Manager</div>
          <nav className="flex items-center space-x-4 lg:space-x-6">
            <Button asChild variant="ghost">
              <Link to="/manager/listings">My Listings</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/manager/new">Add Listing</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/manager/settings">Settings</Link>
            </Button>
          </nav>
          <div className="ml-auto flex items-center space-x-4">
            <span className="text-sm text-gray-500">{user.email}</span>
            <Button asChild variant="outline">
              <Link to="/logout">Logout</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-8">Welcome to TourAI Manager</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link to="/manager/listings">
            <div className="p-6 border rounded-lg hover:border-blue-500 transition-colors">
              <h2 className="text-xl font-semibold mb-2">My Listings</h2>
              <p className="text-gray-600">View and manage your property listings</p>
            </div>
          </Link>
          
          <Link to="/manager/new">
            <div className="p-6 border rounded-lg hover:border-blue-500 transition-colors">
              <h2 className="text-xl font-semibold mb-2">Add New Listing</h2>
              <p className="text-gray-600">Create a new property listing with video tour</p>
            </div>
          </Link>
          
          <Link to="/manager/settings">
            <div className="p-6 border rounded-lg hover:border-blue-500 transition-colors">
              <h2 className="text-xl font-semibold mb-2">Settings</h2>
              <p className="text-gray-600">Manage your account and preferences</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
} 