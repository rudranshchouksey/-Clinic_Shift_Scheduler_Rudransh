import { prisma } from '@/lib/db'

export async function getImportHistories() {
  return prisma.importHistory.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      reports: true,
      importedBy: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })
}

export async function getImportReportDetails(id: string) {
  const history = await prisma.importHistory.findUnique({
    where: { id },
    include: {
      reports: true,
      importedBy: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })

  if (!history || history.reports.length === 0) {
    return null
  }

  const report = history.reports[0]

  let detailsData = { rejected: [], merged: [] }
  try {
    if (report.details) {
      detailsData = JSON.parse(report.details)
    }
  } catch (e) {
    console.error('Failed to parse report details JSON:', e)
  }

  return {
    history,
    report: {
      ...report,
      parsedDetails: detailsData as {
        rejected: { row: Record<string, string>; reason: string }[]
        merged: { row: Record<string, string>; reason: string }[]
      },
    },
  }
}
