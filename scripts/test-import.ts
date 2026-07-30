import fs from 'fs'
import path from 'path'
import { importCsv } from '../src/services/importer/index'

async function main() {
  console.log('--- Testing Staff Import ---')
  const staffCsv = fs.readFileSync(path.join(__dirname, '../staff.csv'), 'utf-8')
  const staffResult = await importCsv(staffCsv, 'STAFF')
  console.log(JSON.stringify(staffResult.statistics, null, 2))
  console.log('Rejected:', JSON.stringify(staffResult.rejected, null, 2))
  console.log('Merged:', JSON.stringify(staffResult.merged, null, 2))

  console.log('\n--- Testing Shifts Import ---')
  const shiftsCsv = fs.readFileSync(path.join(__dirname, '../shifts.csv'), 'utf-8')
  const shiftsResult = await importCsv(shiftsCsv, 'SHIFTS')
  console.log(JSON.stringify(shiftsResult.statistics, null, 2))
  console.log('Rejected:', JSON.stringify(shiftsResult.rejected, null, 2))
  console.log('Merged:', JSON.stringify(shiftsResult.merged, null, 2))
}

main().catch(console.error)
