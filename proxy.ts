import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/admin(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();                    // ✅ protect() is on the helper

    if (isAdminRoute(req)) {
      const { userId } = await auth();       // ✅ userId comes from calling auth()

      const producerClerkId =
        process.env.NEXT_PUBLIC_PRODUCER_CLERK_ID ||
        process.env.PRODUCER_CLERK_ID;

      if (!producerClerkId) {
        console.warn("⚠️  PRODUCER_CLERK_ID not set. All authenticated users can access admin.");
        return;
      }

      if (!userId || userId !== producerClerkId) {
        return Response.redirect(new URL("/unauthorized", req.url));
      }
    }
  }
});

export const config = {
  matcher: ["/(admin|dashboard)(.*)"],
};