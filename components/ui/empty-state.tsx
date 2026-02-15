import type { ReactNode } from "react"

interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
}

export default function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-8 text-center">
      {icon && <div className="mx-auto mb-4 text-gray-500">{icon}</div>}
      <h3 className="text-lg font-semibold text-gray-200 mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-500 mb-6">{description}</p>}
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  )
}
