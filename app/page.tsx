import { MultiStepForm } from "@/components/form/MultiStepForm"

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-6 sm:px-5 sm:py-8 md:py-12">
      <div className="w-full max-w-lg">
        <div className="bg-card rounded-xl sm:rounded-2xl border border-border shadow-sm p-5 sm:p-6 md:p-8">
          <MultiStepForm />
        </div>
      </div>
    </main>
  )
}
