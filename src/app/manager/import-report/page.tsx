import { prisma } from '@/lib/db'
import { requireManager } from '@/lib/auth-utils'
import { format } from 'date-fns'
import Link from 'next/link'
import { FileSpreadsheet, Eye } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function ManagerImportReportsPage() {
  await requireManager()

  const history = await prisma.importHistory.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      reports: true,
      importedBy: { select: { name: true } },
    },
  })

  return (
    <div className="flex flex-1 flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Import Reports</h1>
        <p className="text-muted-foreground mt-1">Review the results of previous CSV imports.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="p-4 rounded-2xl bg-muted/50 mb-4">
                <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No imports yet</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Import your first CSV file to see results here.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">File</TableHead>
                  <TableHead className="font-semibold">Imported By</TableHead>
                  <TableHead className="font-semibold">Results</TableHead>
                  <TableHead className="text-right font-semibold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((record) => {
                  const report = record.reports[0]
                  return (
                    <TableRow key={record.id} className="group">
                      <TableCell className="font-medium text-sm">
                        {format(new Date(record.createdAt), 'MMM d, yyyy')}
                        <span className="block text-xs text-muted-foreground">
                          {format(new Date(record.createdAt), 'HH:mm')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-md bg-muted">
                            <FileSpreadsheet className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <span className="text-sm">{record.fileName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {record.importedBy.name}
                      </TableCell>
                      <TableCell>
                        {report ? (
                          <div className="flex gap-2">
                            <Badge
                              variant="outline"
                              className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                            >
                              {report.acceptedRows} accepted
                            </Badge>
                            {report.rejectedRows > 0 && (
                              <Badge
                                variant="outline"
                                className="bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
                              >
                                {report.rejectedRows} rejected
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {report && (
                          <Link
                            href={`/manager/import-report/${report.id}`}
                            className={buttonVariants({
                              variant: 'ghost',
                              size: 'sm',
                              className:
                                'h-8 gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity',
                            })}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </Link>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
