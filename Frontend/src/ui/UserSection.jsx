import styled from "styled-components";
import Button from "./Button";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useUser } from "../features/authentication/UserProvider";
import { logout } from "../services/postRequests";
import toast from "react-hot-toast";

const StyledUserSection = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
`;

function UserSection() {
  const navigate = useNavigate();
  const { userData, loading } = useUser();

  const logoutMutation = useMutation({
    mutationFn: logout, // Provide the function for mutation
    onSuccess: () => {
      toast.success("¡Saliste exitosamente!", {
        style: {
          border: "1px solid #FF8000",
          padding: "16px",
          //   color: "#FF8000",
        },
        iconTheme: {
          primary: "#FF8000",
          secondary: "#FFFAEE",
        },
      });
      navigate("/login");
    },
    onError: () => {
      toast.error("No se pudo completar la operación.");
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (loading) {
    return <p>Cargando...</p>;
  }

  return (
    <div>
      <StyledUserSection>
        <span>
          <p>Bienvenid@, {userData?.username}</p>
        </span>
        <Button
          size="small"
          variation="danger"
          onClick={handleLogout}
          disabled={logoutMutation.isLoading}
        >
          {logoutMutation.isLoading ? "Saliendo..." : "Cerrar sesión"}
        </Button>
      </StyledUserSection>
    </div>
  );
}

export default UserSection;
