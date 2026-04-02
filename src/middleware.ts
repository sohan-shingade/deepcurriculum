import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // Allow all requests through for now — auth check happens at page level
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/courses/:path*"],
};
