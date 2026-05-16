"use client"

import { useState, useCallback } from "react"
import { QUESTIONS, TOTAL_STEPS } from "@/lib/form-config"
import { ProgressBar } from "./ProgressBar"
import { QuestionStep } from "./QuestionStep"
import { SuccessScreen } from "./SuccessScreen"
import { cn } from "@/lib/utils"
import { ArrowRight, Loader2 } from "lucide-react"

const WEBHOOK_URL =
  process.env.NEXT_PUBLIC_WEBHOOK_URL ||
  "https://n8n-n8n.cksi9g.easypanel.host/webhook/b38e2cba-d328-4b20-a7d5-5a5cf105ca58"

interface FormAnswers {
  [key: string]: string | string[] | Record<string, string>
}

function buildPayload(answers: FormAnswers) {
  const payload: Record<string, unknown> = {}
  for (const question of QUESTIONS) {
    const answer = answers[question.id]
    if (question.type === "contact" && answer && typeof answer === "object" && !Array.isArray(answer)) {
      const contact = answer as Record<string, string>
      payload["nombre_completo"] = contact.nombre_completo || ""
      payload["telefono"] = contact.telefono || ""
      payload["email"] = contact.email || ""
    } else {
      payload[question.id] = Array.isArray(answer) ? answer.join(", ") : (answer || "")
    }
  }
  return payload
}

function validateStep(question: (typeof QUESTIONS)[0], answers: FormAnswers): string | null {
  const answer = answers[question.id]

  if (question.type === "text") {
    if (!answer || (answer as string).trim() === "") return "Campo obligatorio"
  } else if (question.type === "single") {
    const str = typeof answer === "string" ? answer : ""
    if (question.allowOther === false) {
      if (!str.trim()) return "Campo obligatorio"
      if (str === "Otros" || str.startsWith("Otros:")) return "Campo obligatorio"
      return null
    }
    if (!answer || str.trim() === "" || answer === "Otros") {
      if (answer === "Otros") return "Por favor, especifica tu respuesta"
      return "Campo obligatorio"
    }
  } else if (question.type === "multi") {
    const arr = (answer as string[]) || []
    if (question.allowOther === false) {
      if (arr.length === 0) return "Campo obligatorio"
      if (arr.some((v) => v === "Otros" || v.startsWith("Otros:"))) return "Campo obligatorio"
      return null
    }
    if (arr.length === 0) return "Campo obligatorio"
    const hasOtrosOnly = arr.length === 1 && arr[0] === "Otros"
    if (hasOtrosOnly) return "Por favor, especifica tu respuesta"
  } else if (question.type === "contact") {
    const contact = (answer as Record<string, string>) || {}
    if (!contact.nombre_completo?.trim()) return "El nombre completo es obligatorio"
    if (!contact.telefono?.trim()) return "El teléfono es obligatorio"
    const digits = contact.telefono.trim().replace(/\D/g, "")
    if (digits.length !== 9) return "Introduce un teléfono válido"
    if (!contact.email?.trim()) return "El correo electrónico es obligatorio"
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(contact.email.trim())) return "El correo electrónico no es válido"
  }

  return null
}

