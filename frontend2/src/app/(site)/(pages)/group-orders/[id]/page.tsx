"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Product {
  product_id: string;
  unit_price: number;
  max_quantity: number;
  name: string;
  image_url: string | null;
}

interface CartItem {
  product_id: string;
  quantity: number;
  unit_price: number;
  group_order_id: string;
}

export default function GroupOrderDetailPage() {
  const params = useParams();
  const groupOrderId = params?.id as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/public/group-orders/${groupOrderId}/products`
        );
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
  }, [groupOrderId]);

  const toggleSelect = (productId: string) => {
    setSelectedItems((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    setQuantities((prev) => ({ ...prev, [productId]: quantity }));
  };

  const handleAddToCart = () => {
    const cartItems: CartItem[] = [];

    for (const product of products) {
      const selected = selectedItems[product.product_id];
      const quantity = quantities[product.product_id];

      if (selected && quantity > 0 && quantity <= product.max_quantity) {
        cartItems.push({
          product_id: product.product_id,
          quantity,
          unit_price: product.unit_price,
          group_order_id: groupOrderId,
        });
      }
    }

    if (cartItems.length === 0) {
      alert("Please select at least one product with valid quantity.");
      return;
    }

    const existing = JSON.parse(localStorage.getItem("cart") || "[]");
    const updated = [...existing, ...cartItems];
    localStorage.setItem("cart", JSON.stringify(updated));

    alert("Items added to cart!");
    window.location.href = "/cart";
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 mt-24">
      <h1 className="text-2xl font-bold mb-6">Join Group Order</h1>

      {loading ? (
        <p>Loading products...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <div className="space-y-4">
            {products.map((product) => (
              <div
                key={product.product_id}
                className="border p-4 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-16 h-16 rounded object-cover"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-gray-600">
                      Price: €{product.unit_price.toFixed(2)} — Max: {product.max_quantity}
                    </p>
                    <label className="flex items-center gap-2 mt-1">
                      <input
                        type="checkbox"
                        checked={selectedItems[product.product_id] || false}
                        onChange={() => toggleSelect(product.product_id)}
                      />
                      Select
                    </label>
                  </div>
                </div>
                <input
                  type="number"
                  min={0}
                  max={product.max_quantity}
                  value={quantities[product.product_id] || ""}
                  onChange={(e) =>
                    handleQuantityChange(
                      product.product_id,
                      parseInt(e.target.value)
                    )
                  }
                  className="w-24 px-2 py-1 border border-gray-300 rounded"
                  placeholder="Qty"
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleAddToCart}
            className="mt-6 bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
          >
            Add Selected to Cart
          </button>
        </>
      )}
    </div>
  );
}
