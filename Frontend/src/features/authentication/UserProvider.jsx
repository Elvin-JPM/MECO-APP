import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUser } from "../../services/getRequests";

// Create the User Context
const UserContext = createContext();

// Create a custom hook to use the User Context
export const useUser = () => {
  return useContext(UserContext);
};

// Create a Provider Component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const {
    isLoading,
    isError,
    data: userData,
    refetch,
  } = useQuery({
    queryKey: ["loggedUser"],
    queryFn: getUser,
    onSuccess: (data) => {
      console.log("User data fetched successfully:", data);
      if (data) {
        setUser(data); // Only update if new data exists
      }
    },
    onError: (error) => {
      console.log("Error fetching user data:", error);
      // Don't set user to null immediately to prevent UI flickering
    },
    staleTime: 1000 * 60 * 0.5, // Re-fetch every 3 minutes
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    const handleTokenRefresh = async () => {
      console.log(
        "🔄 Token refreshed event received. Re-fetching user data..."
      );

      try {
        const userResponse = await refetch(); // Fetch new user data
        console.log("✅ New user data after token refresh:", userResponse);

        if (userResponse?.data) {
          setUser(userResponse.data); // Update state with new user data
        } else {
          console.warn("⚠️ No user data received after token refresh!");
        }
      } catch (err) {
        console.error("❌ Failed to fetch user data after token refresh:", err);
        // Only clear user state if explicitly unauthorized (401)
        if (err?.response?.status === 401) {
          console.warn("⚠️ Unauthorized, clearing user state.");
          setUser(null);
        }
      }
    };

    window.addEventListener("tokenRefreshed", handleTokenRefresh);

    return () => {
      window.removeEventListener("tokenRefreshed", handleTokenRefresh);
    };
  }, [refetch]);

  return (
    <UserContext.Provider
      value={{ userData, user, setUser, loading: isLoading, onError: isError }}
    >
      {children}
    </UserContext.Provider>
  );
};
