"use client";

import { useEffect, useState } from "react";

interface Product {
  product_id: string;
  unit_price: number;
  max_quantity: number;
}

export default function GroupOrderDetailPage({ params }: { params: { id: string } }) {
  
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState("");

  const { id } = params;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`http://localhost:5000/public/group-orders/${id}/products`);
        if (!res.ok) throw new Error("Failed to load products");
        const data = await res.json();
        setProducts(data.products || []);
      } catch (err) {
        setError("Unable to load group order products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [id]);

  const handleChange = (productId: string, quantity: number) => {
    setSelectedItems((prev) => ({ ...prev, [productId]: quantity }));
  };

  const handleSubmit = async () => {
    const items = Object.entries(selectedItems)
      .filter(([_, qty]) => qty > 0)
      .map(([product_id, quantity]) => ({ product_id, quantity }));

    if (items.length === 0) {
      alert("Select at least one product.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/consumer/join-group-order", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group_order_id: id,
          items,
          notes,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        window.location.href = data.url;
      } else {
        alert(data.message || "Failed to join group order");
      }
    } catch (err) {
      alert("Error submitting group order");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Join Group Order</h1>

      {loading ? (
        <p>Loading products...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <div
              key={product.product_id}
              className="border p-4 rounded-md flex justify-between items-center"
            >
              <div>
                <p className="font-medium">Product {product.product_id}</p>
                <p className="text-sm text-gray-600">
                  Price: €{product.unit_price.toFixed(2)} — Max: {product.max_quantity}
                </p>
              </div>
              <input
                type="number"
                min={0}
                max={product.max_quantity}
                value={selectedItems[product.product_id] || ""}
                onChange={(e) => handleChange(product.product_id, parseInt(e.target.value))}
                className="w-24 px-2 py-1 border border-gray-300 rounded"
              />
            </div>
          ))}

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              placeholder="Any special instructions?"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="mt-6 bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
          >
            Join Group Order
          </button>
        </div>
      )}
    </div>
  );
}
