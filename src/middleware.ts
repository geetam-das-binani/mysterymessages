import { NextResponse ,NextRequest} from "next/server";
import { decode, getToken } from 'next-auth/jwt';
import { cookies } from "next/headers";
export { default } from 'next-auth/middleware';

export async function middleware(request: NextRequest) {
  // const token = await getToken({ req: request });
 
 const token=cookies().get('next-auth.session-token');
//  console.log(await decode({
//   token:token?.value,
//   secret:"343434sds7AJISURJKDJH:PWEOWEPsl",
//   salt:token?.name
//  }));
 
  
  const url = request.nextUrl;
 
  // Redirect to dashboard if the user is already authenticated
  // and trying to access sign-in, sign-up, or home page
  if (
    token &&
    (url.pathname.startsWith('/sign-in') ||
      url.pathname.startsWith('/sign-up') ||
      url.pathname.startsWith('/verify') ||
      url.pathname === '/'
    
    )
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (!token && url.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/sign-in', '/sign-up', '/', '/verify/:path*'],
};