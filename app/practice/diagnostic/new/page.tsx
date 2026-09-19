import { createClientServer } from "@/lib/utils/supabase/server";
import { redirect } from "next/navigation";
import DiagnosticIntake from "@/components/DiagnosticIntake";

export default async function Page() {
  const supabase = await createClientServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");
  return (
    <div className="min-h-screen bg-gray-50/50">
      <main className="mx-auto w-full max-w-4xl p-6 pt-24 min-h-screen">
        <DiagnosticIntake />
      </main>
    </div>
  );
}
