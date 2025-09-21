import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET() {
    const clientId = process.env.GOOGLE_CALENDER_CLIENT_ID;
    const appUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const redirectUri = `${appUrl}/api/calender/callback`;
    
    const scopes = [
        "https://www.googleapis.com/auth/calendar.events"
    ];

    const state = crypto.randomBytes(16).toString("hex");

    const oauthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    oauthUrl.searchParams.set("client_id", clientId ?? "");
    oauthUrl.searchParams.set("redirect_uri", redirectUri);
    oauthUrl.searchParams.set("response_type", "code");
    oauthUrl.searchParams.set("scope", scopes.join(" "));
    oauthUrl.searchParams.set("access_type", "offline");
    oauthUrl.searchParams.set("prompt", "consent");
    oauthUrl.searchParams.set("state", state);


    return NextResponse.redirect(oauthUrl.toString())


}