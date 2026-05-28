"use client"

import { TOTAL_STEPS } from "@/lib/form-config"

interface ProgressBarProps {
  currentStep: number
}

export function ProgressBar({ currentStep }: ProgressBarProps) {
  const percentage = Math.round((currentStep / TOTAL_STEPS) * 100)

  return (
    <div className="w-full">
      <div className="mb-1.5 sm:mb-1">
        <span className="text-[11px] sm:text-xs font-medium text-muted-foreground">
          Pregunta {currentStep} de {TOTAL_STEPS}
        </span>
      </div>
      <div className="w-full h-2.5 sm:h-2 rounded-full overflow-hidden border border-[rgba(255,255,255,.10)] bg-[rgba(255,255,255,.06)]">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out shadow-[0_0_18px_rgba(59,130,246,.25)]"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={currentStep}
          aria-valuemin={1}
          aria-valuemax={TOTAL_STEPS}
          aria-label={`Pregunta ${currentStep} de ${TOTAL_STEPS}`}
        />
      </div>
    </div>
  )
}
