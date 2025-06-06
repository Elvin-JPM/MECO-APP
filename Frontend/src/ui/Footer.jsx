import styled from "styled-components";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <FooterContainer>
      <FooterContent>
        <Copyright>
          &copy; {currentYear} Centro Nacional de Despacho
        </Copyright>
        <DeveloperCredit>
          Desarrollado por <strong>Elvin Josué Posadas Márquez</strong>
        </DeveloperCredit>
      </FooterContent>
    </FooterContainer>
  );
};

// Styled Components
const FooterContainer = styled.footer`
  background-color: var(--color-grey-0);
  width: 100%;
  padding: 1.6rem 2.4rem;
  border-top: 1px solid var(--color-grey-100);
  margin-top: auto; /* Pushes footer to bottom if using flex layout */
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  text-align: center;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    text-align: left;
  }
`;

const Copyright = styled.p`
  font-size: 1.4rem;
  color: var(--color-grey-600);
  margin: 0;
`;

const DeveloperCredit = styled.p`
  font-size: 1.4rem;
  color: var(--color-grey-600);
  margin: 0;

  strong {
    color: var(--color-brand-600);
    font-weight: 600;
  }
`;

export default Footer;
