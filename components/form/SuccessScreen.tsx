"use client"

import { CheckCircle2 } from "lucide-react"

export function SuccessScreen() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 sm:py-8 px-2 sm:px-4 animate-in fade-in zoom-in-95 duration-500">
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-green-100 scale-150 animate-ping opacity-20" />
        <div className="relative w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-green-500" strokeWidth={1.5} />
        </div>
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 text-balance px-1">
        ¡Formulario recibido!
      </h2>

      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-sm text-balance px-1">
        Analizaremos tu negocio y nos pondremos en contacto contigo en menos de 24 horas.
      </p>

      <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground bg-muted/60 rounded-xl px-5 py-3">
        <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
        Respuestas recibidas con éxito
      </div>
    </div>
  )
}
