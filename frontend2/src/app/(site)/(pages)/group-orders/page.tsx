"use client";

import { useEffect, useState } from "react";

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
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Available Group Orders</h1>

      {loading ? (
        <p>Loading...</p>
      ) : groupOrders.length === 0 ? (
        <p>No group orders available at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {groupOrders.map((order: any, index: number) => (
            <a
              href={`/group-orders/${order.id}`}
              key={order.id}
              className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition bg-white"
            >
              <h2 className="font-semibold text-xl mb-2 text-gray-800">
                {order.description || "Untitled Group Order"}
              </h2>
              <p className="text-sm text-gray-500 mb-1">
                Created: {new Date(order.created_at).toLocaleDateString()}
              </p>
              <span className="inline-block mt-2 px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 capitalize">
                {order.status}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
