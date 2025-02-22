import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "./UserProvider";
import Spinner from "../../ui/Spinner";
import Heading from "../../ui/Heading";
import styled from "styled-components";
import Background from "../../ui/Background";
import Ribbon from "../../ui/Ribbon";

const VerifyingWindow = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export const RequireAuth = ({ children }) => {
  const location = useLocation();
  const { userData, user, loading, onError } = useUser();

  // While loading, show nothing or a spinner
  if (loading) {
    return (
      <VerifyingWindow>
        <Ribbon />
        <Background />
        <Heading>Verificando</Heading>
        <Spinner size="large" />
      </VerifyingWindow>
    );
  }

  // If user exists, render the protected children
  if (userData) {
    return children;
  }
  console.log("requireAuth: ", userData);

  // Otherwise, redirect to login
  return <Navigate to="/login" state={{ from: location }} />;
};
