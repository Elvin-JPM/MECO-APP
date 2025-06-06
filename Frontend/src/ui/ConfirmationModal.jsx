import styled, { createGlobalStyle } from "styled-components";
import { useEffect } from "react";
import PropTypes from "prop-types";

// Global style that properly locks scrolling without jumping
const ScrollLock = createGlobalStyle`
  html {
    overflow: hidden;
    height: 100%;
  }
  body {
    overflow: hidden;
    height: 100%;
    position: relative;
  }
`;

const FullScreenOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 9999; // Extremely high to ensure it's on top of everything
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ConfirmationBox = styled.div`
  background-color: var(--color-grey-0);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-lg);
  padding: 3.2rem 4rem;
  width: 40rem;
  max-width: 90vw;
  position: relative;
  z-index: 10000; // Even higher than overlay
`;

const ConfirmationText = styled.p`
  font-size: 1.6rem;
  color: var(--color-grey-700);
  line-height: 1.6;
  text-align: center;
  margin-bottom: 2.4rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 1.2rem;
`;

const ActionButton = styled.button`
  border: none;
  border-radius: var(--border-radius-sm);
  padding: 1rem 1.8rem;
  font-size: 1.4rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 10rem;

  &:focus {
    outline: 2px solid var(--color-brand-600);
    outline-offset: 2px;
  }
`;

const CancelButton = styled(ActionButton)`
  background-color: var(--color-grey-200);
  color: var(--color-grey-700);

  &:hover {
    background-color: var(--color-grey-300);
  }
`;

const ConfirmButton = styled(ActionButton)`
  background-color: var(--color-brand-600);
  color: var(--color-brand-50);

  &:hover {
    background-color: var(--color-brand-700);
  }
`;

function ConfirmationModal({
  onClose,
  onConfirm,
  confirmationText = "Confirmar acción",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
}) {
  // Lock scroll when modal opens
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";

    return () => {
      html.style.overflow = "";
      body.style.overflow = "";
      body.style.position = "";
      body.style.top = "";
      body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <>
      <ScrollLock />
      <FullScreenOverlay onClick={onClose}>
        <ConfirmationBox onClick={(e) => e.stopPropagation()}>
          <ConfirmationText>{confirmationText}</ConfirmationText>
          <ButtonGroup>
            <CancelButton onClick={onClose}>{cancelText}</CancelButton>
            <ConfirmButton onClick={onConfirm}>{confirmText}</ConfirmButton>
          </ButtonGroup>
        </ConfirmationBox>
      </FullScreenOverlay>
    </>
  );
}

ConfirmationModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  confirmationText: PropTypes.string,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
};

export default ConfirmationModal;
