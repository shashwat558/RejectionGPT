interface ErrorStateProps {
  title?: string
  message?: string
  action?: React.ReactNode
}

export default function ErrorState({
  title = "Something went wrong",
  message = "Please try again in a moment.",
  action,
}: ErrorStateProps) {
  return (
    <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-6 text-center">
      <h3 className="text-base font-semibold text-rose-100 mb-2">{title}</h3>
      <p className="text-sm text-rose-200/70 mb-4">{message}</p>
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  )
}
