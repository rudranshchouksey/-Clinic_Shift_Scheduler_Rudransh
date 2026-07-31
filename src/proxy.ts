import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isAuthRoute = pathname.startsWith('/login')
  const isManagerRoute = pathname.startsWith('/manager')
  const isStaffRoute = pathname.startsWith('/staff')

  // Only check session for protected and auth routes
  if (!isAuthRoute && !isManagerRoute && !isStaffRoute) {
    return NextResponse.next()
  }

  let session = null
  try {
    const res = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    })
    if (res.ok) {
      session = await res.json()
    }
  } catch (e) {
    console.error('Proxy session fetch error', e)
  }

  if (!session || !session.user) {
    if (isManagerRoute || isStaffRoute) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }

  if (isAuthRoute) {
    return NextResponse.redirect(
      new URL(
        session.user.role === 'MANAGER' ? '/manager/dashboard' : '/staff/dashboard',
        request.url,
      ),
    )
  }

  if (isManagerRoute && session.user.role !== 'MANAGER') {
    return NextResponse.redirect(new URL('/staff/dashboard', request.url))
  }

  if (isStaffRoute && session.user.role !== 'STAFF') {
    return NextResponse.redirect(new URL('/manager/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
}
