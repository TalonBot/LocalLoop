"use client";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Breadcrumb from "../Common/Breadcrumb";
import Login from "./Login";
import PaymentMethod from "./PaymentMethod";
import Coupon from "./Coupon";
import Billing from "./Billing";
import { selectCartItems, selectTotalPrice } from "@/redux/features/cart-slice";
import { RootState, useAppSelector } from "@/redux/store";

const Checkout = () => {
  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectTotalPrice);
  const groupOrderId = useSelector(
    (state: RootState) => state.cartReducer.groupOrderId
  );
  const isGroupOrder = !!groupOrderId; // This will be true if groupOrderId exists

  const user = useAppSelector((state) => state.authReducer?.user);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [notes, setNotes] = useState("");

  const [billingForm, setBillingForm] = useState({
    address: "",
    city: "",
    country: "",
  });

  const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBillingForm({ ...billingForm, [e.target.name]: e.target.value });
  };

  const handleApplyCoupon = async () => {
    setCouponError("");
    setCoupon(null);
    setIsApplying(true);
    if (!couponCode) {
      setIsApplying(false);
      return;
    }
    try {
      const res = await fetch(
        `${process.env.API_BASE}/users/validate/${couponCode}`
      );
      if (!res.ok) throw new Error("Invalid coupon");
      const data = await res.json();
      setCoupon(data);
    } catch (err) {
      setCouponError("Invalid or expired coupon.");
    }
    setIsApplying(false);
  };

  useEffect(() => {
    // Prefill coupon code from localStorage if present
    const savedCoupon =
      typeof window !== "undefined" ? localStorage.getItem("cartCoupon") : "";
    if (savedCoupon) setCouponCode(savedCoupon);
  }, []);

  // Shipping
  const [shippingMethod, setShippingMethod] = useState<"pickup" | "delivery">(
    "delivery"
  );
  const shippingFee = shippingMethod === "delivery" ? 15 : 0;

  // Discount calculation
  const discount = coupon ? (cartTotal * coupon.discount_percent) / 100 : 0;
  const totalWithDiscount = cartTotal - discount + shippingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError("");

    if (!user) {
      setCheckoutError("You must be logged in to checkout.");
      return;
    }

    if (shippingMethod === "delivery") {
      // Note: You have a typo here ("delivery" vs "delivery")
      if (!billingForm.address || !billingForm.city || !billingForm.country) {
        setCheckoutError("Please fill out all delivery address fields.");
        return;
      }
    }

    try {
      const endpoint = isGroupOrder
        ? `${process.env.API_BASE}/consumer/join-group-order`
        : `${process.env.API_BASE}/create-checkout-session`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          group_order_id: isGroupOrder ? groupOrderId : undefined,
          items: cartItems.map((item) => ({
            product_id: item.id,
            quantity: item.quantity,
            product_name: item.title,
          })),
          pickup_or_delivery: shippingMethod,
          coupon_code: couponCode || null,
          notes,
          delivery_details:
            shippingMethod === "delivery"
              ? {
                  address: billingForm.address,
                  city: billingForm.city,
                  country: billingForm.country,
                  notes,
                }
              : null,
        }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        setCheckoutError(data.message || "Failed to start payment session.");
      }
    } catch {
      setCheckoutError("Failed to start payment session.");
    }
  };

  return (
    <>
      <Breadcrumb title={"Checkout"} pages={["checkout"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11">
              {/* <!-- checkout left --> */}
              <div className="lg:max-w-[670px] w-full">
                {/* Conditionally render Login if user is not logged in */}
                {!user && <Login />}

                {/* Conditionally render Billing and Notes sections */}
                {shippingMethod === "delivery" && (
                  <>
                    <Billing
                      form={billingForm}
                      handleChange={handleBillingChange}
                    />

                    <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5 mt-7.5">
                      <div>
                        <label htmlFor="notes" className="block mb-2.5">
                          Other Notes (optional)
                        </label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          name="notes"
                          rows={5}
                          placeholder="Notes about your order, e.g. special notes for delivery."
                          className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full p-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                        ></textarea>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* <!-- checkout right --> */}
              <div className="max-w-[455px] w-full">
                {/* <!-- order list box --> */}
                <div className="bg-white shadow-1 rounded-[10px]">
                  <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
                    <h3 className="font-medium text-xl text-dark">
                      Your Order
                    </h3>
                  </div>

                  <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
                    {/* <!-- title --> */}
                    <div className="flex items-center justify-between py-5 border-b border-gray-3">
                      <div>
                        <h4 className="font-medium text-dark">Product</h4>
                      </div>
                      <div>
                        <h4 className="font-medium text-dark text-right">
                          Subtotal
                        </h4>
                      </div>
                    </div>

                    {/* <!-- dynamic product items --> */}
                    {cartItems.length === 0 ? (
                      <div className="py-5 text-center text-gray-400">
                        Your cart is empty.
                      </div>
                    ) : (
                      cartItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between py-5 border-b border-gray-3"
                        >
                          <div>
                            <p className="text-dark">
                              {item.title}{" "}
                              <span className="text-gray-400">
                                x{item.quantity}
                              </span>
                            </p>
                          </div>
                          <div>
                            <p className="text-dark text-right">
                              $
                              {(item.discountedPrice * item.quantity).toFixed(
                                2
                              )}
                            </p>
                          </div>
                        </div>
                      ))
                    )}

                    {/* <!-- shipping method selector --> */}
                    <div className="flex flex-col gap-2 py-5 border-b border-gray-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="shippingMethod"
                          value="delivery"
                          checked={shippingMethod === "delivery"}
                          onChange={() => setShippingMethod("delivery")}
                        />
                        Delivery (+$15)
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="shippingMethod"
                          value="pickup"
                          checked={shippingMethod === "pickup"}
                          onChange={() => setShippingMethod("pickup")}
                        />
                        Personal Pickup (Free)
                      </label>
                    </div>

                    {/* <!-- shipping fee --> */}
                    <div className="flex items-center justify-between py-5 border-b border-gray-3">
                      <div>
                        <p className="text-dark">Shipping Fee</p>
                      </div>
                      <div>
                        <p className="text-dark text-right">
                          ${shippingFee.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* <!-- coupon discount --> */}
                    {coupon && (
                      <div className="flex items-center justify-between py-2">
                        <span className="text-dark">Coupon Discount</span>
                        <span className="text-dark text-right">
                          - ${discount.toFixed(2)}
                        </span>
                      </div>
                    )}

                    {/* <!-- total --> */}
                    <div className="flex items-center justify-between pt-5">
                      <div>
                        <p className="font-medium text-lg text-dark">Total</p>
                      </div>
                      <div>
                        <p className="font-medium text-lg text-dark text-right">
                          ${totalWithDiscount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Coupon
                  couponCode={couponCode}
                  setCouponCode={setCouponCode}
                  handleApplyCoupon={handleApplyCoupon}
                  coupon={coupon}
                  couponError={couponError}
                  isApplying={isApplying}
                  disabled={isGroupOrder}
                />

                <button
                  type="submit"
                  className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5"
                >
                  Process to Checkout
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default Checkout;
