import { Prisma, Profession } from '@prisma/client'
import { z } from 'zod'
import { ImportResult } from './types'
import {
  buildDateTime,
  normalizeWhitespace,
  parseAndValidateDate,
  parseAndValidateTime,
} from './utils'

const shiftRowSchema = z.object({
  shift_id: z.string().min(1, 'Missing shift_id'),
  date: z.string().min(1, 'Missing date'),
  start_time: z.string().min(1, 'Missing start_time'),
  end_time: z.string().min(1, 'Missing end_time'),
  requirements: z.string().min(1, 'Missing requirements'),
})

function parseRequirements(reqString: string): { profession: Profession; count: number }[] | null {
  // e.g. "nurses=3;doctors=0;receptionists=0"
  const parts = reqString
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean)
  const reqs: { profession: Profession; count: number }[] = []

  for (const part of parts) {
    const [role, countStr] = part.split('=')
    if (!role || !countStr) return null

    const count = parseInt(countStr, 10)
    if (isNaN(count) || count < 0) return null

    if (count === 0) continue // Skip zero requirements

    const normalizedRole = role.toLowerCase()
    let profession: Profession | null = null
    if (normalizedRole.includes('nurse')) profession = Profession.NURSE
    else if (normalizedRole.includes('doctor')) profession = Profession.DOCTOR
    else if (normalizedRole.includes('reception')) profession = Profession.RECEPTIONIST

    if (!profession) return null

    reqs.push({ profession, count })
  }

  return reqs
}

export function processShiftData(
  rawRows: Record<string, string>[],
): ImportResult<Prisma.ShiftCreateInput> {
  const result: ImportResult<Prisma.ShiftCreateInput> = {
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

  const shiftIdToInput = new Map<string, Prisma.ShiftCreateInput>()

  for (const rawRow of rawRows) {
    const shiftId = normalizeWhitespace(rawRow.shift_id)
    const dateStr = normalizeWhitespace(rawRow.date)
    const startTimeStr = normalizeWhitespace(rawRow.start_time)
    const endTimeStr = normalizeWhitespace(rawRow.end_time)
    const requirementsStr = normalizeWhitespace(rawRow.requirements)

    const parseResult = shiftRowSchema.safeParse({
      shift_id: shiftId,
      date: dateStr,
      start_time: startTimeStr,
      end_time: endTimeStr,
      requirements: requirementsStr,
    })

    if (!parseResult.success) {
      result.rejected.push({
        row: rawRow,
        reason: parseResult.error.issues.map((i) => i.message).join(', '),
      })
      result.statistics.rejected++
      continue
    }

    const date = parseAndValidateDate(parseResult.data.date)
    if (!date) {
      result.rejected.push({ row: rawRow, reason: `Invalid date format: ${rawRow.date}` })
      result.statistics.rejected++
      continue
    }

    const startTimeObj = parseAndValidateTime(parseResult.data.start_time)
    const endTimeObj = parseAndValidateTime(parseResult.data.end_time)

    if (!startTimeObj || !endTimeObj) {
      result.rejected.push({ row: rawRow, reason: `Invalid time format in start_time or end_time` })
      result.statistics.rejected++
      continue
    }

    const startDateTime = buildDateTime(date, startTimeObj)
    const endDateTime = buildDateTime(date, endTimeObj)

    // If end time is <= start time AND it's not marked explicitly as next day
    // We assume it spans midnight if it's logically an overnight shift (e.g. 22:00 to 06:00)
    if (endDateTime <= startDateTime) {
      // Automatic overnight handling if end time is numerically less than start time without +1
      if (endTimeObj.hours < startTimeObj.hours) {
        endDateTime.setDate(endDateTime.getDate() + 1)
      } else {
        result.rejected.push({
          row: rawRow,
          reason: `Impossible shift time: ends before or exactly when it starts`,
        })
        result.statistics.rejected++
        continue
      }
    }

    const reqs = parseRequirements(parseResult.data.requirements)
    if (reqs === null) {
      result.rejected.push({
        row: rawRow,
        reason: `Invalid requirements format: ${rawRow.requirements}`,
      })
      result.statistics.rejected++
      continue
    }

    const shiftInput: Prisma.ShiftCreateInput = {
      id: shiftId,
      date: date, // Keep original base date for indexing/querying
      startTime: startDateTime,
      endTime: endDateTime,
      requirements: {
        create: reqs.map((r) => ({
          profession: r.profession,
          count: r.count,
        })),
      },
    }

    if (shiftIdToInput.has(shiftId)) {
      result.merged.push({
        row: rawRow,
        reason: `Merged with existing row matching shift_id: ${shiftId}`,
      })
      result.statistics.merged++
      shiftIdToInput.set(shiftId, shiftInput) // Last one wins
    } else {
      shiftIdToInput.set(shiftId, shiftInput)
      result.statistics.accepted++
    }
  }

  result.accepted = Array.from(shiftIdToInput.values())
  return result
}
