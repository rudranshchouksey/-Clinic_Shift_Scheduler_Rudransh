import Papa from 'papaparse'
import { processStaffData } from './staff-importer'
import { processShiftData } from './shift-importer'

export * from './types'
export { processStaffData } from './staff-importer'
export { processShiftData } from './shift-importer'

export type ImportType = 'STAFF' | 'SHIFTS'

export async function parseCsvString(csvString: string): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          // If there are fatal parsing errors (like bad quotes), we might reject
          // But PapaParse often recovers. We'll just pass the data along if it's there.
          if (!results.data || results.data.length === 0) {
            reject(new Error('Failed to parse CSV or file is empty'))
            return
          }
        }
        resolve(results.data as Record<string, string>[])
      },
      error: (error: Error) => {
        reject(error)
      },
    })
  })
}

export async function importCsv(csvString: string, type: ImportType) {
  const rawRows = await parseCsvString(csvString)

  if (type === 'STAFF') {
    return processStaffData(rawRows)
  } else if (type === 'SHIFTS') {
    return processShiftData(rawRows)
  }

  throw new Error(`Unsupported import type: ${type}`)
}
