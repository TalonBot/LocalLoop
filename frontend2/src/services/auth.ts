// services/auth.ts
export const checkAuth = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE}/auth/verify-session`,
      {
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Not authenticated");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};
