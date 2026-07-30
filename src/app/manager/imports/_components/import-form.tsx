'use client'

import * as React from 'react'
import { Upload, File, Loader2 } from 'lucide-react'
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
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
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
        toast.success('CSV Imported successfully.')
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
          Upload your Staff or Shifts CSV data. The system will parse and validate the rows
          automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Data Type</label>
          <Select value={type} onValueChange={(val) => setType(val as ImportType)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="STAFF">Staff (Doctors, Nurses, Receptionists)</SelectItem>
              <SelectItem value="SHIFTS">Shifts & Requirements</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">CSV File</label>
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-muted/20 hover:bg-muted/50 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {file ? (
                  <>
                    <File className="w-8 h-8 mb-4 text-primary" />
                    <p className="mb-2 text-sm text-foreground font-semibold">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">.CSV files only</p>
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
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleUpload} disabled={isPending || !file} className="w-full">
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
