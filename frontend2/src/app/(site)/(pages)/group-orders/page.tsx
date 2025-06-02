"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function GroupOrdersPage() {
  const [groupOrders, setGroupOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/public/group-orders")
      .then((res) => res.json())
      .then((data) => {
        setGroupOrders(data.groupOrders);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch group orders", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Available Group Orders</h1>

      {loading ? (
        <p>Loading...</p>
      ) : groupOrders.length === 0 ? (
        <p>No group orders available at the moment.</p>
      ) : (
        <div className="space-y-4">
          {groupOrders.map((order: any) => (
            <a
              href={`/group-orders/${order.id}`}
              key={order.id}
              className="block border rounded-lg p-4 hover:bg-gray-50 transition"
            >
              <h2 className="font-semibold text-lg">
                {order.description || "Untitled Group Order"}
              </h2>
              <p className="text-sm text-gray-600">
                Created: {new Date(order.created_at).toLocaleString()}
              </p>
              <span className="inline-block mt-2 px-3 py-1 text-xs rounded-full bg-green-100 text-green-700">
                {order.status}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
