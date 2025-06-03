"use client";
import { useEffect } from "react";
import { useAppDispatch } from "@/redux/store";
import { loginSuccess, logout } from "@/redux/features/authSlice";

export default function AuthHydrator() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Adjust the endpoint to your backend session check
    fetch(`${process.env.API_BASE}/auth/verify-session`, {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.session?.userId) {
          // Map backend session fields to your Redux user shape
          dispatch(
            loginSuccess({
              id: data.session.userId,
              name: data.session.name,
              email: data.session.email,
              role: data.session.role,
            })
          );
        } else {
          dispatch(logout());
        }
      })
      .catch(() => dispatch(logout()));
  }, [dispatch]);

  return null;
}
