'use client'

import * as React from 'react'
import { Upload, File, Loader2, FileSpreadsheet } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { uploadCsvAction } from '@/server/actions/import'
import type { ImportType } from '@/services/importer'

export function ImportForm() {
  const [file, setFile] = React.useState<File | null>(null)
  const [type, setType] = React.useState<ImportType>('STAFF')
  const [isPending, setIsPending] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile)
      } else {
        toast.error('Only .csv files are supported.')
      }
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file to upload.')
      return
    }

    setIsPending(true)
    try {
      const text = await file.text()
      const result = await uploadCsvAction(text, file.name, type)

      if (result.error) {
        toast.error(result.error)
      } else if (result.success) {
        toast.success('CSV imported successfully.')
        router.push(`/manager/import-report/${result.reportId}`)
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to read file.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Upload CSV</CardTitle>
        <CardDescription>
          Choose your data type and upload the corresponding CSV file. The system will parse and
          validate rows automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium">Data Type</label>
          <Select value={type} onValueChange={(val) => setType(val as ImportType)}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="STAFF">Staff (Doctors, Nurses, Receptionists)</SelectItem>
              <SelectItem value="SHIFTS">Shifts &amp; Requirements</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">CSV File</label>
          <label
            htmlFor="dropzone-file"
            className={`flex flex-col items-center justify-center w-full h-44 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-primary bg-primary/5 scale-[1.01]'
                : file
                  ? 'border-primary/40 bg-primary/5'
                  : 'border-border bg-muted/30 hover:bg-muted/50 hover:border-muted-foreground/30'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center py-6">
              {file ? (
                <>
                  <div className="p-3 rounded-xl bg-primary/10 mb-3">
                    <FileSpreadsheet className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-sm font-semibold">{file.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline mt-2"
                    onClick={(e) => {
                      e.preventDefault()
                      setFile(null)
                    }}
                  >
                    Choose a different file
                  </button>
                </>
              ) : (
                <>
                  <div className="p-3 rounded-xl bg-muted mb-3">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">Click to upload</span> or drag
                    and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">.CSV files only</p>
                </>
              )}
            </div>
            <input
              id="dropzone-file"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleUpload} disabled={isPending || !file} className="w-full h-10">
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          Process and Import
        </Button>
      </CardFooter>
    </Card>
  )
}
