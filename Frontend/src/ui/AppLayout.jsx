import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import styled from "styled-components";
import Heading from "./Heading";
import Ribbon from "./Ribbon";
import UserSection from "./UserSection";

const Main = styled.main`
  background-color: var(--color-grey-50);
  background: url("/white-abstract-bg.jpg") center / cover padding-box;
  background-clip: padding-box;
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
  margin-top: 3vh;
  height: 97vh;
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
  return (
    <AppBody>
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
