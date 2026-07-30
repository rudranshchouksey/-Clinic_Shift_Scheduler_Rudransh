import { requireManager } from '@/lib/auth-utils'
import { getImportHistories } from '@/server/queries/import-history'
import { format } from 'date-fns'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default async function ImportReportIndexPage() {
  await requireManager()
  const histories = await getImportHistories()

  return (
    <div className="space-y-6 animate-in fade-in duration-500 delay-100">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Import Reports</h1>
        <p className="text-muted-foreground mt-2">
          View the history and results of all CSV data imports.
        </p>
      </div>

      <Card className="bg-background/60 backdrop-blur-md border-muted">
        <CardHeader>
          <CardTitle>Recent Imports</CardTitle>
          <CardDescription>
            Click on an import row to view detailed accepted, rejected, and merged records.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead>Imported By</TableHead>
                  <TableHead className="text-right">Total Rows</TableHead>
                  <TableHead className="text-right">Accepted</TableHead>
                  <TableHead className="text-right">Issues</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {histories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                      No imports found.
                    </TableCell>
                  </TableRow>
                ) : (
                  histories.map((history) => {
                    const report = history.reports[0]
                    const hasIssues =
                      report &&
                      (report.rejectedRows > 0 || report.totalRows - report.acceptedRows > 0)

                    return (
                      <TableRow
                        key={history.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="font-medium">
                          <Link
                            href={`/dashboard/import-report/${history.id}`}
                            className="absolute inset-0 z-10"
                          >
                            <span className="sr-only">View Details</span>
                          </Link>
                          {format(history.createdAt, 'MMM d, yyyy HH:mm')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{history.fileName}</Badge>
                        </TableCell>
                        <TableCell>{history.importedBy.name}</TableCell>
                        <TableCell className="text-right">{report?.totalRows || 0}</TableCell>
                        <TableCell className="text-right text-emerald-600 font-medium">
                          {report?.acceptedRows || 0}
                        </TableCell>
                        <TableCell className="text-right">
                          {hasIssues ? (
                            <Badge variant="destructive" className="ml-auto">
                              {report.rejectedRows} Rejected /{' '}
                              {report.totalRows - report.acceptedRows - report.rejectedRows} Merged
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-0"
                            >
                              Clean
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
