import React from "react";

interface BillingProps {
  form: {
    address: string;
    city: string;
    country: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Billing: React.FC<BillingProps> = ({ form, handleChange }) => {
  return (
    <div className="mt-9">
      <h2 className="font-medium text-dark text-xl sm:text-2xl mb-5.5">
        Billing Details
      </h2>

      <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5">
        {/* Address Field */}
        <div className="mb-5">
          <label htmlFor="address" className="block mb-2.5">
            Address <span className="text-red">*</span>
          </label>
          <input
            type="text"
            name="address"
            id="address"
            value={form.address}
            onChange={handleChange}
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
            required
          />
        </div>

        {/* City Field */}
        <div className="mb-5">
          <label htmlFor="city" className="block mb-2.5">
            City <span className="text-red">*</span>
          </label>
          <input
            type="text"
            name="city"
            id="city"
            value={form.city}
            onChange={handleChange}
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
            required
          />
        </div>

        {/* Country Field */}
        <div className="mb-5">
          <label htmlFor="region" className="block mb-2.5">
            Country <span className="text-red">*</span>
          </label>
          <input
            type="text"
            name="country"
            id="country"
            value={form.country}
            onChange={handleChange}
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
            required
          />
        </div>
      </div>
    </div>
  );
};

export default Billing;
