"use client"

import type { ButtonHTMLAttributes, PropsWithChildren } from "react"

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
  loadingText?: string
}

export default function LoadingButton({
  isLoading = false,
  loadingText,
  disabled,
  children,
  className = "",
  ...props
}: PropsWithChildren<LoadingButtonProps>) {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? (
        <>
          <span
            className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"
            aria-hidden="true"
          />
          <span>{loadingText || "Loading..."}</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}
