import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Logo } from "~/components/Logo";

export default function SignupPage() {
  async function signupAction(formData: FormData) {
    "use server";
    
    const email = (formData.get("email") as string | null) ?? "";
    const { db } = await import("~/lib/db");
    const { Email } = await import("~/schema");
    const { getSealedSession, getSessionCookieSettings } = await import("~/lib/session");
    
    // Log the registration attempt for Gunnar's list
    await db.insert(Email).values({ 
      email: email.toLowerCase().trim(), 
      source: "direct-signup-form" 
    }).onConflictDoNothing();
    console.log(`[signupAction] Logged signup attempt for: ${email}`);
    
    // Create a session with the user's email
    cookies().set({
      value: await getSealedSession(email.toLowerCase().trim()),
      ...getSessionCookieSettings(),
    });
    console.log(`[signupAction] Session created for ${email}, redirecting to profile creation.`);
    
    // Redirect to the homepage. The logic there will now detect
    // the session and show the user the profile creation form.
    redirect("/");
  }

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-4">
        <Logo />
        <h1 className="text-3xl font-black mt-8 mb-4">Nýskráning</h1>
        <p className="mb-6 text-gray-700">
          Með áskrift að Samstöðinni styrkir þú óháða fjölmiðlun. Byrjaðu á því að slá inn netfangið þitt.
        </p>
        
        <form action={signupAction}>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Netfang</label>
          <div className="mt-1">
            <input
              type="email"
              name="email"
              id="email"
              placeholder="netfang@example.com"
              required
              autoFocus
              className="w-full p-3 border border-gray-300 rounded-md cursor-text hover:border-gray-400 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button 
            type="submit" 
            className="mt-6 w-full bg-neutral-950 text-white p-3 rounded-md cursor-pointer hover:bg-neutral-800 transition-colors"
          >
            Halda áfram
          </button>
        </form>
        
        <div className="text-center mt-6 pt-6 border-t">
          <p className="text-sm text-gray-600">
            Ertu þegar með aðgang?{' '}
            <a href="/login" className="font-medium text-blue-600 hover:underline cursor-pointer">
              Skráðu þig inn
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 