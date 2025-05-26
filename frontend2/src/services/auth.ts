// services/auth.ts
export const checkAuth = async () => {
  try {
    const response = await fetch("http://localhost:5000/auth/verify-session", {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Not authenticated");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};
