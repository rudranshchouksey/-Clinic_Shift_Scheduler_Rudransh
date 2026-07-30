'use server'

import { prisma } from '@/lib/db'
import { requireManager } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'
import { importCsv, ImportType } from '@/services/importer'
import { Prisma } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

export type ImportResultState = {
  success?: boolean
  error?: string
  reportId?: string
}

export async function uploadCsvAction(
  csvString: string,
  fileName: string,
  type: ImportType,
): Promise<ImportResultState> {
  try {
    const session = await requireManager()

    if (!csvString || !fileName || !type) {
      return { error: 'Missing required parameters' }
    }

    const result = await importCsv(csvString, type)

    return await prisma.$transaction(async (tx) => {
      // 1. Create Import History & Report
      const history = await tx.importHistory.create({
        data: {
          fileName,
          importedById: session.user.id,
          reports: {
            create: {
              totalRows: result.statistics.total,
              acceptedRows: result.accepted.length,
              rejectedRows: result.rejected.length,
              details: JSON.stringify({
                rejected: result.rejected,
                merged: result.merged,
              }),
            },
          },
        },
        include: { reports: true },
      })

      const reportId = history.reports[0].id

      // 2. Perform Insertions
      if (type === 'STAFF') {
        const defaultPassword = await bcrypt.hash('staff123', 10)

        for (const staff of result.accepted as unknown as {
          email: string
          name: string
          profession: never
        }[]) {
          // Check if user exists
          let user = await tx.user.findUnique({ where: { email: staff.email } })

          if (!user) {
            user = await tx.user.create({
              data: {
                email: staff.email,
                name: staff.name,
                profession: staff.profession,
                role: 'STAFF',
                password: defaultPassword,
              },
            })
            // Also create the better-auth Account record so they can login
            await tx.account.create({
              data: {
                id: user.id + '_acc',
                accountId: user.id,
                providerId: 'credential',
                userId: user.id,
                password: defaultPassword,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            })
          } else {
            // Just update
            await tx.user.update({
              where: { id: user.id },
              data: { name: staff.name, profession: staff.profession },
            })
          }
        }
      } else if (type === 'SHIFTS') {
        // Insert Shifts
        for (const shift of result.accepted as Prisma.ShiftCreateInput[]) {
          await tx.shift.upsert({
            where: { id: shift.id },
            update: {
              date: shift.date,
              startTime: shift.startTime,
              endTime: shift.endTime,
              // We don't update requirements on upsert to avoid complex diffs,
              // or we can delete/recreate them if needed, but for now just update times.
            },
            create: {
              id: shift.id,
              date: shift.date,
              startTime: shift.startTime,
              endTime: shift.endTime,
              requirements: shift.requirements,
            },
          })
        }
      }

      return { success: true, reportId }
    })
  } catch (e: unknown) {
    console.error('Import error', e)
    return { error: e instanceof Error ? e.message : 'An unexpected error occurred during import' }
  } finally {
    revalidatePath('/manager/imports')
    revalidatePath('/manager/import-report')
    revalidatePath('/manager/shifts')
  }
}
