"use client"

import { TOTAL_STEPS } from "@/lib/form-config"

interface ProgressBarProps {
  currentStep: number
}

export function ProgressBar({ currentStep }: ProgressBarProps) {
  const percentage = Math.round((currentStep / TOTAL_STEPS) * 100)

  return (
    <div className="w-full">
      <div className="mb-2.5 sm:mb-2">
        <span className="text-xs sm:text-sm font-medium text-muted-foreground">
          Pregunta {currentStep} de {TOTAL_STEPS}
        </span>
      </div>
      <div className="w-full h-2.5 sm:h-2 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
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
