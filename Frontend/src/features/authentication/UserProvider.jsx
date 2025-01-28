import React, { createContext, useContext, useState } from "react";
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

  const { isLoading, data: userData } = useQuery({
    queryKey: ["loggedUser"],
    queryFn: getUser,
    onSuccess: (data) => {
      setUser(data); // Update user state when data is successfully fetched
    },
    onError: () => {
      setUser(null); // Handle error (e.g., user not logged in)
    },
  });

  console.log("User received at context: ", userData);

  return (
    <UserContext.Provider
      value={{ userData, user, setUser, loading: isLoading }}
    >
      {children}
    </UserContext.Provider>
  );
};
