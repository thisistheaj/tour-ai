import { json, redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { getUser } from "~/session.server";
import { updateUserProfile } from "~/models/user.server";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  
  // Must be logged in
  if (!user) {
    return redirect("/login");
  }

  // If user type is set and all required fields are filled, redirect to home
  if (user.userType === "PROPERTY_MANAGER" && user.companyName) {
    return redirect("/manager");
  }
  if (user.userType === "RENTER" && user.city) {
    return redirect("/listings.feed");
  }

  // Determine which step to show
  const step = !user.userType ? 1 : 2;

  return json({ user, step });
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await getUser(request);
  if (!user) {
    return redirect("/login");
  }

  const formData = await request.formData();
  const userType = formData.get("userType");
  const companyName = formData.get("companyName");
  const contactInfo = formData.get("contactInfo");
  const city = formData.get("city");

  // Handle step 1 - user type selection
  if (userType === "PROPERTY_MANAGER" || userType === "RENTER") {
    await updateUserProfile(user.id, { userType });
    return redirect("/onboarding");
  }

  // Handle step 2 - profile details
  if (user.userType === "PROPERTY_MANAGER" && companyName && contactInfo) {
    await updateUserProfile(user.id, {
      companyName: companyName.toString(),
      contactInfo: contactInfo.toString(),
    });
    return redirect("/manager");
  }

  if (user.userType === "RENTER" && city) {
    await updateUserProfile(user.id, {
      city: city.toString(),
    });
    return redirect("/listings.feed");
  }

  return json({ error: "Invalid form submission" }, { status: 400 });
}

export default function Onboarding() {
  const { step, user } = useLoaderData<typeof loader>();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-4xl space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Let's get started</h2>
          <p className="mt-2 text-gray-600">
            {step === 1
              ? "How do you want to use TourAI?"
              : "Tell us a bit more"}
          </p>
        </div>

        {step === 1 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Form method="post">
              <input type="hidden" name="userType" value="PROPERTY_MANAGER" />
              <Button
                type="submit"
                variant="ghost"
                className="w-full p-0 h-auto hover:bg-transparent"
              >
                <Card className="w-full hover:border-blue-500 transition-colors cursor-pointer">
                  <CardHeader>
                    <CardTitle>Property Manager</CardTitle>
                    <CardDescription>
                      I want to list properties and manage tours
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      <li>Upload video tours</li>
                      <li>Manage property listings</li>
                      <li>Connect with potential renters</li>
                    </ul>
                  </CardContent>
                </Card>
              </Button>
            </Form>

            <Form method="post">
              <input type="hidden" name="userType" value="RENTER" />
              <Button
                type="submit"
                variant="ghost"
                className="w-full p-0 h-auto hover:bg-transparent"
              >
                <Card className="w-full hover:border-blue-500 transition-colors cursor-pointer">
                  <CardHeader>
                    <CardTitle>Renter</CardTitle>
                    <CardDescription>
                      I'm looking for my next home
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      <li>Browse video tours</li>
                      <li>Save favorite properties</li>
                      <li>Contact property managers</li>
                    </ul>
                  </CardContent>
                </Card>
              </Button>
            </Form>
          </div>
        ) : (
          <div className="mx-auto max-w-md">
            <Card>
              <CardHeader>
                <CardTitle>
                  {user.userType === "PROPERTY_MANAGER" 
                    ? "Property Manager Details" 
                    : "Where are you looking?"}
                </CardTitle>
                <CardDescription>
                  {user.userType === "PROPERTY_MANAGER"
                    ? "Help renters get in touch with you"
                    : "We'll show you available properties in your area"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form method="post" className="space-y-6">
                  {user.userType === "PROPERTY_MANAGER" ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company or Business Name</Label>
                        <Input
                          id="companyName"
                          name="companyName"
                          required
                          placeholder="Enter your company name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactInfo">Contact Information</Label>
                        <Input
                          id="contactInfo"
                          name="contactInfo"
                          required
                          placeholder="Phone number or email for inquiries"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Select name="city" defaultValue="austin" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a city" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="austin">Austin, Texas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <Button type="submit" className="w-full">
                    Complete Setup
                  </Button>
                </Form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
} 