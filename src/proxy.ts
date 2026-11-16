import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isSignIn = createRouteMatcher(["/console/sign-in(.*)"]);

// Only the console needs a signed-in user; the rest of the site stays
// static and never loads Clerk.
export default clerkMiddleware(
  async (auth, req) => {
    if (!isSignIn(req)) await auth.protect();
  },
  { signInUrl: "/console/sign-in" },
);

export const config = {
  matcher: ["/console/:path*", "/console"],
};
