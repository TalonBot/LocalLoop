// src/lib/api.ts

export async function loginTestUser() {
  const res = await fetch('http://localhost:5000/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'producer@example.com',
      password: 'test12345',
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');
  return data;
}

export async function getMyProducts() {
  const res = await fetch('http://localhost:5000/product', {
    method: 'GET',
    credentials: 'include',
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch products');
  return data;
}

export async function createProduct(product: {
  name: string;
  description: string;
  category: string;
  price: number;
  quantity_available: number;
  unit: string;
  is_available: boolean;
}) {
const res = await fetch('http://localhost:5000/product/new', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(product),
  });

  const data = await res.json();
  console.log('💥 Error response:', data); // 🔍 Add this

  if (!res.ok) throw new Error(data.message || 'Product creation failed');
  return data;
}