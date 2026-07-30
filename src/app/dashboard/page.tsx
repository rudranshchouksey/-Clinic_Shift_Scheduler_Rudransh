import { requireAuth } from '@/lib/auth-utils'
import { ManagerDashboard } from './_components/manager-dashboard'
import { StaffDashboard } from './_components/staff-dashboard'

export default async function DashboardPage(props: { searchParams: Promise<{ week?: string }> }) {
  const session = await requireAuth()
  const searchParams = await props.searchParams

  if (session.user.role === 'MANAGER') {
    return <ManagerDashboard searchParams={searchParams} />
  }

  return <StaffDashboard session={session} />
}
