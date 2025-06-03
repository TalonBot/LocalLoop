import React, { useState } from "react";

interface DiscountProps {
  disabled?: boolean;
}

const Discount = ({ disabled = false }: DiscountProps) => {
  const [couponInput, setCouponInput] = useState("");

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponInput) {
      localStorage.setItem("cartCoupon", couponInput);
      alert("Coupon saved! It will be applied at checkout.");
    }
  };

  if (disabled) {
    return (
      <div className="lg:max-w-[670px] w-full">
        <div className="bg-white shadow-1 rounded-[10px]">
          <div className="border-b border-gray-3 py-5 px-4 sm:px-5.5">
            <h3>Discounts not available for group orders</h3>
          </div>
          <div className="py-8 px-4 sm:px-8.5 text-gray-500">
            Coupons cannot be applied to group order items.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:max-w-[670px] w-full">
      <form onSubmit={handleApply}>
        <div className="bg-white shadow-1 rounded-[10px]">
          <div className="border-b border-gray-3 py-5 px-4 sm:px-5.5">
            <h3>Have any discount code?</h3>
          </div>

          <div className="py-8 px-4 sm:px-8.5">
            <div className="flex flex-wrap gap-4 xl:gap-5.5">
              <div className="max-w-[426px] w-full">
                <input
                  type="text"
                  name="coupon"
                  id="coupon"
                  placeholder="Enter coupon code"
                  className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="inline-flex font-medium text-white bg-blue py-3 px-8 rounded-md ease-out duration-200 hover:bg-blue-dark"
              >
                Apply Code
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Discount;
