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
        style={{
          minHeight: "460px",
          background: "linear-gradient(180deg,#eaeff5 0%,#e4eaf2 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem 2rem",
          fontFamily: "'DM Sans', system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
          borderRadius: "1rem",
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
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: "440px" }}>
          <img
            src="/logo.png"
            alt="Negoziax"
            style={{
              width: "64px",
              height: "64px",
              objectFit: "contain",
              margin: "0 auto 16px",
            }}
          />
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(37,99,235,.08)",
              color: "#2563eb",
              fontSize: "12px",
              fontWeight: 600,
              padding: "6px 14px",
              borderRadius: "999px",
              marginBottom: "24px",
              letterSpacing: ".02em",
            }}
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
            style={{
              fontFamily: "'Outfit', system-ui, sans-serif",
              fontSize: "44px",
              fontWeight: 800,
              color: "#0f172a",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              margin: "0 0 16px",
            }}
          >
            ¿Cuánto tiempo
            <br />
            pierdes cada semana?
          </h1>
          <p
            style={{
              fontSize: "16px",
              color: "#475569",
              lineHeight: 1.6,
              margin: "0 auto 32px",
              maxWidth: "360px",
            }}
          >
            Cuéntanos cómo trabajas y te ayudamos a optimizar tu negocio con un plan personalizado.
          </p>
          <button
            type="button"
            onClick={() => setStarted(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#2563eb",
              color: "#fff",
              fontSize: "15px",
              fontWeight: 600,
              padding: "14px 28px",
              borderRadius: "999px",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 0 32px rgba(37,99,235,.45)",
              transition: "box-shadow .3s, transform .2s",
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
    <div className="flex flex-col gap-6">
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
        <div className="mb-5">
          <h2 className="text-xl font-bold text-foreground text-balance leading-snug">
            {currentQuestion.question}
          </h2>
          {currentQuestion.hint && currentQuestion.type !== "text" && (
            <p className="mt-1.5 text-sm text-muted-foreground">{currentQuestion.hint}</p>
          )}
          {currentStep === TOTAL_STEPS && (
            <p className="text-sm text-muted-foreground mb-2 mt-1.5">
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
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={handleBack}
          disabled={currentStep === 1}
          className={cn(
            "px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
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
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "#2563eb",
            color: "#fff",
            fontSize: "15px",
            fontWeight: 600,
            padding: "13px 26px",
            borderRadius: "999px",
            border: "none",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            boxShadow: "0 0 32px rgba(37,99,235,.45)",
            transition: "box-shadow .3s, transform .2s",
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
