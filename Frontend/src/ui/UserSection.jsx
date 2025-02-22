import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useUser } from "../features/authentication/UserProvider";
import { logout } from "../services/postRequests";
import toast from "react-hot-toast";
import Spinner from "./Spinner";
import DarkModeToggle from "./DarkModeToggle";
import IconButton from "./IconButton";
import { FiLogOut } from "react-icons/fi";
import { useState } from "react";
import IconContainer from "./IconContainer";
import Tooltip from "./Tooltip";
import { useDarkMode } from "../context/DarkModeContext";

const StyledUserSection = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;

  @media (max-width: 1200px) {
    font-size: 1.3rem;
  }
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

function UserSection() {
  const navigate = useNavigate();
  const { userData, loading } = useUser();
  const [tooltipVisible, setTooltipVisible] = useState(null);
  const [timeoutId, setTimeoutId] = useState(null);
  const { isDarkMode } = useDarkMode();

  const logoutMutation = useMutation({
    mutationFn: logout, // Provide the function for mutation
    onSuccess: () => {
      toast.success("¡Saliste!", {
        style: {
          border: "1px solid #FF8000",
          padding: "16px",
        },
        iconTheme: {
          primary: "#FF8000",
          secondary: "#FFFAEE",
        },
      });

      navigate("/login", { replace: true });
      setTimeout(() => {
        window.location.replace("/login");
      }, 100);
    },

    onError: () => {
      toast.error("No se pudo completar la operación.");
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (loading) {
    return (
      <p>
        <Spinner />
      </p>
    );
  }

  const handleMouseEnter = (index) => {
    // Clear any existing timeout
    if (timeoutId) clearTimeout(timeoutId);

    // Set a new timeout to show the tooltip after 500ms
    const id = setTimeout(() => {
      setTooltipVisible(index);
    }, 150);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    // Clear the timeout and hide the tooltip
    if (timeoutId) clearTimeout(timeoutId);
    setTooltipVisible(null);
  };

  const handleFocus = (index) => {
    // Show the tooltip immediately on focus
    setTooltipVisible(index);
  };

  const handleBlur = () => {
    // Hide the tooltip on blur
    setTooltipVisible(null);
  };

  return (
    <div>
      <StyledUserSection>
        <span>
          <p>Bienvenid@, {userData?.username}</p>
        </span>
        <IconContainer
          onMouseEnter={() => handleMouseEnter(1)}
          onMouseLeave={handleMouseLeave}
          onFocus={() => handleFocus(1)}
          onBlur={handleBlur}
        >
          <DarkModeToggle />

          <Tooltip
            id={`tooltip-${1}`}
            className="tooltip"
            position="bottom"
            bgColor={`linear-gradient(to bottom, #EB3349, #F45C43)`}
            fontSize="12px"
            padding="8px 12px"
            isVisible={tooltipVisible === 1}
            role="tooltip"
            aria-hidden={tooltipVisible !== 1}
          >
            {isDarkMode ? "Modo claro" : "Modo oscuro"}
          </Tooltip>
        </IconContainer>
        <IconContainer
          onMouseEnter={() => handleMouseEnter(2)}
          onMouseLeave={handleMouseLeave}
          onFocus={() => handleFocus(2)}
          onBlur={handleBlur}
        >
          <IconButton
            size="small"
            onClick={handleLogout}
            disabled={logoutMutation.isLoading}
          >
            {logoutMutation.isLoading ? toast("Saliendo...") : <FiLogOut />}
          </IconButton>
          <Tooltip
            id={`tooltip-${2}`}
            className="tooltip"
            position="bottom"
            bgColor="linear-gradient(to bottom, #EB3349, #F45C43)"
            fontSize="12px"
            padding="8px 12px"
            isVisible={tooltipVisible === 2}
            role="tooltip"
            aria-hidden={tooltipVisible !== 2}
          >
            Cerrar sesion
          </Tooltip>
        </IconContainer>
      </StyledUserSection>
    </div>
  );
}

export default UserSection;
