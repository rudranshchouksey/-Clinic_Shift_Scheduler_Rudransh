import { requireManager } from '@/lib/auth-utils'
import { ImportForm } from './_components/import-form'

export default async function ManagerImportsPage() {
  await requireManager()

  return (
    <div className="flex flex-1 flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Import Data</h1>
        <p className="text-muted-foreground mt-1">
          Upload CSV files to bulk-import staff members or shift schedules.
        </p>
      </div>
      <ImportForm />
    </div>
  )
}
