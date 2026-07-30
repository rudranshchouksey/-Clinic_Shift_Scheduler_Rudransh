import { Profession } from '@prisma/client'
import { ShiftWithRelations } from '@/server/queries/shifts'

export type StaffingStatus = 'EMPTY' | 'PARTIAL' | 'FULL'

export type ShiftStaffingSummary = {
  status: StaffingStatus
  requiredCounts: Record<Profession, number>
  claimedCounts: Record<Profession, number>
  missingCounts: Record<Profession, number>
  totalRequired: number
  totalClaimed: number
  totalMissing: number
}

export function calculateShiftStaffing(shift: ShiftWithRelations): ShiftStaffingSummary {
  const requiredCounts: Record<Profession, number> = {
    DOCTOR: 0,
    NURSE: 0,
    RECEPTIONIST: 0,
  }

  const claimedCounts: Record<Profession, number> = {
    DOCTOR: 0,
    NURSE: 0,
    RECEPTIONIST: 0,
  }

  const missingCounts: Record<Profession, number> = {
    DOCTOR: 0,
    NURSE: 0,
    RECEPTIONIST: 0,
  }

  let totalRequired = 0
  let totalClaimed = 0
  let totalMissing = 0

  // Tally requirements
  for (const req of shift.requirements) {
    requiredCounts[req.profession] += req.count
    totalRequired += req.count
  }

  // Tally claims
  for (const claim of shift.claims) {
    const prof = claim.user.profession
    if (prof) {
      claimedCounts[prof]++
      // Note: We only count claims against requirements up to the required amount.
      // E.g., if a manager over-assigns, we don't say totalMissing is negative.
    }
  }

  // Calculate missing
  const professions: Profession[] = ['DOCTOR', 'NURSE', 'RECEPTIONIST']
  for (const prof of professions) {
    const missing = Math.max(0, requiredCounts[prof] - claimedCounts[prof])
    missingCounts[prof] = missing
    totalMissing += missing
    totalClaimed += Math.min(requiredCounts[prof], claimedCounts[prof])
  }

  let status: StaffingStatus = 'PARTIAL'
  if (totalClaimed === 0 && totalRequired > 0) {
    status = 'EMPTY'
  } else if (totalMissing === 0) {
    status = 'FULL'
  }

  return {
    status,
    requiredCounts,
    claimedCounts,
    missingCounts,
    totalRequired,
    totalClaimed,
    totalMissing,
  }
}
