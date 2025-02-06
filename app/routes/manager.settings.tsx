import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import { requireUser } from "~/session.server";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
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
  
  if (user.userType !== "PROPERTY_MANAGER") {
    return redirect("/");
  }

  return json({ user });
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);
  
  if (user.userType !== "PROPERTY_MANAGER") {
    return redirect("/");
  }

  const formData = await request.formData();
  const companyName = formData.get("companyName");
  const contactInfo = formData.get("contactInfo");
  const city = formData.get("city");

  if (!companyName || !contactInfo || !city) {
    return json(
      { errors: { form: "All fields are required" } },
      { status: 400 }
    );
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        companyName: companyName.toString(),
        contactInfo: contactInfo.toString(),
        city: city.toString(),
      },
    });

    return redirect("/manager");
  } catch (error) {
    console.error("Error updating settings:", error);
    return json(
      { errors: { form: "Error updating settings" } },
      { status: 500 }
    );
  }
}

export default function ManagerSettings() {
  const { user } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="container mx-auto p-4 pb-24">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/manager">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your company information and preferences</CardDescription>
        </CardHeader>

        <CardContent>
          <Form method="post" className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                name="companyName"
                defaultValue={user.companyName || ""}
                placeholder="Enter your company name..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactInfo">Contact Information</Label>
              <Input
                id="contactInfo"
                name="contactInfo"
                defaultValue={user.contactInfo || ""}
                placeholder="Phone number or email for renters to contact you..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Primary City</Label>
              <Select name="city" defaultValue={user.city || "austin"} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="austin">Austin, Texas</SelectItem>
                </SelectContent>
              </Select>
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