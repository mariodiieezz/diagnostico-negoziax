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
    question: "Nombre de tu empresa",
    required: true,
  },
  {
    id: "web_redes",
    step: 2,
    type: "text",
    question: "¿Tenéis web o redes activas? Pega los enlaces",
    required: false,
  },
  {
    id: "volumen_mensual",
    step: 3,
    type: "single",
    question: "¿Cuántos clientes o pedidos gestionáis al mes aproximadamente?",
    options: ["Menos de 10", "10-50", "50-200", "Más de 200"],
    required: false,
  },
  {
    id: "sector",
    step: 4,
    type: "single",
    question: "¿En qué sector trabajas?",
    options: [
      "Clínica",
      "Restaurante",
      "Inmobiliaria",
      "Academia",
      "Taller",
      "Peluquería",
      "Comercio",
      "Otro",
    ],
    allowOther: false,
    required: true,
  },
  {
    id: "tareas_manuales_repetitivas",
    step: 5,
    type: "text",
    question: "¿Qué tarea repites cada semana que más tiempo te roba?",
    required: true,
  },
  {
    id: "horas_semanales_repetitivas",
    step: 6,
    type: "single",
    question: "¿Cuántas horas a la semana se van en eso?",
    options: [
      "Menos de 1h",
      "1-2 horas",
      "2-5 horas",
      "5-10 horas",
      "10-20 horas",
      "Más de 20 horas",
    ],
    allowOther: false,
    required: true,
  },
  {
    id: "mayor_problema_actual",
    step: 7,
    type: "text",
    question: "Si pudieras eliminar UN problema operativo mañana, ¿cuál sería?",
    required: true,
  },
  {
    id: "herramientas_digitales",
    step: 8,
    type: "multi",
    question: "¿Qué herramientas usáis a diario?",
    options: [
      "WhatsApp",
      "Gmail",
      "Excel",
      "Google Sheets",
      "Google Calendar",
      "Instagram",
      "Facebook",
    ],
    required: false,
    allowOther: true,
  },
  {
    id: "kpi_mover",
    step: 9,
    type: "multi",
    question: "¿Qué te gustaría conseguir?",
    options: [
      "Ahorrar tiempo",
      "Ganar más clientes",
      "Aumentar ingresos",
      "Reducir errores",
      "Responder más rápido",
    ],
    allowOther: true,
    required: false,
  },
  {
    id: "contact",
    step: 10,
    type: "contact",
    question: "¿Dónde te envío el análisis?",
    hint: "En menos de 24h te mando un análisis personalizado de tu negocio.",
    required: true,
  },
]

export const TOTAL_STEPS = QUESTIONS.length
