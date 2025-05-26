import React from "react";

const Coupon = ({
  couponCode,
  setCouponCode,
  handleApplyCoupon,
  coupon,
  couponError,
  isApplying,
}) => {
  return (
    <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
      <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
        <h3 className="font-medium text-xl text-dark">Have any Coupon Code?</h3>
      </div>

      <div className="py-8 px-4 sm:px-8.5">
        <div className="flex gap-4">
          <input
            type="text"
            name="coupon"
            id="coupon"
            placeholder="Enter coupon code"
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            disabled={isApplying}
          />

          <button
            type="button"
            className="inline-flex font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark"
            disabled={isApplying}
            onClick={handleApplyCoupon}
          >
            {isApplying ? "Applying..." : "Apply"}
          </button>
        </div>
        {couponError && (
          <div className="text-red-500 text-sm mt-2">{couponError}</div>
        )}
        {coupon && (
          <div className="text-green-600 text-sm mt-2">
            Coupon &quot;{coupon.code}&quot; applied: -{coupon.discount_percent}
            %!
          </div>
        )}
      </div>
    </div>
  );
};

export default Coupon;
