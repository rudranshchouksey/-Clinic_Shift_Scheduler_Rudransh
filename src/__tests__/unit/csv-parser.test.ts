import { describe, it, expect, vi, beforeEach } from 'vitest'
import { processStaffData, processShiftData } from '@/services/importer'

describe('CSV Parser Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('StaffImporter (processStaffData)', () => {
    it('should parse valid staff CSV successfully', async () => {
      const rawRows = [
        {
          Name: 'John Doe',
          Email: 'john@example.com',
          Role: 'Doctor',
          staff_id: '1',
          full_name: 'John Doe',
          role: 'Doctor',
          email: 'john@example.com',
        },
        {
          Name: 'Jane Smith',
          Email: 'jane(at)example.com',
          Role: 'RN',
          staff_id: '2',
          full_name: 'Jane Smith',
          role: 'RN',
          email: 'jane(at)example.com',
        },
      ]

      const report = processStaffData(rawRows)

      expect(report.statistics.total).toBe(2)
      expect(report.statistics.accepted).toBe(2)
      expect(report.statistics.rejected).toBe(0)
    })

    it('should reject invalid professions', async () => {
      const rawRows = [
        {
          Name: 'Invalid User',
          Email: 'invalid@example.com',
          Role: 'Janitor',
          staff_id: '3',
          full_name: 'Invalid User',
          role: 'Janitor',
          email: 'invalid@example.com',
        },
      ]

      const report = processStaffData(rawRows)

      expect(report.statistics.total).toBe(1)
      expect(report.statistics.accepted).toBe(0)
      expect(report.statistics.rejected).toBe(1)
      expect(report.rejected[0].reason).toContain('Unrecognized profession role')
    })
  })

  describe('ShiftImporter (processShiftData)', () => {
    it('should reject impossible shift times', async () => {
      const rawRows = [
        {
          shift_id: '1',
          date: '2024-05-10',
          start_time: '14:00',
          end_time: '14:00',
          requirements: 'nurses=1',
        },
      ]

      const report = processShiftData(rawRows)

      expect(report.statistics.total).toBe(1)
      expect(report.statistics.accepted).toBe(0)
      expect(report.statistics.rejected).toBe(1)
      expect(report.rejected[0].reason).toContain('Impossible shift time')
    })

    it('should detect conflicting/duplicate rows in the CSV', async () => {
      const rawRows = [
        {
          shift_id: '1',
          date: '2024-05-10',
          start_time: '09:00',
          end_time: '17:00',
          requirements: 'doctors=1',
        },
        {
          shift_id: '1',
          date: '2024-05-10',
          start_time: '09:00',
          end_time: '17:00',
          requirements: 'doctors=2',
        },
      ]

      const report = processShiftData(rawRows)

      expect(report.statistics.total).toBe(2)
      expect(report.statistics.merged).toBeGreaterThan(0)
    })
  })
})
