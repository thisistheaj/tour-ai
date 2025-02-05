import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { redirect } from "@remix-run/node";
import type { User } from "@prisma/client";
import { getUser } from "~/session.server";
import { useOptionalUser } from "~/utils";
import { Button } from "~/components/ui/button";
import { 
  Video, 
  Clock, 
  MessageSquareText,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

export const meta: MetaFunction = () => [{ title: "TourAI - Your AI Apartment Tour Guide" }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request) as User | null;
  if (!user) return null;
  if (!user.userType) return redirect("/onboarding");
  if (user.userType === "RENTER" && !user.city) return redirect("/onboarding");
  if (user.userType === "PROPERTY_MANAGER" && !user.companyName) return redirect("/onboarding");
  return redirect(user.userType === "PROPERTY_MANAGER" ? "/manager" : "/listings/feed");
};

export default function Index() {
  return (
    <main className="min-h-screen bg-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40 z-10" />
        <div className="h-[600px] bg-gray-900">
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{ backgroundImage: 'url(/tour-ai-hero-full.png)' }} 
          />
            </div>
        
        <div className="absolute inset-0 z-20 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                Your AI Apartment Tour Guide
              </h1>
              <p className="text-xl text-white/90 mb-8">
                Transform your apartment hunt with immersive video tours and an AI assistant that knows every detail about each property. No more scheduling multiple in-person visits.
              </p>
              <div className="flex gap-4">
                <Button asChild size="lg" className="bg-amber-700 hover:bg-amber-800">
                  <Link to="/join">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <Link to="/login">Sign In</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose TourAI?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg border border-gray-200 shadow-sm bg-white">
              <Video className="h-10 w-10 text-amber-700 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Immersive Video Tours</h3>
              <p className="text-gray-600">Browse through high-quality video walkthroughs that make you feel like you're there in person.</p>
            </div>

            <div className="p-6 rounded-lg border border-gray-200 shadow-sm bg-white">
              <MessageSquareText className="h-10 w-10 text-amber-700 mb-4" />
              <h3 className="text-xl font-semibold mb-2">AI Tour Guide</h3>
              <p className="text-gray-600">Ask questions and get instant answers about any property detail from our intelligent AI assistant.</p>
            </div>

            <div className="p-6 rounded-lg border border-gray-200 shadow-sm bg-white">
              <Clock className="h-10 w-10 text-amber-700 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Save Time</h3>
              <p className="text-gray-600">No more scheduling conflicts or wasted trips. Tour properties on your own schedule.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Everything You Need</h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-amber-700 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-1">TikTok-Style Interface</h3>
                  <p className="text-gray-600">Swipe through property tours with our intuitive, engaging interface.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-amber-700 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-1">Smart Property Matching</h3>
                  <p className="text-gray-600">Our AI learns your preferences to show you properties you'll love.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-amber-700 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-1">Instant Information</h3>
                  <p className="text-gray-600">Get detailed property information, pricing, and availability in real-time.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-amber-700 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-1">Save & Compare</h3>
                  <p className="text-gray-600">Bookmark your favorite properties and easily compare their features.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-amber-700 to-amber-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Transform Your Apartment Search?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of renters who have found their perfect home using TourAI's intelligent apartment touring platform.
          </p>
          <Button asChild size="lg" className="bg-white text-amber-700 hover:bg-white/90">
            <Link to="/join">Get Started Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
      </div>
      </section>
    </main>
  );
}
