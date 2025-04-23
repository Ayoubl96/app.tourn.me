'use client';

import { signOut } from 'next-auth/react';

export async function fetchWithLogout(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  // Check if this is a GET request to the "tournaments/create" endpoint
  // and filter it out if it's coming from page prefetching
  const url = input.toString();
  const isGetMethod = !init?.method || init.method === 'GET';
  const isCreateEndpoint = url.includes('/tournaments/create');

  if (isGetMethod && isCreateEndpoint) {
    // Return a mock successful response instead of actually making the request
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // For all other requests, proceed normally
  const res = await fetch(input, init);

  // If we get 401, it likely means the token is invalid or expired
  if (res.status === 401) {
    // Force a sign out to clear session and redirect
    signOut({
      callbackUrl: '/' // or wherever you want to redirect
    });
  }

  return res;
}
