import { createClientServer } from "@/lib/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const {summary, start, end} = await req.json();

    const supabase = await createClientServer();

    const {data: {user}} = await supabase.auth.getUser()

    const {data: tokens} = await supabase.from("user_integrations").select("*").eq("user_id", user?.id);

    if(!tokens){
        return NextResponse.json({error: "No tokens found"}, {status: 400})
    }
}