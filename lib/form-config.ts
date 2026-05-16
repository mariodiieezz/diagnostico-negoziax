export type QuestionType = "text" | "single" | "multi" | "contact"

export interface Question {
  id: string
  step: number
  type: QuestionType
  question: string
  hint?: string
  options?: string[]
  required?: boolean
  /** Si es false, no se muestra la opción "Otros" en preguntas single/multi. Por defecto sí se muestra. */
  allowOther?: boolean
}

export const QUESTIONS: Question[] = [
  {
    id: "nombre_negocio",
    step: 1,
    type: "text",
    question: "¿Cuál es el nombre de tu negocio?",
    hint: "Escribe el nombre de tu empresa o negocio",
    required: true,
  },
  {
    id: "sector",
    step: 2,
    type: "single",
    question: "¿A qué sector pertenece tu negocio?",
    options: [
      "Peluquería",
      "Gimnasio",
      "Clínica",
      "Academia",
      "Restaurante",
      "Mecánico",
      "Inmobiliaria",
    ],
    required: true,
  },
  {
    id: "numero_empleados",
    step: 3,
    type: "single",
    question: "¿Cuántos empleados tenéis?",
    options: ["Solo yo", "2 - 3", "4 - 10", "+10"],
    allowOther: false,
    required: true,
  },
  {
    id: "gestion_citas",
    step: 4,
    type: "multi",
    question: "¿Cómo gestionáis las citas con clientes?",
    hint: "Puedes elegir varias opciones",
    options: [
      "WhatsApp",
      "Teléfono",
      "App de reservas",
      "Agenda en papel",
      "No gestiono citas",
    ],
    required: true,
  },
  {
    id: "recordatorios_clientes",
    step: 5,
    type: "single",
    question: "¿Hacéis recordatorios a los clientes?",
    options: [
      "Lo hago manualmente",
      "Tengo algo automático",
      "No hago recordatorios",
    ],
    allowOther: false,
    required: true,
  },
  {
    id: "herramientas_digitales",
    step: 6,
    type: "multi",
    question: "¿Qué herramientas digitales usas habitualmente?",
    hint: "Puedes elegir varias opciones",
    options: [
      "Gmail",
      "WhatsApp",
      "Excel / Google Sheets",
      "Google Calendar",
      "Instagram",
      "No uso ninguna",
    ],
    required: true,
  },
  {
    id: "horas_semanales_repetitivas",
    step: 7,
    type: "single",
    question: "¿Cuántas horas semanales dedicas a tareas repetitivas?",
    options: ["Menos de 2 horas", "2 - 5 horas", "5 - 10 horas", "Más de 10 horas"],
    allowOther: false,
    required: true,
  },
  {
    id: "tareas_manuales_repetitivas",
    step: 8,
    type: "multi",
    question: "¿Qué tareas manuales repetitivas realizas?",
    hint: "Puedes elegir varias opciones",
    options: [
      "Responder mensajes",
      "Agendar citas",
      "Pasar datos de un sitio a otro",
      "Hacer facturas",
      "Publicar en redes sociales",
    ],
    required: true,
  },
  {
    id: "perdida_clientes_error",
    step: 9,
    type: "single",
    question: "¿Alguna vez un cliente no ha vuelto por un olvido, retraso o falta de seguimiento?",
    options: ["Sí, me ha pasado alguna vez", "Seguramente, aunque no estoy seguro/a", "No, que yo sepa"],
    allowOther: false,
    required: true,
  },
  {
    id: "como_consigues_clientes",
    step: 10,
    type: "multi",
    question: "¿Cómo consigues clientes nuevos?",
    hint: "Puedes elegir varias opciones",
    options: [
      "Boca a boca",
      "Redes sociales",
      "Google",
      "Publicidad",
      "No lo sé",
    ],
    required: true,
  },
  {
    id: "mayor_problema_actual",
    step: 11,
    type: "multi",
    question: "¿Cuál es tu mayor problema actual?",
    hint: "Puedes elegir varias opciones",
    options: [
      "Falta de tiempo",
      "Coste de empleados",
      "Desorganización interna",
      "Perder clientes",
    ],
    required: true,
  },
  {
    id: "datos_contacto",
    step: 12,
    type: "contact",
    question: "¿Cómo podemos contactarte?",
    required: true,
  },
]

export const TOTAL_STEPS = QUESTIONS.length
