// lib/api.ts
export async function loginTestUser() {
  const res = await fetch('http://localhost:5000/auth/login', {
    method: 'POST',
    credentials: 'include', // ✅ critical: stores the session cookie
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'producer@example.com',
      password: 'test12345',
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Login failed');
  }

  return data;
}
