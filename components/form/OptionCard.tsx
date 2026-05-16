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
        "w-full flex items-start sm:items-center gap-3 px-4 py-3.5 sm:py-2.5 min-h-[3rem] sm:min-h-0 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer group touch-manipulation",
        "hover:border-primary/50 hover:bg-primary/5 active:bg-primary/5",
        selected
          ? "border-primary bg-primary/8 shadow-sm"
          : "border-border bg-card text-foreground"
      )}
      aria-pressed={selected}
    >
      <span
        className={cn(
          "flex-shrink-0 w-5 h-5 mt-0.5 sm:mt-0 rounded-full border-2 flex items-center justify-center transition-all duration-200",
          multi ? "rounded-md" : "rounded-full",
          selected
            ? "border-primary bg-primary"
            : "border-muted-foreground/40 group-hover:border-primary/60"
        )}
      >
        {selected && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
      </span>
      <span
        className={cn(
          "text-[15px] sm:text-sm font-medium leading-snug sm:leading-relaxed transition-colors duration-200",
          selected ? "text-primary" : "text-foreground"
        )}
      >
        {label}
      </span>
    </button>
  )
}
