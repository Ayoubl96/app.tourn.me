import { NextAuthConfig } from 'next-auth';
import CredentialProvider from 'next-auth/providers/credentials';
import GithubProvider from 'next-auth/providers/github';
import type { JwtPayload } from 'jwt-decode';
import { JWT } from 'next-auth/jwt';
import { login, getProfileServer, refreshToken } from '@/api/auth';
import { AuthenticatedUser } from '@/api/auth';
import { locales, defaultLocale } from '@/config/locales';

// Extend the Session type to include the accessToken property and additional user details
declare module 'next-auth' {
  interface Session {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      name: string;
      login: string;
      address: string;
      email: string;
      phone_number: string;
      vat_number: string;
      created_at: string;
      updated_at?: string;
    };
  }
}

// Extend the JWT type to include our custom properties
declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
  }
}

// Helper function to get sign-in page URL with proper locale handling
const getSignInPage = (req: Request) => {
  // Extract locale from URL if present
  const url = new URL(req.url);
  const pathname = url.pathname;

  const currentLocale = locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // If locale is found, redirect to /{locale}, otherwise to /
  return currentLocale ? `/${currentLocale}` : '/';
};

const authConfig = {
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === 'production'
          ? `__Secure-next-auth.session-token`
          : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    },
    callbackUrl: {
      name:
        process.env.NODE_ENV === 'production'
          ? `__Secure-next-auth.callback-url`
          : `next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    },
    csrfToken: {
      name:
        process.env.NODE_ENV === 'production'
          ? `__Host-next-auth.csrf-token`
          : `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID ?? '',
      clientSecret: process.env.GITHUB_SECRET ?? ''
    }),
    CredentialProvider({
      credentials: {
        username: {
          type: 'text',
          label: 'Username',
          placeholder: 'Enter your username'
        },
        password: {
          type: 'password',
          label: 'Password',
          placeholder: 'Enter your password'
        }
      },
      async authorize(credentials, req) {
        const creds = credentials as Partial<
          Record<'username' | 'password', string>
        >;
        if (!creds || !creds.username || !creds.password) {
          return null;
        }

        try {
          // Use the centralized API for login
          const loginData = await login(creds.username, creds.password);

          if (loginData.access_token) {
            // Fetch user details using our server-side API
            const userData = await getProfileServer(loginData.access_token);

            return {
              id: String(userData.id),
              name: userData.name,
              login: userData.login,
              token: loginData.access_token,
              refreshToken: loginData.refresh_token,
              address: userData.address,
              email: userData.email,
              phone_number: userData.phone_number,
              vat_number: (userData as any).vat_number || '',
              created_at: userData.created_at,
              updated_at: userData.updated_at
            } as AuthenticatedUser & { refreshToken: string };
          } else {
            console.error('Login failed: No access token');
            return null;
          }
        } catch (error) {
          console.error('Error during authorization:', error);
          return null;
        }
      }
    })
  ],
  // Using fixed paths with locale handling in the middleware
  pages: {
    signIn: '/', // Sign-in page
    signOut: '/', // Sign-out page
    error: '/auth/error', // Error page
    verifyRequest: '/auth/verify-request', // Verification page
    newUser: '/dashboard' // Redirect new users to the dashboard
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // If the url is a relative path, make it absolute
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      // If it's an absolute URL to the same origin, allow it
      if (url.startsWith(baseUrl)) {
        return url;
      }
      // Otherwise, redirect to dashboard
      return `${baseUrl}/en/dashboard`;
    },
    async jwt({ token, user }) {
      // 1) On initial sign in:
      if (user && (user as any).token) {
        const accessToken = (user as any).token;
        const refreshTokenValue = (user as any).refreshToken;
        try {
          // Decode the JWT to find `exp`
          const decoded = simpleJwtDecode(accessToken) as JwtPayload;
          token.expiresAt = decoded.exp ? decoded.exp * 1000 : 0;
        } catch (err) {
          console.error('Could not decode token', err);
          token.expiresAt = 0;
        }
        token.accessToken = accessToken;
        token.refreshToken = refreshTokenValue;
      }

      // 2) On subsequent requests, check if the token is about to expire and refresh it
      if (
        typeof token.expiresAt === 'number' &&
        Date.now() >= token.expiresAt - 60000 && // 1 minute before expiration
        token.refreshToken
      ) {
        console.log('Token is about to expire. Attempting to refresh...');
        try {
          const refreshedTokens = await refreshToken(token.refreshToken);

          // Update token with new values
          token.accessToken = refreshedTokens.access_token;
          token.refreshToken = refreshedTokens.refresh_token;

          // Update expiration time
          try {
            const decoded = simpleJwtDecode(
              refreshedTokens.access_token
            ) as JwtPayload;
            token.expiresAt = decoded.exp ? decoded.exp * 1000 : 0;
          } catch (err) {
            console.error('Could not decode refreshed token', err);
            token.expiresAt = Date.now() + 30 * 60 * 1000; // Fallback: assume 30 minutes
          }

          console.log('Token successfully refreshed');
        } catch (error) {
          console.error('Failed to refresh token', error);
          // On refresh failure, clear tokens which will force re-login
          token.accessToken = undefined;
          token.refreshToken = undefined;
          token.expiresAt = 0;
        }
      }

      // 3) If token is expired and couldn't be refreshed, clear it
      if (
        typeof token.expiresAt === 'number' &&
        Date.now() >= token.expiresAt &&
        !token.refreshToken
      ) {
        console.log(
          'Token has expired and cannot be refreshed. Clearing token.'
        );
        token.accessToken = undefined;
        token.refreshToken = undefined;
      }

      return token;
    },
    async session({ session, token }) {
      // If `token.accessToken` is missing, force an "expired" session.
      // This ends up logging the user out on the client side.
      if (!token.accessToken) {
        return {
          ...session,
          user: undefined, // remove user info
          expires: new Date(0).toISOString() // an already-expired date
        };
      }

      // Otherwise, return the (valid) session with access and refresh tokens
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      return session;
    }
  }
} satisfies NextAuthConfig;

function simpleJwtDecode(token: string): Record<string, any> {
  const segments = token.split('.');
  if (segments.length < 2) {
    throw new Error('Invalid JWT structure');
  }
  try {
    const payloadBase64 = segments[1].replace(/-/g, '+').replace(/_/g, '/');
    const decodedString = atob(payloadBase64);
    return JSON.parse(decodedString);
  } catch (err) {
    throw new Error('Failed to decode token payload');
  }
}

export default authConfig;
