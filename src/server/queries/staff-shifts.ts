import { prisma } from '@/lib/db'
import { Profession } from '@prisma/client'

export async function getStaffDashboardData(userId: string, profession: Profession) {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  // 1. Fetch all upcoming shifts
  const upcomingShifts = await prisma.shift.findMany({
    where: {
      date: {
        gte: todayStart,
      },
      deletedAt: null,
    },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    include: {
      requirements: {
        where: { deletedAt: null },
      },
      claims: {
        where: { deletedAt: null },
        include: {
          user: {
            select: { profession: true, id: true },
          },
        },
      },
    },
  })

  // 2. Separate into "My Claimed Shifts" and "Available Shifts"
  const myShifts: typeof upcomingShifts = []
  const availableShifts: typeof upcomingShifts = []

  // Helper to check for overlap
  const checkOverlap = (shiftA: (typeof upcomingShifts)[0], shiftB: (typeof upcomingShifts)[0]) => {
    if (shiftA.date.getTime() !== shiftB.date.getTime()) return false
    return (
      (shiftA.startTime >= shiftB.startTime && shiftA.startTime < shiftB.endTime) ||
      (shiftA.endTime > shiftB.startTime && shiftA.endTime <= shiftB.endTime) ||
      (shiftA.startTime <= shiftB.startTime && shiftA.endTime >= shiftB.endTime)
    )
  }

  for (const shift of upcomingShifts) {
    const isClaimedByMe = shift.claims.some((c) => c.userId === userId)

    if (isClaimedByMe) {
      myShifts.push(shift)
      continue
    }

    // Check if shift requires my profession
    const requirement = shift.requirements.find((r) => r.profession === profession)
    if (!requirement) continue // Doesn't need my profession

    // Check if requirement is already fully claimed
    const claimsForMyProfession = shift.claims.filter(
      (c) => c.user.profession === profession,
    ).length
    if (claimsForMyProfession >= requirement.count) continue // Fully staffed for my role

    availableShifts.push(shift)
  }

  // 3. Mark available shifts with conflicts
  const availableWithConflicts = availableShifts.map((shift) => {
    const hasConflict = myShifts.some((myShift) => checkOverlap(myShift, shift))
    return {
      ...shift,
      hasConflict,
    }
  })

  return {
    myShifts,
    availableShifts: availableWithConflicts,
  }
}
