import { prisma } from '@/lib/db'
import { requireManager } from '@/lib/auth-utils'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import Link from 'next/link'
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Info,
  FileSpreadsheet,
  User,
  Calendar,
} from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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

  const kpiCards = [
    {
      title: 'Total Rows',
      value: report.totalRows,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-500/10',
      border: 'border-l-blue-500',
    },
    {
      title: 'Accepted',
      value: report.acceptedRows,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      border: 'border-l-emerald-500',
    },
    {
      title: 'Rejected',
      value: report.rejectedRows,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-500/10',
      border: 'border-l-red-500',
    },
  ]

  return (
    <div className="flex flex-1 flex-col gap-8">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/manager/import-report"
          className={buttonVariants({
            variant: 'outline',
            size: 'icon',
            className: 'h-9 w-9 shrink-0',
          })}
          aria-label="Back to reports"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Import Report</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Detailed breakdown of the import results.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title} className={`border-l-4 ${kpi.border}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold tracking-tight ${kpi.color}`}>{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* File Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="h-4 w-4 text-primary" />
            File Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  File Name
                </p>
                <p className="text-sm font-medium mt-0.5">{report.importHistory.fileName}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Imported By
                </p>
                <p className="text-sm font-medium mt-0.5">{report.importHistory.importedBy.name}</p>
                <p className="text-xs text-muted-foreground">
                  {report.importHistory.importedBy.email}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Date
                </p>
                <p className="text-sm font-medium mt-0.5">
                  {format(new Date(report.importHistory.createdAt), 'PPP')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(report.importHistory.createdAt), 'p')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rejected Rows */}
      {details.rejected && details.rejected.length > 0 && (
        <Card className="border-red-200 dark:border-red-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="p-1.5 rounded-md bg-red-50 dark:bg-red-500/10">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              Rejected Rows
              <Badge
                variant="outline"
                className="ml-auto bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
              >
                {details.rejected.length}
              </Badge>
            </CardTitle>
            <CardDescription>Rows that failed validation and were skipped.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold w-20">Row</TableHead>
                  <TableHead className="font-semibold">Reason</TableHead>
                  <TableHead className="font-semibold">Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {details.rejected.map(
                  (
                    r: { index?: number; reason: string; row: Record<string, unknown> },
                    i: number,
                  ) => (
                    <TableRow key={i}>
                      <TableCell className="font-mono text-xs font-medium">
                        {r.index !== undefined ? r.index + 1 : '—'}
                      </TableCell>
                      <TableCell className="text-sm text-red-600 dark:text-red-400">
                        {r.reason}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground max-w-[300px] truncate">
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

      {/* Merged Rows */}
      {details.merged && details.merged.length > 0 && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="p-1.5 rounded-md bg-primary/10">
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </div>
              Merged Rows
              <Badge variant="outline" className="ml-auto">
                {details.merged.length}
              </Badge>
            </CardTitle>
            <CardDescription>Duplicate items that were merged during import.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold">Reason</TableHead>
                  <TableHead className="font-semibold">Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {details.merged.map(
                  (m: { reason: string; row: Record<string, unknown> }, i: number) => (
                    <TableRow key={i}>
                      <TableCell className="text-sm">{m.reason}</TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground max-w-[300px] truncate">
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
