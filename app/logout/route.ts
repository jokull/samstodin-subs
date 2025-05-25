import { NextRequest, NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/require-await
async function handler(request: NextRequest) {
  const rootUrl = new URL("/", request.headers.get("origin") ?? request.url);

  const response = NextResponse.redirect(rootUrl);
  response.cookies.set("__session", "", { expires: new Date(0) });
  return response;
}

export { handler as POST };
