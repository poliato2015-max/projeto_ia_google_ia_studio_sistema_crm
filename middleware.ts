import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) return response

  const supabase = createServerClient(url, key, {
    cookieOptions: {
      name: 'executive-lens-auth',
      sameSite: 'none',
      secure: true,
      path: '/',
    },
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        response = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, {
            ...options,
            sameSite: 'none',
            secure: true,
            path: '/',
          })
        )
      },
    },
  })

  const pathname = request.nextUrl.pathname
  const isPublic = pathname === '/login' || 
                   pathname.startsWith('/_next') || 
                   pathname.includes('.') || 
                   pathname.startsWith('/api')

  if (isPublic) {
    return response
  }

  const { data: { session } } = await supabase.auth.getSession()

  if (!session && !isPublic) {
    const loginUrl = new URL('/login', request.url)
    request.nextUrl.searchParams.forEach((value, key) => {
      loginUrl.searchParams.set(key, value)
    })
    const redirectResponse = NextResponse.redirect(loginUrl)
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, {
        path: cookie.path || '/',
        domain: cookie.domain,
        maxAge: cookie.maxAge,
        expires: cookie.expires,
        sameSite: 'none',
        secure: true,
      })
    })
    return redirectResponse
  }

  if (session && pathname === '/login') {
    const redirectResponse = NextResponse.redirect(new URL('/', request.url))
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, {
        path: cookie.path || '/',
        domain: cookie.domain,
        maxAge: cookie.maxAge,
        expires: cookie.expires,
        sameSite: 'none',
        secure: true,
      })
    })
    return redirectResponse
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
