'use client';
import React, { useState } from 'react';
import { loginTestUser } from '@/lib/api'; // adjust path as needed

export default function DashboardPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = async () => {
    try {
      const result = await loginTestUser();
      console.log('Logged in:', result);
      setIsLoggedIn(true);
      alert('Login successful!');
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Check console for details.');
    }
  };

  const handleCreate = () => {
    console.log('Create button clicked');
  };

  const handleUpdate = (id: string) => {
    console.log(`Update button clicked for product ${id}`);
  };

  const handleDelete = (id: string) => {
    console.log(`Delete button clicked for product ${id}`);
  };

  const mockProducts = [
    {
      id: '1',
      name: 'Watermelon',
      description: 'gloče',
      category: 'Honey',
      price: 7.5,
      quantity_available: 7,
      unit: 'jar',
      is_available: false,
    },
  ];

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Your Product Dashboard</h1>

      <div className="flex gap-4">
        <button
          onClick={handleLogin}
          className="px-4 py-2 border rounded hover:bg-green-100"
        >
          🔐 Quick Login as Producer
        </button>
        <button
          onClick={handleCreate}
          className="px-4 py-2 border rounded hover:bg-gray-100"
        >
          ➕ Add New Product
        </button>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Your Products</h2>
        {mockProducts.length === 0 ? (
          <p>No products yet.</p>
        ) : (
          <table className="w-full text-left border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Category</th>
                <th className="p-2 border">Price (€)</th>
                <th className="p-2 border">Quantity</th>
                <th className="p-2 border">Available</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockProducts.map((product) => (
                <tr key={product.id}>
                  <td className="p-2 border">{product.name}</td>
                  <td className="p-2 border">{product.category}</td>
                  <td className="p-2 border">{product.price}</td>
                  <td className="p-2 border">{product.quantity_available}</td>
                  <td className="p-2 border">
                    {product.is_available ? 'Yes' : 'No'}
                  </td>
                  <td className="p-2 border space-x-2">
                    <button
                      onClick={() => handleUpdate(product.id)}
                      className="px-2 py-1 border rounded text-blue-600 hover:bg-blue-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="px-2 py-1 border rounded text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
