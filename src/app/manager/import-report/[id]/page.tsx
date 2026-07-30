import { prisma } from '@/lib/db'
import { requireManager } from '@/lib/auth-utils'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, AlertTriangle, Info } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default async function ManagerImportReportDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireManager()

  const resolvedParams = await params

  const report = await prisma.importReport.findUnique({
    where: { id: resolvedParams.id },
    include: {
      importHistory: {
        include: { importedBy: true },
      },
    },
  })

  if (!report) {
    notFound()
  }

  const details = report.details ? JSON.parse(report.details) : { rejected: [], merged: [] }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center gap-4">
        <Link
          href="/manager/import-report"
          className={buttonVariants({ variant: 'outline', size: 'icon' })}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-lg font-semibold md:text-2xl">Import Report Details</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Rows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.totalRows}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">
              Accepted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.acceptedRows}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.rejectedRows}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            File Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">File Name</p>
            <p className="text-sm">{report.importHistory.fileName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Imported By</p>
            <p className="text-sm">
              {report.importHistory.importedBy.name} ({report.importHistory.importedBy.email})
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Date</p>
            <p className="text-sm">{format(new Date(report.importHistory.createdAt), 'PPpp')}</p>
          </div>
        </CardContent>
      </Card>

      {details.rejected && details.rejected.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Rejected Rows
            </CardTitle>
            <CardDescription>Rows that failed validation and were skipped.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Row</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {details.rejected.map(
                  (
                    r: { index?: number; reason: string; row: Record<string, unknown> },
                    i: number,
                  ) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">
                        {r.index !== undefined ? r.index + 1 : 'N/A'}
                      </TableCell>
                      <TableCell className="text-destructive">{r.reason}</TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {JSON.stringify(r.row)}
                      </TableCell>
                    </TableRow>
                  ),
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {details.merged && details.merged.length > 0 && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <CheckCircle2 className="h-5 w-5" />
              Merged Rows
            </CardTitle>
            <CardDescription>Duplicate items that were merged during import.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reason</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {details.merged.map(
                  (m: { reason: string; row: Record<string, unknown> }, i: number) => (
                    <TableRow key={i}>
                      <TableCell>{m.reason}</TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {JSON.stringify(m.row)}
                      </TableCell>
                    </TableRow>
                  ),
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
