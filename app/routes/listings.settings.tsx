import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import { requireUser } from "~/session.server";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { ArrowLeft } from "lucide-react";
import { Link } from "@remix-run/react";
import { prisma } from "~/db.server";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  
  if (user.userType !== "RENTER") {
    return redirect("/");
  }

  return json({ user });
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);
  
  if (user.userType !== "RENTER") {
    return redirect("/");
  }

  const formData = await request.formData();
  const city = formData.get("city");

  if (!city) {
    return json(
      { errors: { form: "City is required" } },
      { status: 400 }
    );
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        city: city.toString(),
      },
    });

    return redirect("/listings/feed");
  } catch (error) {
    console.error("Error updating settings:", error);
    return json(
      { errors: { form: "Error updating settings" } },
      { status: 500 }
    );
  }
}

export default function RenterSettings() {
  const { user } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="container mx-auto p-4 pb-24">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/listings/feed">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Feed
          </Link>
        </Button>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Choose your metro area to see available properties</CardDescription>
        </CardHeader>

        <CardContent>
          <Form method="post" className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="city">Metro Area</Label>
              <Select name="city" defaultValue={user.city || "austin"} required>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your metro" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="austin">Austin, Texas</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                Your feed will show available properties in your chosen metro area
              </p>
            </div>

            <Button 
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 