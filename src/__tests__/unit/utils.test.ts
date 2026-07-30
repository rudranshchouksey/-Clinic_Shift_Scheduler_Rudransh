import { describe, it, expect } from 'vitest'
import {
  normalizeWhitespace,
  normalizeEmail,
  normalizeProfession,
  parseAndValidateDate,
  parseAndValidateTime,
  buildDateTime,
} from '@/services/importer/utils'
import { Profession } from '@prisma/client'

describe('Importer Utils', () => {
  describe('normalizeWhitespace', () => {
    it('should trim and remove extra spaces', () => {
      expect(normalizeWhitespace('  hello   world  ')).toBe('hello world')
      expect(normalizeWhitespace(null)).toBe('')
      expect(normalizeWhitespace(undefined)).toBe('')
    })
  })

  describe('normalizeEmail', () => {
    it('should handle standard emails', () => {
      expect(normalizeEmail(' TEST@example.com ')).toBe('test@example.com')
    })

    it('should replace (at) with @', () => {
      expect(normalizeEmail('user(at)example.com')).toBe('user@example.com')
    })
  })

  describe('normalizeProfession', () => {
    it('should map Doctor variants correctly', () => {
      expect(normalizeProfession('Doctor')).toBe(Profession.DOCTOR)
      expect(normalizeProfession('MD')).toBe(Profession.DOCTOR)
      expect(normalizeProfession(' physician ')).toBe(Profession.DOCTOR)
    })

    it('should map Nurse variants correctly', () => {
      expect(normalizeProfession('Registered Nurse')).toBe(Profession.NURSE)
      expect(normalizeProfession('RN')).toBe(Profession.NURSE)
      expect(normalizeProfession('nurse practitioner')).toBe(Profession.NURSE)
    })

    it('should map Receptionist variants correctly', () => {
      expect(normalizeProfession('Reception')).toBe(Profession.RECEPTIONIST)
      expect(normalizeProfession('Recep')).toBe(Profession.RECEPTIONIST)
    })

    it('should return null for unknown professions', () => {
      expect(normalizeProfession('Janitor')).toBeNull()
      expect(normalizeProfession(null)).toBeNull()
    })
  })

  describe('parseAndValidateDate', () => {
    it('should parse YYYY-MM-DD', () => {
      const result = parseAndValidateDate('2024-05-10')
      expect(result?.getFullYear()).toBe(2024)
      expect(result?.getMonth()).toBe(4) // 0-indexed
      expect(result?.getDate()).toBe(10)
    })

    it('should parse DD/MM/YYYY', () => {
      const result = parseAndValidateDate('10/05/2024')
      expect(result?.getFullYear()).toBe(2024)
      expect(result?.getMonth()).toBe(4)
      expect(result?.getDate()).toBe(10)
    })

    it('should parse MM-dd-yyyy', () => {
      const result = parseAndValidateDate('05-10-2024')
      expect(result?.getFullYear()).toBe(2024)
      expect(result?.getMonth()).toBe(4)
      expect(result?.getDate()).toBe(10)
    })

    it('should return null for invalid dates', () => {
      expect(parseAndValidateDate('invalid-date')).toBeNull()
      expect(parseAndValidateDate('2024-13-45')).toBeNull()
    })
  })

  describe('parseAndValidateTime', () => {
    it('should parse simple time', () => {
      expect(parseAndValidateTime('09:30')).toEqual({
        hours: 9,
        minutes: 30,
        isNextDay: false,
      })
    })

    it('should parse next day time', () => {
      expect(parseAndValidateTime('02:00+1')).toEqual({
        hours: 2,
        minutes: 0,
        isNextDay: true,
      })
    })

    it('should return null for invalid times', () => {
      expect(parseAndValidateTime('25:00')).toBeNull()
      expect(parseAndValidateTime('09:60')).toBeNull()
      expect(parseAndValidateTime('invalid')).toBeNull()
    })
  })

  describe('buildDateTime', () => {
    it('should combine date and time correctly', () => {
      const date = new Date('2024-05-10T00:00:00')
      const result = buildDateTime(date, { hours: 14, minutes: 30, isNextDay: false })
      expect(result.getHours()).toBe(14)
      expect(result.getMinutes()).toBe(30)
      expect(result.getDate()).toBe(10)
    })

    it('should handle next day transition', () => {
      const date = new Date('2024-05-10T00:00:00')
      const result = buildDateTime(date, { hours: 2, minutes: 0, isNextDay: true })
      expect(result.getHours()).toBe(2)
      expect(result.getDate()).toBe(11)
    })
  })
})
