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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Import Reports</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>File Name</TableHead>
                <TableHead>Imported By</TableHead>
                <TableHead>Stats</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                    No import history found.
                  </TableCell>
                </TableRow>
              )}
              {history.map((record) => {
                const report = record.reports[0] // assuming 1-to-1 or just picking the first for simplicity
                return (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {format(new Date(record.createdAt), 'MMM d, yyyy HH:mm')}
                    </TableCell>
                    <TableCell className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                      {record.fileName}
                    </TableCell>
                    <TableCell>{record.importedBy.name}</TableCell>
                    <TableCell>
                      {report ? (
                        <div className="flex gap-2">
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          >
                            {report.acceptedRows} Accepted
                          </Badge>
                          {report.rejectedRows > 0 && (
                            <Badge variant="destructive">{report.rejectedRows} Rejected</Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">No report</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {report && (
                        <Link
                          href={`/manager/import-report/${report.id}`}
                          className={buttonVariants({ variant: 'ghost', size: 'sm' })}
                        >
                          <Eye className="h-4 w-4 mr-2" /> View
                        </Link>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
