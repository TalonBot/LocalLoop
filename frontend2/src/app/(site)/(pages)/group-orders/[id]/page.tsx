"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { addGroupOrderItem } from "@/redux/features/cart-slice";

interface ProductImage {
  image_url: string;
}

interface ProductData {
  id: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  product_images: ProductImage[];
}

interface GroupOrderProduct {
  unit_price: number;
  max_quantity: number;
  product: ProductData;
}

export default function GroupOrderDetailPage() {
  const params = useParams();
  const groupOrderId = params?.id as string;

  const [products, setProducts] = useState<GroupOrderProduct[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/public/group-orders/${groupOrderId}/products`
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

    if (groupOrderId) {
      fetchProducts();
    }
  }, [groupOrderId]);

  const handleQuantityChange = (productId: string, quantity: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(0, quantity),
    }));
  };

  const handleAddSingleItem = (
    product: ProductData,
    unit_price: number,
    max_quantity: number
  ) => {
    const quantity = quantities[product.id] || 0;

    if (quantity <= 0 || quantity > max_quantity) {
      alert(`Please enter a valid quantity between 1 and ${max_quantity}.`);
      return;
    }

    dispatch(
      addGroupOrderItem({
        id: product.id,
        title: product.name,
        price: unit_price,
        discountedPrice: unit_price,
        quantity,
        imgs: product.product_images.length
          ? {
              thumbnails: [product.product_images[0].image_url],
              previews: [product.product_images[0].image_url],
            }
          : undefined,
        groupOrderId, // This is now passed as part of the payload
      })
    );

    setSuccessMessage(`${product.name} added to cart!`);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  if (!groupOrderId) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 mt-24">
        <p className="text-red-500">Invalid group order ID</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 mt-24">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        Join Group Order
      </h1>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading products...</p>
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : products.length === 0 ? (
        <p>No products available in this group order.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((item) => {
            const product = item.product;
            const productId = product.id;
            const image = product.product_images?.[0]?.image_url;

            return (
              <div
                key={productId}
                className="rounded-xl shadow-md bg-white border border-gray-200 overflow-hidden flex flex-col"
              >
                {image ? (
                  <img
                    src={image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
                    No Image
                  </div>
                )}

                <div className="p-4 flex flex-col justify-between flex-1">
                  <div className="flex-1">
                    <h2 className="font-semibold text-lg text-gray-800 mb-1">
                      {product.name}
                    </h2>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-3">
                      {product.description}
                    </p>
                    <p className="text-sm text-gray-500 mb-1">
                      Category: {product.category} | Unit: {product.unit}
                    </p>
                    <p className="text-sm text-gray-600">
                      Price: €{item.unit_price.toFixed(2)} — Max:{" "}
                      {item.max_quantity}
                    </p>
                  </div>

                  <div className="mt-4 space-y-2">
                    <input
                      type="number"
                      min={1}
                      max={item.max_quantity}
                      value={quantities[productId] || ""}
                      onChange={(e) =>
                        handleQuantityChange(
                          productId,
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      placeholder="Enter quantity"
                    />

                    <button
                      onClick={() =>
                        handleAddSingleItem(
                          product,
                          item.unit_price,
                          item.max_quantity
                        )
                      }
                      className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
