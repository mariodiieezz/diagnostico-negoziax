"use client"

import { useState, useEffect } from "react"
import { Question } from "@/lib/form-config"
import { OptionCard } from "./OptionCard"
import { cn } from "@/lib/utils"

interface FormAnswers {
  [key: string]: string | string[]
}

interface ContactData {
  nombre_completo?: string
  telefono?: string
  email?: string
}

interface QuestionStepProps {
  question: Question
  answers: FormAnswers
  onAnswer: (questionId: string, value: string | string[]) => void
  error?: string
  onEnterNext?: () => void
  onAutoNext?: (questionId: string, value: string) => void
}

export function QuestionStep({ question, answers, onAnswer, error, onEnterNext, onAutoNext }: QuestionStepProps) {
  const [otherText, setOtherText] = useState("")
  const [showOther, setShowOther] = useState(false)

  const currentAnswer = answers[question.id]

  // Safely coerce multi answers to array
  const currentMultiAnswer: string[] = question.type === "multi"
    ? (Array.isArray(currentAnswer) ? currentAnswer : [])
    : []

  // Sync "Otros" visibility
  useEffect(() => {
    if (question.type === "single") {
      setShowOther(currentAnswer === "Otros")
      if (currentAnswer !== "Otros") setOtherText("")
    } else if (question.type === "multi") {
      setShowOther(currentMultiAnswer.includes("Otros"))
      if (!currentMultiAnswer.includes("Otros")) setOtherText("")
    }
  }, [currentAnswer, currentMultiAnswer, question.type])

  // Single selection handler
  const handleSingle = (option: string) => {
    if (option === "Otros") {
      onAnswer(question.id, option)
    } else {
      onAnswer(question.id, option)
      onAutoNext?.(question.id, option)
    }
  }

  // Multi selection handler
  const handleMulti = (option: string) => {
    const current = Array.isArray(currentAnswer) ? currentAnswer : []
    let updated: string[]
    if (current.includes(option)) {
      updated = current.filter((o) => o !== option)
    } else {
      updated = [...current, option]
    }
    onAnswer(question.id, updated)
  }

  // Other text handler
  const handleOtherText = (text: string) => {
    setOtherText(text)
    if (question.type === "single") {
      onAnswer(question.id, text ? `Otros: ${text}` : "Otros")
    } else if (question.type === "multi") {
      const current = (Array.isArray(currentAnswer) ? currentAnswer : []).filter(
        (o) => !o.startsWith("Otros:")
      )
      onAnswer(question.id, text ? [...current, `Otros: ${text}`] : [...current, "Otros"])
    }
  }

  // Contact handlers
  const contactData: ContactData =
    typeof currentAnswer === "object" && !Array.isArray(currentAnswer)
      ? (currentAnswer as unknown as ContactData)
      : {}

  const handleContact = (field: keyof ContactData, value: string) => {
    const current: ContactData =
      typeof answers[question.id] === "object" && !Array.isArray(answers[question.id])
        ? (answers[question.id] as unknown as ContactData)
        : {}
    onAnswer(question.id, { ...current, [field]: value } as unknown as string)
  }

  const isOtherSelected =
    question.type === "single"
      ? typeof currentAnswer === "string" &&
        (currentAnswer === "Otros" || currentAnswer?.startsWith("Otros:"))
      : currentMultiAnswer.some((v) => v === "Otros" || v.startsWith("Otros:"))

  const otherCurrentText = (() => {
    if (question.type === "single") {
      const val = currentAnswer as string
      return val?.startsWith("Otros:") ? val.replace("Otros: ", "") : ""
    } else {
      const otrosEntry = currentMultiAnswer.find((v) => v.startsWith("Otros:"))
      return otrosEntry ? otrosEntry.replace("Otros: ", "") : ""
    }
  })()

  const showOtherOption = question.allowOther !== false

  return (
    <div className="space-y-5 sm:space-y-4">
      {/* Text question */}
      {question.type === "text" && (
        <div>
          <input
            type="text"
            value={(currentAnswer as string) || ""}
            onChange={(e) => onAnswer(question.id, e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') onEnterNext?.() }}
            placeholder={question.hint || "Escribe tu respuesta..."}
            className={cn(
              "w-full rounded-xl border-2 bg-card px-4 py-4 text-[15px] font-medium text-foreground placeholder:text-muted-foreground/60 sm:py-3.5 sm:text-sm",
              "focus:outline-none focus:border-primary transition-colors duration-200",
              error ? "border-destructive" : "border-border hover:border-primary/40"
            )}
            aria-invalid={!!error}
          />
        </div>
      )}

      {/* Single choice */}
      {question.type === "single" && (
        <div
          className="space-y-2.5 sm:space-y-1.5"
          onKeyDown={(e) => { if (e.key === 'Enter') onEnterNext?.() }}
          tabIndex={0}
        >
          {question.options?.map((option) => (
            <OptionCard
              key={option}
              label={option}
              selected={
                typeof currentAnswer === "string" &&
                (currentAnswer === option ||
                  (currentAnswer?.startsWith("Otros:") && option === "Otros"))
              }
              multi={false}
              onClick={() => handleSingle(option)}
            />
          ))}
          {showOtherOption && (
            <>
              <OptionCard
                label="Otros"
                selected={isOtherSelected}
                multi={false}
                onClick={() => handleSingle("Otros")}
              />
              {isOtherSelected && (
                <div className="mt-2 animate-in slide-in-from-top-2 duration-200">
                  <input
                    type="text"
                    value={otherCurrentText}
                    onChange={(e) => handleOtherText(e.target.value)}
                    placeholder="Escribe tu respuesta..."
                    className={cn(
                      "w-full rounded-xl border-2 bg-card px-4 py-3.5 text-[15px] text-foreground placeholder:text-muted-foreground/60 sm:text-sm",
                      "focus:outline-none focus:border-primary transition-colors duration-200",
                      "border-primary/40"
                    )}
                    autoFocus
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Multi choice */}
      {question.type === "multi" && (
        <div
          className="space-y-2.5 sm:space-y-1.5"
          onKeyDown={(e) => { if (e.key === 'Enter') onEnterNext?.() }}
          tabIndex={0}
        >
          {question.options?.map((option) => (
            <OptionCard
              key={option}
              label={option}
              selected={currentMultiAnswer.includes(option)}
              multi={true}
              onClick={() => handleMulti(option)}
            />
          ))}
          {showOtherOption && (
            <>
              <OptionCard
                label="Otros"
                selected={isOtherSelected}
                multi={true}
                onClick={() => handleMulti("Otros")}
              />
              {isOtherSelected && (
                <div className="mt-2 animate-in slide-in-from-top-2 duration-200">
                  <input
                    type="text"
                    value={otherCurrentText}
                    onChange={(e) => handleOtherText(e.target.value)}
                    placeholder="Escribe tu respuesta..."
                    className={cn(
                      "w-full rounded-xl border-2 bg-card px-4 py-3.5 text-[15px] text-foreground placeholder:text-muted-foreground/60 sm:text-sm",
                      "focus:outline-none focus:border-primary transition-colors duration-200",
                      "border-primary/40"
                    )}
                    autoFocus
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Contact question */}
      {question.type === "contact" && (
        <div className="space-y-4 sm:space-y-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Nombre completo <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={(contactData as ContactData).nombre_completo || ""}
              onChange={(e) => handleContact("nombre_completo", e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onEnterNext?.()
              }}
              placeholder="Tu nombre completo"
              className={cn(
                "w-full rounded-xl border-2 bg-card px-4 py-3.5 text-[15px] font-medium text-foreground placeholder:text-muted-foreground/60 sm:py-2.5 sm:text-sm",
                "focus:outline-none focus:border-primary transition-colors duration-200",
                "border-border hover:border-primary/40"
              )}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Teléfono <span className="text-destructive">*</span>
            </label>
            <input
              type="tel"
              maxLength={9}
              value={(contactData as ContactData).telefono || ""}
              onChange={(e) => handleContact("telefono", e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onEnterNext?.()
              }}
              placeholder="Tu número de teléfono"
              className={cn(
                "w-full rounded-xl border-2 bg-card px-4 py-3.5 text-[15px] font-medium text-foreground placeholder:text-muted-foreground/60 sm:py-2.5 sm:text-sm",
                "focus:outline-none focus:border-primary transition-colors duration-200",
                "border-border hover:border-primary/40"
              )}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Correo electrónico <span className="text-destructive">*</span>
            </label>
            <input
              type="email"
              value={(contactData as ContactData).email || ""}
              onChange={(e) => handleContact("email", e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onEnterNext?.()
              }}
              placeholder="tu@email.com"
              className={cn(
                "w-full rounded-xl border-2 bg-card px-4 py-3.5 text-[15px] font-medium text-foreground placeholder:text-muted-foreground/60 sm:py-2.5 sm:text-sm",
                "focus:outline-none focus:border-primary transition-colors duration-200",
                "border-border hover:border-primary/40"
              )}
            />
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm font-medium text-destructive flex items-center gap-1.5 animate-in fade-in duration-200">
          <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
          {error}
        </p>
      )}
    </div>
  )
}
