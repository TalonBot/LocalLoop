"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [status, setStatus] = useState<
    "loading" | "success" | "error" | "invalid"
  >("loading");

  useEffect(() => {
    if (!token || !email) {
      setStatus("invalid");
      return;
    }

    const verifyEmail = async () => {
      try {
        await axios.post("http://localhost:5000/auth/verify-email", {
          token,
          email,
        });
        setStatus("success");
      } catch (error) {
        console.error(error);
        setStatus("error");
      }
    };

    verifyEmail();
  }, [token, email]);

  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <p className="text-gray-600">Verifying your email, please wait...</p>
        );
      case "success":
        return (
          <>
            <h1 className="text-2xl font-bold text-green-600 mb-2">
              Email Verified!
            </h1>
            <p className="text-gray-700">You can now log in to your account.</p>
          </>
        );
      case "error":
        return (
          <>
            <h1 className="text-2xl font-bold text-red-600 mb-2">
              Verification Failed
            </h1>
            <p className="text-gray-700">
              The link may have expired or is invalid.
            </p>
          </>
        );
      case "invalid":
        return (
          <>
            <h1 className="text-2xl font-bold text-red-600 mb-2">
              Invalid Link
            </h1>
            <p className="text-gray-700">Missing email or token in the URL.</p>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full text-center">
        {renderContent()}
      </div>
    </div>
  );
}
