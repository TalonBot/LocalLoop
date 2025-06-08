import React from "react";
import ApplyForm from "@/components/Apply";

export const metadata = {
  title: "Apply as Provider | LocalLoop",
  description: "Submit your application to become a provider",
};

const ApplyPage = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 mt-24">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">
        Apply to Become a Provider
      </h1>
      <ApplyForm />
    </div>
  );
};

export default ApplyPage;
