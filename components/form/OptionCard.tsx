"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface OptionCardProps {
  label: string
  selected: boolean
  multi?: boolean
  onClick: () => void
}

export function OptionCard({ label, selected, multi = false, onClick }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full min-h-11 flex items-start sm:items-center gap-3 px-4 py-3 sm:py-2 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer group touch-manipulation",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60a5fa]/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        "hover:border-[rgba(203,213,225,.55)] hover:bg-[rgba(255,255,255,.05)] active:bg-[rgba(255,255,255,.06)]",
        selected
          ? "border-[rgba(203,213,225,.65)] bg-[rgba(255,255,255,.06)] shadow-[0_12px_36px_rgba(0,0,0,.22)]"
          : "border-[rgba(255,255,255,.14)] bg-[rgba(255,255,255,.03)] text-foreground"
      )}
      aria-pressed={selected}
    >
      <span
        className={cn(
          "flex-shrink-0 w-5 h-5 mt-0.5 sm:mt-0.5 rounded-full border-2 flex items-center justify-center transition-all duration-200",
          multi ? "rounded-md" : "rounded-full",
          selected
            ? "border-[rgba(203,213,225,.80)] bg-[rgba(203,213,225,.22)]"
            : "border-[rgba(255,255,255,.28)] group-hover:border-[rgba(203,213,225,.55)]"
        )}
      >
        {selected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      </span>
      <span
        className={cn(
          "text-[13px] sm:text-sm font-medium leading-snug sm:leading-relaxed transition-colors duration-200",
          selected ? "text-foreground" : "text-foreground"
        )}
      >
        {label}
      </span>
    </button>
  )
}
