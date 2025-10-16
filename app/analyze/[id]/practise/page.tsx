import DSASuggestionsPage from "@/components/dsa-component";


export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main
      className="mx-auto w-full max-w-6xl p-6 min-h-screen"
    
    >
      <section className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-300 ">DSA Suggestions</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Handpicked problems with a clean, modern presentation. No bright colors, just focus.
        </p>
      </section>
      <DSASuggestionsPage analysisId={id} />
    </main>
  )
}
