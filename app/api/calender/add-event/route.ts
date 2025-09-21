/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createClientServer } from "@/lib/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const {summary, start, end} = await req.json();

    const supabase = await createClientServer();

    const {data: {user}} = await supabase.auth.getUser()

    const {data: tokens} = await supabase.from("user_integrations").select("*").eq("user_id", user?.id);

    if(!tokens){
        return NextResponse.json({error: "No tokens found"}, {status: 400})
    };
    //@ts-ignore
    let {access_token, expiry_date} = tokens;
    //@ts-ignore
    const {refresh_token} = tokens;

    if(new Date(expiry_date) < new Date()){
        const refreshRes = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: {
                "Content-type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                client_id: process.env.GOOGLE_CALENDER_CLIENT_ID ?? "",
                client_secret: process.env.GOOGLE_CALENDER_CLIENT_SECRET ?? "",
                refresh_token,
                grant_type:"refresh_token"
            })
        });

        const newToken = await refreshRes.json();
        access_token = newToken.access_token;
        expiry_date = new Date(Date.now() + newToken.expires_at * 1000).toISOString();
        await supabase.from("user_integrations").update({
            access_token: access_token,
            expiry_date: expiry_date
        }).eq("user_id", user?.id);

    }

    const event = {
        summary,
        start: {dateTime: start},
        end: {dateTime: end}
    }

    const res = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${access_token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(event)
    }) 
    
    const data = await res.json();
    console.log(data)
    return NextResponse.json({success: true},{status: 200})
}