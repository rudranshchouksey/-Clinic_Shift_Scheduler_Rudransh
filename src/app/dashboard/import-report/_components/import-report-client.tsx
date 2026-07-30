'use client'

import { useState, useMemo } from 'react'
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'

type IssueRow = {
  status: 'REJECTED' | 'MERGED'
  rawRow: Record<string, string>
  reason: string
}

interface ImportReportClientProps {
  totalRows: number
  acceptedRows: number
  rejectedRows: number
  mergedRows: number
  issues: IssueRow[]
}

const ITEMS_PER_PAGE = 10

export function ImportReportClient({
  totalRows,
  acceptedRows,
  rejectedRows,
  mergedRows,
  issues,
}: ImportReportClientProps) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'ALL' | 'REJECTED' | 'MERGED'>('ALL')
  const [page, setPage] = useState(1)

  // Filtering and searching logic
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      // 1. Filter by status
      if (filter !== 'ALL' && issue.status !== filter) return false

      // 2. Search query
      if (!search) return true

      const searchLower = search.toLowerCase()
      // Check reason
      if (issue.reason.toLowerCase().includes(searchLower)) return true

      // Check raw row values
      const rawValues = Object.values(issue.rawRow).join(' ').toLowerCase()
      if (rawValues.includes(searchLower)) return true

      return false
    })
  }, [issues, search, filter])

  // Pagination logic
  const totalPages = Math.ceil(filteredIssues.length / ITEMS_PER_PAGE) || 1
  // Ensure page is in bounds
  const currentPage = Math.min(Math.max(1, page), totalPages)

  const paginatedIssues = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredIssues.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredIssues, currentPage])

  // Handle page reset on filter/search change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setPage(1)
  }

  const handleFilterChange = (val: string | null) => {
    if (val) {
      setFilter(val as 'ALL' | 'REJECTED' | 'MERGED')
      setPage(1)
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-background/60 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Processed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRows}</div>
          </CardContent>
        </Card>
        <Card className="bg-background/60 backdrop-blur-md border-emerald-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-600">Accepted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{acceptedRows}</div>
          </CardContent>
        </Card>
        <Card className="bg-background/60 backdrop-blur-md border-yellow-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">
              Merged (Conflicts)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{mergedRows}</div>
          </CardContent>
        </Card>
        <Card className="bg-background/60 backdrop-blur-md border-red-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejectedRows}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="bg-background/60 backdrop-blur-md border-muted">
        <CardHeader>
          <CardTitle>Issues & Conflict Resolutions</CardTitle>
          <CardDescription>
            Review the exact rows that required merging or were completely rejected.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search raw data or reasons..."
                className="pl-8 bg-background/50"
                value={search}
                onChange={handleSearchChange}
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={filter} onValueChange={handleFilterChange}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Issues</SelectItem>
                  <SelectItem value="REJECTED">Rejected Only</SelectItem>
                  <SelectItem value="MERGED">Merged Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead>Raw CSV Row</TableHead>
                  <TableHead>Reason / Action Taken</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedIssues.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-32 text-muted-foreground">
                      No issues match your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedIssues.map((issue, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        {issue.status === 'REJECTED' ? (
                          <Badge variant="destructive">Rejected</Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-yellow-600 border-yellow-600/30 bg-yellow-500/10"
                          >
                            Merged
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <pre className="text-xs text-muted-foreground bg-muted p-2 rounded-md overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(issue.rawRow, null, 2)}
                        </pre>
                      </TableCell>
                      <TableCell className="font-medium text-sm">{issue.reason}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredIssues.length)} of{' '}
                {filteredIssues.length} issues
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm font-medium mx-2">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={currentPage >= totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
