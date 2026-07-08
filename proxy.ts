import NextAuth from "next-auth";
import { authConfig } from "./lib/auth.config";

// Route protection (auth + role redirects) lives in authConfig.callbacks.authorized.
export const { auth: proxy } = NextAuth(authConfig);
export default proxy;

export const config = {
  matcher: ["/vendor/:path*", "/admin/:path*"],
};
