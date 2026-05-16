import { MultiStepForm } from "@/components/form/MultiStepForm"

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-2">
      <div className="w-full max-w-lg">
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6 md:p-8">
          <MultiStepForm />
        </div>
      </div>
    </main>
  )
}
