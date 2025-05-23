
'use client';

import { useEffect, useState } from 'react';

type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  quantity_available: number;
  unit: string;
  is_available: boolean;
};

export default function CartPage() {
  const [cartItems, setCartItems] = useState<Product[]>([]);

  useEffect(() => {
    // Preberi iz localStorage
    const stored = localStorage.getItem('cart');
    if (stored) {
      setCartItems(JSON.parse(stored));
    }
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">🛒 Košarica</h1>
      {cartItems.length === 0 ? (
        <p>Košarica je prazna.</p>
      ) : (
        <ul className="space-y-4">
          {cartItems.map((item, index) => (
            <li key={index} className="border p-4 rounded">
              <h2 className="font-semibold text-lg">{item.name}</h2>
              <p>Kategorija: {item.category}</p>
              <p>Cena: €{item.price}</p>
              <p>Količina: {item.quantity_available} {item.unit}</p>
              <p>Opis: {item.description}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
