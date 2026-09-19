import type { CollegeTier } from "@/lib/types/diagnostic";
import type { DiagnosticRow } from "@/lib/services/diagnostic.service";
import type { SetProgress } from "@/lib/services/diagnostic.service";

function envelope<T>(json: unknown): T {
  const j = json as { data?: T; error?: string } | null;
  if (!j || typeof j !== "object" || !("data" in j)) {
    throw new Error((j as { error?: string } | null)?.error || "Bad response envelope");
  }
  return (j as { data: T }).data;
}

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const j = json as { error?: string } | null;
    throw new Error(j?.error || "Request failed");
  }
  return envelope<T>(json);
}

export async function startDiagnostic(opts: { tier: CollegeTier; monthsLeft: number }): Promise<{
  diagnosticId: string;
  setIds: string[];
}> {
  return post("/api/diagnostics/start", opts);
}

export async function fetchDiagnostic(id: string): Promise<{
  diagnostic: DiagnosticRow;
  progress: SetProgress[];
}> {
  const res = await fetch(`/api/diagnostics/${id}`);
  if (!res.ok) throw new Error("Failed to load diagnostic");
  return envelope(await res.json().catch(() => null));
}

export async function completeDiagnostic(id: string, targetRole?: string): Promise<{
  diagnostic: DiagnosticRow;
}> {
  return post(`/api/diagnostics/${id}/complete`, targetRole ? { targetRole } : {});
}

export async function exportDiagnosticToRoadmap(id: string, analysisId: string): Promise<{
  nodesAdded: number;
}> {
  return post(`/api/diagnostics/${id}/roadmap`, { analysisId });
}

export type { DiagnosticRow, SetProgress };
