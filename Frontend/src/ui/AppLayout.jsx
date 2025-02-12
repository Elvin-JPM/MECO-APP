import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import styled from "styled-components";
import Heading from "./Heading";
import Ribbon from "./Ribbon";
import UserSection from "./UserSection";
import { ThemeProvider } from "styled-components";
import { useDarkMode } from "../context/DarkModeContext";
import Background from "./Background";

const Main = styled.main`
  padding: 4rem 4.8rem 6.4rem;
  overflow: scroll;
  &::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-behavior: smooth;
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
  /* position: relative;
  z-index: 2500; */
  @media (max-width: 1200px) and (min-width: 768px) {
    grid-template-columns: 18rem 1fr;
  }
  @media (max-width: 768px) and (min-width: 480px) {
    grid-template-columns: 6rem 1fr;
  }
`;

const AppBody = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

function AppLayout() {
  const { isDarkMode } = useDarkMode();
  return (
    <AppBody>
      <Background isDarkMode={isDarkMode} />
      <Ribbon />
      <StyledAppLayout>
        <Header>
          <Heading>APP MEDICIÓN COMERCIAL</Heading>
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
