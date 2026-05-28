import { MultiStepForm } from "@/components/form/MultiStepForm"

export default function HomePage() {
  return (
    <main className="h-[100dvh] flex items-center justify-center px-3 sm:px-5">
      <div className="w-full max-w-xl py-2 sm:py-4">
        <div className="nx-dark-card w-full rounded-2xl border p-2 sm:p-3">
          <MultiStepForm />
        </div>
      </div>
    </main>
  )
}
