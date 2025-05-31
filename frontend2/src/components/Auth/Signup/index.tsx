"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Signup = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    re_password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLocalSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (formData.password !== formData.re_password) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formData.full_name,
          email: formData.email,
          password: formData.password,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Signup failed");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const googleOAuthUrl = "http://localhost:5000/auth/google";

  return (
    <>
      <Breadcrumb title={"Signup"} pages={["Signup"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-11">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                Create an Account
              </h2>
              <p>Enter your detail below</p>
            </div>

            <div className="flex flex-col gap-4.5 mb-6">
              <a
                href={googleOAuthUrl}
                className="flex justify-center items-center gap-3.5 rounded-lg border border-gray-3 bg-gray-1 p-3 ease-out duration-200 hover:bg-gray-2"
              >
                {/* Google SVG Icon */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19.777 10.226c0-.703-.063-1.238-.198-1.78H10v3.348h5.444a4.66 4.66 0 0 1-2.02 3.058v2.54h3.263c1.907-1.757 3-4.347 3-7.166Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M10 20c2.7 0 4.967-.89 6.623-2.416l-3.263-2.54c-.906.61-2.065 1.033-3.36 1.033a5.8 5.8 0 0 1-5.49-3.93H1.882v2.468A10 10 0 0 0 10 20Z"
                    fill="#34A853"
                  />
                  <path
                    d="M4.51 11.147a5.985 5.985 0 0 1 0-3.29v-2.467H1.882a10 10 0 0 0 0 8.224l2.628-2.467Z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M10 7.884c1.467 0 2.762.505 3.796 1.5l2.844-2.844A9.93 9.93 0 0 0 10 3.994a9.982 9.982 0 0 0-8.118 4.62l2.628 2.467a5.85 5.85 0 0 1 5.49-3.197Z"
                    fill="#EA4335"
                  />
                </svg>
                Sign Up with Google
              </a>
            </div>

            <span className="relative z-1 block font-medium text-center mt-4.5 mb-5">
              <span className="block absolute -z-1 left-0 top-1/2 h-px w-full bg-gray-3"></span>
              <span className="inline-block px-3 bg-white">Or</span>
            </span>

            {success ? (
              <div className="p-6 bg-green-100 border border-green-400 text-green-700 rounded-lg text-center">
                Registration successful! Please check your email to verify your
                account.
              </div>
            ) : (
              <form onSubmit={handleLocalSignup}>
                <div className="mb-5">
                  <label htmlFor="full_name" className="block mb-2.5">
                    Full Name <span className="text-red">*</span>
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />
                </div>

                <div className="mb-5">
                  <label htmlFor="email" className="block mb-2.5">
                    Email Address <span className="text-red">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    required
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />
                </div>

                <div className="mb-5">
                  <label htmlFor="password" className="block mb-2.5">
                    Password <span className="text-red">*</span>
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    autoComplete="on"
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />
                </div>

                <div className="mb-5.5">
                  <label htmlFor="re_password" className="block mb-2.5">
                    Re-type Password <span className="text-red">*</span>
                  </label>
                  <input
                    type="password"
                    id="re_password"
                    name="re_password"
                    value={formData.re_password}
                    onChange={handleChange}
                    placeholder="Re-type your password"
                    required
                    autoComplete="on"
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />
                </div>

                {error && (
                  <p className="text-red-500 mb-4 text-center font-semibold">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue mt-7.5 disabled:opacity-50"
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              </form>
            )}

            <p className="text-center mt-6">
              Already have an account?
              <Link
                href="/signin"
                className="text-dark ease-out duration-200 hover:text-blue pl-2"
              >
                Sign in Now
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Signup;
