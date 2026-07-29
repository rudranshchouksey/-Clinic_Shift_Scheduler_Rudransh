import { auth } from '@/server/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export const getSession = async () => {
  return auth.api.getSession({
    headers: await headers(),
  })
}

export const requireAuth = async () => {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }
  return session
}

export const requireManager = async () => {
  const session = await requireAuth()
  if (session.user.role !== 'MANAGER') {
    redirect('/dashboard') // or some 403 page
  }
  return session
}
