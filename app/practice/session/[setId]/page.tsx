import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClientServer } from "@/lib/utils/supabase/server";
import { redirect } from "next/navigation";
import { getPracticeSetDetail } from "@/lib/services/practice.service";
import PracticeSession from "@/components/PracticeSession";

export default async function Page({ params }: { params: Promise<{ setId: string }> }) {
  const { setId } = await params;
  const supabase = await createClientServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  let detail;
  try {
    detail = await getPracticeSetDetail(data.user.id, setId);
  } catch {
    redirect("/practice");
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <main className="mx-auto w-full max-w-4xl p-6 pt-24 min-h-screen">
        <div className="flex items-center justify-between mb-2">
          <Link href="/practice" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition-colors">
            <ArrowLeft className="w-4 h-4" /> All practice
          </Link>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
            {detail.track} · {detail.topic} · {detail.difficulty}
          </span>
        </div>
        <PracticeSession detail={detail} />
      </main>
    </div>
  );
}
