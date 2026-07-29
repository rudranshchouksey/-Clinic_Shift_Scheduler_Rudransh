import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const pathName = request.nextUrl.pathname

  const response = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
    headers: {
      cookie: request.headers.get('cookie') || '',
    },
  })

  const session = response.ok ? await response.json() : null

  const isAuthRoute = pathName.startsWith('/login')
  const isProtectedRoute = pathName.startsWith('/dashboard')

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Very basic Role-based check (in production, usually better done via Server Actions / Layouts for deep logic)
  if (pathName.startsWith('/dashboard/import') && session?.user?.role !== 'MANAGER') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
