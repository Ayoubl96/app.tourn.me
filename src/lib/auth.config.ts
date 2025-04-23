import { NextAuthConfig } from 'next-auth';
import CredentialProvider from 'next-auth/providers/credentials';
import GithubProvider from 'next-auth/providers/github';
import type { JwtPayload } from 'jwt-decode';
import { login, getProfileServer } from '@/api/auth';
import { AuthenticatedUser } from '@/api/auth';

// Extend the Session type to include the accessToken property and additional user details
declare module 'next-auth' {
  interface Session {
    accessToken: string;
    user: {
      id: string;
      name: string;
      login: string;
      address: string;
      email: string;
      phone_number: string;
      created_at: string;
    };
  }
}

const authConfig = {
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
              address: userData.address,
              email: userData.email,
              phone_number: userData.phone_number,
              created_at: userData.created_at
            } as AuthenticatedUser;
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
  pages: {
    signIn: '/', // Sign-in page
    signOut: '/auth/signout', // Optional: Sign-out page
    error: '/auth/error', // Error page
    verifyRequest: '/auth/verify-request', // Verification page
    newUser: '/dashboard' // Redirect new users to the dashboard
  },
  callbacks: {
    async jwt({ token, user }) {
      // 1) On initial sign in:
      if (user && (user as any).token) {
        const accessToken = (user as any).token;
        try {
          // Decode the JWT to find `exp`
          const decoded = simpleJwtDecode(accessToken) as JwtPayload;
          token.expiresAt = decoded.exp ? decoded.exp * 1000 : 0;
        } catch (err) {
          console.error('Could not decode token', err);
          token.expiresAt = 0;
        }
        token.accessToken = accessToken;
      }

      // 2) On subsequent requests, if the token is expired, clear it.
      if (
        typeof token.expiresAt === 'number' &&
        Date.now() >= token.expiresAt
      ) {
        console.log('Token has expired. Clearing token.');
        token.accessToken = undefined;
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

      // Otherwise, return the (valid) session
      session.accessToken = token.accessToken as string;
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
