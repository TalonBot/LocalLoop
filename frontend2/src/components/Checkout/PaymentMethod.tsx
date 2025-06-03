import React, { useState } from "react";
import Image from "next/image";

const PaymentMethod = ({ payment, setPayment }) => {
  return (
    <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
      <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
        <h3 className="font-medium text-xl text-dark">Payment Method</h3>
      </div>

      <div className="p-4 sm:p-8.5">
        <div className="flex flex-col gap-3">
          <label className="flex cursor-pointer select-none items-center gap-4">
            <input
              type="radio"
              name="payment"
              value="cash"
              checked={payment === "cash"}
              onChange={() => setPayment("cash")}
              className="accent-blue"
            />
            <span className="flex items-center gap-2">
              <Image
                src="/images/checkout/cash.svg"
                alt="cash"
                width={21}
                height={21}
              />
              Cash on delivery
            </span>
          </label>
          <label className="flex cursor-pointer select-none items-center gap-4">
            <input
              type="radio"
              name="payment"
              value="stripe"
              checked={payment === "stripe"}
              onChange={() => setPayment("stripe")}
              className="accent-blue"
            />
            <span className="flex items-center gap-2">
              <Image
                src="/images/stripe.jpg"
                alt="stripe"
                width={60}
                height={20}
              />
              Pay with Stripe
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethod;
