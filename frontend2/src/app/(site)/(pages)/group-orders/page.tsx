"use client";

import { useEffect, useState } from "react";

export default function GroupOrdersPage() {
  const [groupOrders, setGroupOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Optional emojis per card
  const icons = ["🌱", "🍞", "🍯", "🥕", "🧀", "🍇"];

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/public/group-orders`)
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
    <div className="max-w-6xl mx-auto px-4 py-10 mt-24">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        Available Group Orders
      </h1>

      {loading ? (
        <p>Loading...</p>
      ) : groupOrders.length === 0 ? (
        <p>No group orders available at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {groupOrders.map((order: any, index: number) => (
            <a
              href={`/group-orders/${order.id}`}
              key={order.id}
              className="rounded-xl shadow-md hover:shadow-lg transition-all transform hover:scale-105 bg-gradient-to-br from-emerald-50 to-blue-50 border border-gray-200 overflow-hidden"
            >
              {/* Top Badge */}
              <div className="flex justify-between items-start px-4 pt-4">
                <span className="px-3 py-1 text-xs bg-green-600 text-white rounded-full font-medium shadow">
                  Featured
                </span>
              </div>

              {/* Emoji Icon Center */}
              <div className="flex justify-center items-center text-5xl h-40">
                {icons[index % icons.length]}
              </div>

              {/* Content */}
              <div className="bg-white p-4 rounded-b-xl">
                <h2 className="font-semibold text-lg text-gray-800 mb-1">
                  {order.description || "Untitled Group Order"}
                </h2>
                <p className="text-sm text-gray-500">
                  Created:{" "}
                  {new Date(order.created_at).toLocaleDateString("en-GB")}
                </p>

                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    Open
                  </span>
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                    Free
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
