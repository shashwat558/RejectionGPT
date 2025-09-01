import { createClientServer } from "@/lib/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest) {
    const supabase = await createClientServer();

    const code = req.nextUrl.searchParams.get("code");
    if(!code) {
        return NextResponse.json({error: "Missing code"}, {status: 400});

    }

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            code,
            client_secret: process.env.GOOGLE_CALENDER_CLIENT_SECRET ?? "",
            client_id: process.env.GOOGLE_CALENDER_CLIENT_ID ?? "",
            redirect_uri:"http://localhost:3000/api/calender/callback",
            grant_type: "authorization_code",


        })
    })

    const tokens = await tokenResponse.json();

    const {data: {user}} = await supabase.auth.getUser();

    if(user){
       await supabase.from("user_integrations").upsert({
         user_id: user.id,
         provider: "google_calender",
         access_token: tokens.access_token,
         refresh_token: tokens.refresh_token,
         expiry_date: Date.now() + tokens.expires_in  * 1000

       })
    }

    return NextResponse.redirect("analyze?calender=connected")


}