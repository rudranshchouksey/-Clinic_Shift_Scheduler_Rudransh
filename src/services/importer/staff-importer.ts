import { Prisma, Role } from '@prisma/client'
import { z } from 'zod'
import { ImportResult } from './types'
import { normalizeEmail, normalizeProfession, normalizeWhitespace } from './utils'

const staffRowSchema = z.object({
  staff_id: z.string().min(1, 'Missing staff_id'),
  full_name: z.string().min(1, 'Missing full_name'),
  role: z.string().min(1, 'Missing role'),
  email: z.string().email('Invalid email address format'),
})

export function processStaffData(
  rawRows: Record<string, string>[],
): ImportResult<Prisma.UserCreateInput> {
  const result: ImportResult<Prisma.UserCreateInput> = {
    accepted: [],
    rejected: [],
    merged: [],
    statistics: {
      total: rawRows.length,
      accepted: 0,
      rejected: 0,
      merged: 0,
    },
  }

  const emailToUser = new Map<string, Prisma.UserCreateInput>()
  const staffIdToUser = new Map<string, Prisma.UserCreateInput>()

  for (const rawRow of rawRows) {
    // Basic normalization
    const staffId = normalizeWhitespace(rawRow.staff_id)
    const fullName = normalizeWhitespace(rawRow.full_name)
    const roleStr = normalizeWhitespace(rawRow.role)
    const email = normalizeEmail(rawRow.email)

    // Validate structure
    const parseResult = staffRowSchema.safeParse({
      staff_id: staffId,
      full_name: fullName,
      role: roleStr,
      email: email,
    })

    if (!parseResult.success) {
      result.rejected.push({
        row: rawRow,
        reason: parseResult.error.issues.map((i) => i.message).join(', '),
      })
      result.statistics.rejected++
      continue
    }

    // Domain validation (Profession)
    const profession = normalizeProfession(parseResult.data.role)
    if (!profession) {
      result.rejected.push({
        row: rawRow,
        reason: `Unrecognized profession role: '${rawRow.role}'`,
      })
      result.statistics.rejected++
      continue
    }

    const userInput: Prisma.UserCreateInput = {
      id: staffId, // Store staff_id as the primary key as per our plan
      name: parseResult.data.full_name,
      email: parseResult.data.email,
      role: Role.STAFF, // Assuming all imports are staff
      profession: profession,
    }

    // Deduplication (Conflict Resolution)
    let isMerge = false
    let mergeReason = ''

    if (staffIdToUser.has(staffId)) {
      isMerge = true
      mergeReason = `Merged with existing row matching staff_id: ${staffId}`
    } else if (emailToUser.has(userInput.email)) {
      isMerge = true
      mergeReason = `Merged with existing row matching email: ${userInput.email}`
    }

    if (isMerge) {
      result.merged.push({
        row: rawRow,
        reason: mergeReason,
      })
      result.statistics.merged++

      // Update our map with the latest row (or could keep the first, but replacing is standard)
      staffIdToUser.set(staffId, userInput)
      emailToUser.set(userInput.email, userInput)
    } else {
      staffIdToUser.set(staffId, userInput)
      emailToUser.set(userInput.email, userInput)
      result.statistics.accepted++
    }
  }

  // Populate accepted list
  // We use the values from the map to avoid duplicate entries in the final array
  // Since we populated both maps, we can just use one (staffIdToUser)
  result.accepted = Array.from(staffIdToUser.values())

  return result
}
