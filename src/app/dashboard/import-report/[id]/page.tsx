import { requireManager } from '@/lib/auth-utils'
import { getImportReportDetails } from '@/server/queries/import-history'
import { notFound } from 'next/navigation'
import { ImportReportClient } from '../_components/import-report-client'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default async function ImportReportDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  await requireManager()

  const data = await getImportReportDetails(params.id)

  if (!data) {
    notFound()
  }

  const { history, report } = data

  // Transform into unified array for the client component
  const rejectedIssues = report.parsedDetails.rejected.map((r) => ({
    status: 'REJECTED' as const,
    rawRow: r.row,
    reason: r.reason,
  }))

  const mergedIssues = report.parsedDetails.merged.map((m) => ({
    status: 'MERGED' as const,
    rawRow: m.row,
    reason: m.reason,
  }))

  const allIssues = [...rejectedIssues, ...mergedIssues]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/import-report"
          className={cn(buttonVariants({ variant: 'outline', size: 'icon' }))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Report: {history.fileName}</h1>
          <p className="text-muted-foreground mt-1">Imported by {history.importedBy.name}</p>
        </div>
      </div>

      <ImportReportClient
        totalRows={report.totalRows}
        acceptedRows={report.acceptedRows}
        rejectedRows={report.rejectedRows}
        mergedRows={report.totalRows - report.acceptedRows - report.rejectedRows}
        issues={allIssues}
      />
    </div>
  )
}
