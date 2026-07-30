import { requireManager } from '@/lib/auth-utils'
import { ImportForm } from './_components/import-form'

export default async function ManagerImportsPage() {
  await requireManager()

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Import CSV Data</h1>
      </div>
      <ImportForm />
    </div>
  )
}
