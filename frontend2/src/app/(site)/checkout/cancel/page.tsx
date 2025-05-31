"use client";
import React from "react";

const Fail: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 px-4 mt-10">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <svg
          className="mx-auto mb-6 h-16 w-16 text-red-600"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
        <h1 className="text-3xl font-bold text-red-700 mb-4">
          Oops! Something went wrong.
        </h1>
        <p className="text-gray-700 mb-6">
          We could not process your order at this time.
        </p>
        <p className="text-gray-600 mb-2">
          Please try again later or contact support if the problem persists.
        </p>
        <button
          onClick={() => (window.location.href = "/")}
          className="mt-8 inline-block bg-red-600 text-white font-semibold px-6 py-3 rounded-md hover:bg-red-700 transition"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default Fail;
