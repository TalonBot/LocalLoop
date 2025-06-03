"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  loginStart,
  loginSuccess,
  loginFailure,
} from "@/redux/features/authSlice";
import Breadcrumb from "@/components/Common/Breadcrumb";

const Signin = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.authReducer.loading);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    dispatch(loginStart());

    try {
      const response = await fetch(`${process.env.API_BASE}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      dispatch(
        loginSuccess({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
        })
      );

      router.push("/");
    } catch (err: any) {
      dispatch(loginFailure(err.message));
      setError(err.message || "Login failed");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.API_BASE}/auth/google`;
  };

  return (
    <>
      <Breadcrumb title={"Signin"} pages={["Signin"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-11">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                Sign In to Your Account
              </h2>
              <p>Enter your details below</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label htmlFor="email" className="block mb-2.5">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none focus:ring-2 focus:ring-blue/20"
                  required
                />
              </div>

              <div className="mb-5">
                <label htmlFor="password" className="block mb-2.5">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none focus:ring-2 focus:ring-blue/20"
                  required
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
              )}

              <button
                type="submit"
                className="w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-lg hover:bg-blue mt-7.5"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in to account"}
              </button>

              <a
                href="#"
                className="block text-center text-dark-4 mt-4.5 hover:text-dark"
              >
                Forget your password?
              </a>

              <span className="relative z-1 block font-medium text-center mt-4.5">
                <span className="block absolute -z-1 left-0 top-1/2 h-px w-full bg-gray-3" />
                <span className="inline-block px-3 bg-white">Or</span>
              </span>

              <div className="flex flex-col gap-4.5 mt-4.5">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="flex items-center justify-center w-full gap-2 border border-gray-3 rounded-lg py-3 px-4 text-dark hover:border-blue"
                >
                  <svg className="h-5 w-5" viewBox="0 0 48 48">
                    <path
                      fill="#FFC107"
                      d="M43.611 20.083H42V20H24v8h11.303C33.96 32.412 29.418 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.058 0 5.843 1.156 7.961 3.039l5.657-5.657C33.237 6.1 28.791 4 24 4 12.954 4 4 12.954 4 24s8.954 20 20 20c11.046 0 20-8.954 20-20 0-1.341-.138-2.652-.389-3.917z"
                    />
                    <path
                      fill="#FF3D00"
                      d="M6.306 14.691l6.571 4.819C14.267 16.323 18.839 14 24 14c3.058 0 5.843 1.156 7.961 3.039l5.657-5.657C33.237 6.1 28.791 4 24 4c-7.724 0-14.47 4.37-18.694 10.691z"
                    />
                    <path
                      fill="#4CAF50"
                      d="M24 44c5.337 0 10.207-2.042 13.899-5.373l-6.396-5.424C29.626 34.17 26.915 35 24 35c-5.384 0-9.922-3.577-11.298-8.453l-6.53 5.034C9.473 39.21 16.227 44 24 44z"
                    />
                    <path
                      fill="#1976D2"
                      d="M43.611 20.083H42V20H24v8h11.303c-1.093 3.412-3.515 6.088-6.8 7.456l6.396 5.424C38.412 37.978 44 31.998 44 24c0-1.341-.138-2.652-.389-3.917z"
                    />
                  </svg>
                  Sign in with Google
                </button>
              </div>

              <p className="text-center mt-6">
                Don&apos;t have an account?
                <Link href="/signup" className="text-dark hover:text-blue pl-2">
                  Sign Up Now!
                </Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default Signin;
