import { describe, it, expect, vi, beforeEach } from 'vitest'
import { claimShift, unclaimShift } from '@/server/actions/shifts'
import { prismaMock } from '@/lib/__mocks__/db'
import { Profession } from '@prisma/client'
import { requireAuth } from '@/lib/auth-utils'

// Mock requireAuth using string literals to avoid hoisting issues with Profession enum
vi.mock('@/lib/auth-utils', () => ({
  requireAuth: vi.fn(),
}))

describe('Claims Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(requireAuth).mockResolvedValue({
      user: { id: 'user-1', profession: 'NURSE', role: 'STAFF' },
    } as unknown)
  })

  describe('claimShift', () => {
    it('should throw if user has no profession', async () => {
      vi.mocked(requireAuth).mockResolvedValue({
        user: { id: 'user-2', profession: null, role: 'STAFF' },
      } as unknown)

      await expect(claimShift('shift-1')).resolves.toEqual({
        error: 'Only staff with a profession can claim shifts',
      })
    })

    it('should throw if shift does not exist or requires different profession', async () => {
      prismaMock.shift.findUnique.mockResolvedValue(null)
      await expect(claimShift('shift-invalid')).resolves.toEqual({ error: 'Shift not found' })
    })

    it('should throw if shift is fully staffed for this profession', async () => {
      prismaMock.shift.findUnique.mockResolvedValue({
        id: 'shift-1',
        date: new Date(),
        startTime: new Date(),
        endTime: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        // @ts-expect-error - mocked relation
        requirements: [{ profession: Profession.NURSE, count: 1 }],
        claims: [{ userId: 'other-user', user: { profession: Profession.NURSE } }],
      })

      await expect(claimShift('shift-1')).resolves.toEqual({
        error: 'Shift is already fully staffed for your profession',
      })
    })

    it('should successfully claim shift if valid', async () => {
      prismaMock.shift.findUnique.mockResolvedValue({
        id: 'shift-1',
        date: new Date(),
        startTime: new Date(),
        endTime: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        // @ts-expect-error - mocked relation
        requirements: [{ profession: Profession.NURSE, count: 2 }],
        claims: [], // 0 claims
      })

      // Mock overlapping shifts
      prismaMock.shiftClaim.findFirst.mockResolvedValue(null)

      // Mock create claim
      prismaMock.shiftClaim.create.mockResolvedValue({
        id: 'claim-1',
        shiftId: 'shift-1',
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      })

      await expect(claimShift('shift-1')).resolves.toEqual({ success: true })
      expect(prismaMock.shiftClaim.create).toHaveBeenCalledWith({
        data: { shiftId: 'shift-1', userId: 'user-1' },
      })
    })

    it('should throw on overlapping shifts', async () => {
      prismaMock.shift.findUnique.mockResolvedValue({
        id: 'shift-1',
        date: new Date('2024-05-10'),
        startTime: new Date('2024-05-10T09:00:00'),
        endTime: new Date('2024-05-10T17:00:00'),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        // @ts-expect-error - mocked relation
        requirements: [{ profession: Profession.NURSE, count: 2 }],
        claims: [],
      })

      prismaMock.shiftClaim.findFirst.mockResolvedValue({
        id: 'claim-2',
        shiftId: 'shift-2',
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      })

      await expect(claimShift('shift-1')).resolves.toEqual({
        error: 'You already have a shift scheduled at this time',
      })
    })
  })

  describe('unclaimShift', () => {
    it('should drop a claimed shift successfully', async () => {
      prismaMock.shiftClaim.findFirst.mockResolvedValue({
        id: 'claim-1',
        shiftId: 'shift-1',
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      })

      prismaMock.shiftClaim.update.mockResolvedValue({
        id: 'claim-1',
        shiftId: 'shift-1',
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
      })

      await expect(unclaimShift('shift-1')).resolves.toEqual({ success: true })
      expect(prismaMock.shiftClaim.update).toHaveBeenCalled()
    })
  })
})
