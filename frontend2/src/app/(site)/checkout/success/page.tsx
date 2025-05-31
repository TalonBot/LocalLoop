"use client";

import React from "react";

const Success: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 px-4 mt-10">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <svg
          className="mx-auto mb-6 h-16 w-16 text-green-600"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
        <h1 className="text-3xl font-bold text-green-700 mb-4">Success!</h1>
        <p className="text-gray-700 mb-6">
          Your order has been successfully placed.
        </p>
        <p className="text-gray-600 mb-2">
          Please check your email for confirmation and details.
        </p>
        <p className="text-gray-600 italic text-sm">
          Do not forget to check your spam or promotions folder just in case.
        </p>
        <button
          onClick={() => (window.location.href = "/")}
          className="mt-8 inline-block bg-green-600 text-white font-semibold px-6 py-3 rounded-md hover:bg-green-700 transition"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default Success;
