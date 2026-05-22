import { z } from "zod"

// Validation constants
const MAX_TEXT_LENGTH = 500
const MAX_EMAIL_LENGTH = 254 // RFC 5321
const MAX_PHONE_LENGTH = 20
const MAX_NAME_LENGTH = 100
const MIN_PHONE_DIGITS = 9
const MAX_PHONE_DIGITS = 15

// Custom validators
const phoneValidator = z
  .string()
  .min(1, "El teléfono es obligatorio")
  .max(MAX_PHONE_LENGTH, "El teléfono es demasiado largo")
  .refine((val) => {
    const digits = val.replace(/\D/g, "")
    return digits.length >= MIN_PHONE_DIGITS && digits.length <= MAX_PHONE_DIGITS
  }, "Introduce un teléfono válido (9-15 dígitos)")

const emailValidator = z
  .string()
  .min(1, "El correo electrónico es obligatorio")
  .max(MAX_EMAIL_LENGTH, "El correo electrónico es demasiado largo")
  .email("El correo electrónico no es válido")
  .refine((email) => {
    // Additional email validation
    const parts = email.split("@")
    if (parts.length !== 2) return false
    const [local, domain] = parts
    // Check local part length (max 64 chars per RFC 5321)
    if (local.length > 64) return false
    // Check domain has at least one dot and valid structure
    if (!domain.includes(".")) return false
    // Prevent consecutive dots
    if (email.includes("..")) return false
    // Prevent dangerous patterns
    if (/[<>()[\]\\,;:\s@"]/.test(local.replace(/^"|"$/g, ""))) return false
    return true
  }, "El correo electrónico no es válido")

const textFieldValidator = z
  .string()
  .min(1, "Campo obligatorio")
  .max(MAX_TEXT_LENGTH, `Máximo ${MAX_TEXT_LENGTH} caracteres`)
  .refine((val) => val.trim().length > 0, "Campo obligatorio")

const nameValidator = z
  .string()
  .min(1, "El nombre completo es obligatorio")
  .max(MAX_NAME_LENGTH, `Máximo ${MAX_NAME_LENGTH} caracteres`)
  .refine((val) => val.trim().length > 0, "El nombre completo es obligatorio")
  .refine((val) => {
    // Must contain at least 2 words (first and last name)
    const words = val.trim().split(/\s+/)
    return words.length >= 2
  }, "Introduce nombre y apellido")

// Form submission schema
export const formSubmissionSchema = z.object({
  // Contact information (required)
  nombre_completo: nameValidator,
  telefono: phoneValidator,
  email: emailValidator,

  // Business questions (all optional but if present, must be valid)
  sector: z.string().max(MAX_TEXT_LENGTH).optional(),
  rol: z.string().max(MAX_TEXT_LENGTH).optional(),
  tamano_equipo: z.string().max(MAX_TEXT_LENGTH).optional(),
  tareas_repetitivas: z.string().max(MAX_TEXT_LENGTH).optional(),
  procesos_automatizar: z.string().max(MAX_TEXT_LENGTH).optional(),
  desafios: z.string().max(MAX_TEXT_LENGTH).optional(),
  herramientas: z.string().max(MAX_TEXT_LENGTH).optional(),
  integraciones: z.string().max(MAX_TEXT_LENGTH).optional(),
  prioridades: z.string().max(MAX_TEXT_LENGTH).optional(),
})

export type FormSubmission = z.infer<typeof formSubmissionSchema>

// Validate and return typed data or errors
export function validateFormSubmission(data: unknown) {
  return formSubmissionSchema.safeParse(data)
}
