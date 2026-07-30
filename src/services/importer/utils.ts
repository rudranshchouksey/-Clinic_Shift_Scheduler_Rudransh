import { Profession } from '@prisma/client'
import { isValid, parse, parseISO } from 'date-fns'

export function normalizeWhitespace(str: string | undefined | null): string {
  if (!str) return ''
  return str.trim().replace(/\s+/g, ' ')
}

export function normalizeEmail(email: string | undefined | null): string {
  if (!email) return ''
  let normalized = normalizeWhitespace(email).toLowerCase()
  // Handle (at) replacing with @
  normalized = normalized.replace(/\(at\)/g, '@')
  return normalized
}

export function normalizeProfession(roleStr: string | undefined | null): Profession | null {
  if (!roleStr) return null
  const normalized = normalizeWhitespace(roleStr).toLowerCase()

  if (
    normalized.includes('doctor') ||
    normalized.includes('md') ||
    normalized.includes('physician')
  ) {
    return Profession.DOCTOR
  }

  if (normalized.includes('nurse') || normalized === 'rn' || normalized === 'registered nurse') {
    return Profession.NURSE
  }

  if (normalized.includes('reception') || normalized.includes('recep')) {
    return Profession.RECEPTIONIST
  }

  return null
}

export function parseAndValidateDate(dateStr: string): Date | null {
  const normalized = normalizeWhitespace(dateStr)
  if (!normalized) return null

  // Try parsing YYYY-MM-DD
  let parsedDate = parseISO(normalized)

  if (!isValid(parsedDate)) {
    // Try parsing DD/MM/YYYY
    parsedDate = parse(normalized, 'dd/MM/yyyy', new Date())
  }

  if (!isValid(parsedDate)) {
    // Try parsing MM-dd-yyyy
    parsedDate = parse(normalized, 'MM-dd-yyyy', new Date())
  }

  if (isValid(parsedDate)) {
    return parsedDate
  }

  return null
}

export function parseAndValidateTime(
  timeStr: string,
): { hours: number; minutes: number; isNextDay: boolean } | null {
  const normalized = normalizeWhitespace(timeStr)
  if (!normalized) return null

  // e.g. "10:00+1" or "09:00"
  const match = normalized.match(/^(\d{1,2}):(\d{2})(?:\+(\d))?$/)
  if (!match) return null

  const hours = parseInt(match[1], 10)
  const minutes = parseInt(match[2], 10)
  const isNextDay = match[3] === '1'

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null
  }

  return { hours, minutes, isNextDay }
}

export function buildDateTime(
  date: Date,
  timeObj: { hours: number; minutes: number; isNextDay: boolean },
): Date {
  const dt = new Date(date)
  dt.setHours(timeObj.hours, timeObj.minutes, 0, 0)
  if (timeObj.isNextDay) {
    dt.setDate(dt.getDate() + 1)
  }
  return dt
}
