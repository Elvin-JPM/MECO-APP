import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import styled from "styled-components";
import Heading from "./Heading";
import Ribbon from "./Ribbon";
import UserSection from "./UserSection";
import Background from "./Background";
import { RxHamburgerMenu } from "react-icons/rx";
import IconButton from "./IconButton";
import { useState } from "react";
import Menu from "./Menu";

const Main = styled.main`
  padding: 1.5rem 2.2rem 1rem 2.2rem;
  overflow: auto;
  position: relative;
  &::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-behavior: smooth;

  @media (max-width: 500px) {
    padding: 2rem 1.5rem;
  }
`;

const StyledAppLayout = styled.div`
  display: grid;
  grid-template-columns: 26rem 1fr;
  grid-template-rows: auto 1fr;
  margin-top: 2.5vh;
  height: 97.5vh;
  &::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
  -ms-overflow-style: none;
  @media (max-width: 1200px) and (min-width: 768px) {
    grid-template-columns: 18rem 1fr;
  }
  @media (max-width: 768px) and (min-width: 480px) {
    grid-template-columns: 6rem 1fr;
  }

  @media (max-width: 500px) {
    display: flex;
    flex-direction: column;
  }
`;

const AppBody = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
`;

const BurgerMenu = styled.div`
  width: 4rem;
  height: 4rem;
  @media (min-width: 501px) {
    display: none;
  }
`;

function AppLayout() {
  const [showMenu, setShowMenu] = useState(false);
  const handleShowMenu = () => {
    setShowMenu((c) => !c);
  };
  return (
    <AppBody>
      {showMenu && <Menu CloseMenu={handleShowMenu} />}
      <Background />
      <Ribbon />
      <StyledAppLayout>
        <Header>
          <BurgerMenu onClick={handleShowMenu}>
            <IconButton>
              <RxHamburgerMenu />
            </IconButton>
          </BurgerMenu>
          <Heading>
            <span>APP MEDICIÓN COMERCIAL</span>
          </Heading>
          <UserSection />
        </Header>
        <Sidebar />
        <Main>
          <Outlet />
        </Main>
      </StyledAppLayout>
    </AppBody>
  );
}

export default AppLayout;