export function MultiStepForm() {
  const [started, setStarted] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [answers, setAnswers] = useState<FormAnswers>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [direction, setDirection] = useState<"forward" | "backward">("forward")
  const [isAnimating, setIsAnimating] = useState(false)

  const currentQuestion = QUESTIONS[currentStep - 1]

  const handleAnswer = useCallback((questionId: string, value: string | string[] | Record<string, string>) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value as string | string[] }))
    setErrors((prev) => {
      if (prev[questionId]) {
        const next = { ...prev }
        delete next[questionId]
        return next
      }
      return prev
    })
  }, [])

  const animateTransition = (cb: () => void) => {
    setIsAnimating(true)
    setTimeout(() => {
      cb()
      setIsAnimating(false)
    }, 200)
  }

  const handleAutoNext = useCallback(
    (questionId: string, value: string) => {
      const tempAnswers = { ...answers, [questionId]: value }
      const error = validateStep(currentQuestion, tempAnswers)
      if (error) {
        setErrors((prev) => ({ ...prev, [currentQuestion.id]: error }))
        return
      }
      setDirection("forward")
      animateTransition(() => setCurrentStep((s) => s + 1))
    },
    [answers, currentQuestion],
  )

  const handleNext = async () => {
    const error = validateStep(currentQuestion, answers)
    if (error) {
      setErrors((prev) => ({ ...prev, [currentQuestion.id]: error }))
      return
    }

    if (currentStep === TOTAL_STEPS) {
      // Submit
      setIsSubmitting(true)
      try {
        const payload = buildPayload(answers)
        if (WEBHOOK_URL) {
          await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        }
        setSubmitted(true)
      } catch (err) {
        console.error("[v0] Webhook error:", err)
        setSubmitted(true) // show success regardless to avoid UX hang
      } finally {
        setIsSubmitting(false)
      }
    } else {
      setDirection("forward")
      animateTransition(() => setCurrentStep((s) => s + 1))
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection("backward")
      animateTransition(() => setCurrentStep((s) => s - 1))
    }
  }

  if (submitted) {
    return <SuccessScreen />
  }

  if (!started) {
    return (
      <div
        className="relative flex min-h-[min(480px,82dvh)] items-center justify-center overflow-hidden rounded-xl px-5 py-10 sm:min-h-[460px] sm:rounded-2xl sm:px-8 sm:py-12"
        style={{
          background: "linear-gradient(180deg,#eaeff5 0%,#e4eaf2 100%)",
          fontFamily: "'DM Sans', system-ui, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(circle, rgba(59,130,246,.06) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, rgba(59,130,246,.09), transparent 70%)",
            top: "-100px",
            right: "-80px",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "300px",
            height: "300px",
            background: "radial-gradient(circle, rgba(96,165,250,.07), transparent 70%)",
            bottom: "-60px",
            left: "-60px",
            pointerEvents: "none",
          }}
        />
        <div
          className="relative z-[1] mx-auto max-w-[min(100%,440px)] text-center"
        >
          <img
            src="/logo.png"
            alt="Negoziax"
            className="mx-auto mb-4 h-12 w-12 object-contain sm:mb-4 sm:h-16 sm:w-16"
          />
          <div
            className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-[rgba(37,99,235,.08)] px-3.5 py-1.5 text-[11px] font-semibold tracking-wide text-[#2563eb] sm:mb-6 sm:gap-1.5 sm:px-3.5 sm:py-1.5 sm:text-xs"
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#2563eb",
                animation: "pulse 2s ease-in-out infinite",
                display: "inline-block",
              }}
            />
            Diagnóstico gratuito para tu negocio
          </div>
          <h1
            className="mb-4 font-['Outfit',system-ui,sans-serif] text-[1.625rem] font-extrabold leading-[1.15] tracking-[-0.02em] text-[#0f172a] sm:mb-4 sm:text-4xl sm:leading-[1.1] md:text-[2.75rem]"
          >
            ¿Cuánto tiempo
            <br />
            pierdes cada semana?
          </h1>
          <p
            className="mx-auto mb-8 max-w-[360px] px-0.5 text-[15px] leading-relaxed text-[#475569] sm:mb-8 sm:text-base"
          >
            Cuéntanos cómo trabajas y te ayudamos a optimizar tu negocio con un plan personalizado.
          </p>
          <button
            type="button"
            onClick={() => setStarted(true)}
            className="mx-auto inline-flex w-full max-w-[20rem] items-center justify-center gap-2 rounded-full border-0 bg-[#2563eb] px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_0_32px_rgba(37,99,235,.45)] transition-[box-shadow,transform] duration-200 sm:w-auto sm:max-w-none sm:px-7 sm:py-3.5"
            style={{
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 0 48px rgba(37,99,235,.65)"
              e.currentTarget.style.transform = "translateY(-1px)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 0 32px rgba(37,99,235,.45)"
              e.currentTarget.style.transform = "translateY(0)"
            }}
          >
            Comenzar diagnóstico
            <ArrowRight style={{ width: "18px", height: "18px" }} />
          </button>
        </div>
      </div>
    )
  }

  const isLast = currentStep === TOTAL_STEPS

  return (
    <div className="flex flex-col gap-5 sm:gap-7">
      {/* Progress */}
      <ProgressBar currentStep={currentStep} />

      {/* Question card */}
      <div
        className={cn(
          "transition-all duration-200",
          isAnimating
            ? direction === "forward"
              ? "opacity-0 translate-x-4"
              : "opacity-0 -translate-x-4"
            : "opacity-100 translate-x-0"
        )}
      >
        {/* Step number + question */}
        <div className="mb-4 sm:mb-5">
          <h2 className="text-lg font-bold text-foreground text-balance leading-snug sm:text-xl">
            {currentQuestion.question}
          </h2>
          {currentQuestion.hint && currentQuestion.type !== "text" && (
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:mt-1.5 sm:text-sm sm:leading-normal">
              {currentQuestion.hint}
            </p>
          )}
          {currentStep === TOTAL_STEPS && (
            <p className="mb-2 mt-2 text-xs text-muted-foreground sm:mt-1.5 sm:text-sm">
              Ya casi estás, solo necesitamos saber a quién contactar.
            </p>
          )}
        </div>

        {/* Step content */}
        <QuestionStep
          question={currentQuestion}
          answers={answers}
          onAnswer={handleAnswer}
          error={errors[currentQuestion.id]}
          onEnterNext={handleNext}
          onAutoNext={handleAutoNext}
        />
      </div>

      {/* Navigation */}
      <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2 sm:pt-2">
        <button
          type="button"
          onClick={handleBack}
          disabled={currentStep === 1}
          className={cn(
            "min-h-11 touch-manipulation rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 sm:min-h-0",
            currentStep === 1
              ? "text-muted-foreground/30 cursor-not-allowed"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          ← Anterior
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={isSubmitting}
          className="inline-flex w-full min-h-12 touch-manipulation items-center justify-center gap-2 rounded-full border-0 bg-[#2563eb] px-5 py-3.5 text-[15px] font-semibold text-white shadow-[0_0_32px_rgba(37,99,235,.45)] transition-[box-shadow,transform] duration-200 sm:w-auto sm:min-h-0 sm:px-[26px] sm:py-[13px]"
          style={{
            cursor: isSubmitting ? "not-allowed" : "pointer",
            opacity: isSubmitting ? 0.7 : 1,
          }}
          onMouseEnter={(e) => {
            if (isSubmitting) return
            e.currentTarget.style.boxShadow = "0 0 48px rgba(37,99,235,.65)"
            e.currentTarget.style.transform = "translateY(-1px)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 0 32px rgba(37,99,235,.45)"
            e.currentTarget.style.transform = "translateY(0)"
          }}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Enviando...
            </>
          ) : isLast ? (
            "Enviar formulario"
          ) : (
            <>
              Siguiente
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
