import { MultiStepForm } from "@/components/form/MultiStepForm"

export default function HomePage() {
  return (
    <main className="min-h-[100dvh] flex items-start justify-center px-3 py-4 sm:items-center sm:px-5 sm:py-6">
      <div className="w-full max-w-xl">
        <div className="nx-dark-card w-full rounded-2xl border p-2 sm:p-3">
          <MultiStepForm />
        </div>
      </div>
    </main>
  )
}
