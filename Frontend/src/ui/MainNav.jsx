import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { HiOutlineHome, HiOutlineUsers } from "react-icons/hi";
import { MdOutlineElectricMeter } from "react-icons/md";
import { HiSignal } from "react-icons/hi2";
import { SlLocationPin } from "react-icons/sl";
import {
  HiOutlineCalendarDays,
  HiOutlineCog6Tooth,
  HiOutlineHomeModern,
} from "react-icons/hi2";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { FaRegFolderOpen } from "react-icons/fa";

const NavList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const StyledNavLink = styled(NavLink)`
  &:link,
  &:visited {
    display: flex;
    align-items: center;
    gap: 1.2rem;

    color: var(--color-grey-600);
    font-size: 1.6rem;
    font-weight: 500;
    padding: 1.2rem 2.4rem;
    transition: all 0.3s;
  }

  /* This works because react-router places the active class on the active NavLink */
  &:hover,
  &:active,
  &.active:link,
  &.active:visited {
    color: var(--color-grey-900);
    background-color: var(--color-grey-50);
    border-radius: var(--border-radius-sm);
    border-bottom-right-radius: 0px;
    /* border-bottom-left-radius: 0px;
    border-bottom: 2px solid var(--color-institucional-amarillo); */
  }

  & svg {
    width: 2.4rem;
    height: 2.4rem;
    color: var(--color-grey-400);
    transition: all 0.3s;
  }

  &:hover svg,
  &:active svg,
  &.active:link svg,
  &.active:visited svg {
    color: var(--color-institucional-amarillo);
  }
`;

function MainNav() {
  return (
    <nav>
      <NavList>
        <li>
          <StyledNavLink to="/dashboard">
            <HiOutlineHome />
            <span>Inicio</span>
          </StyledNavLink>
        </li>
        <li>
          <StyledNavLink to="/meters">
            <MdOutlineElectricMeter />
            <span>Medidores</span>
          </StyledNavLink>
        </li>
        <li>
          <StyledNavLink to="/reports">
            <HiOutlineDocumentReport />
            <span>Informes</span>
          </StyledNavLink>
        </li>
        <li>
          <StyledNavLink to="/acts">
            <FaRegFolderOpen />
            <span>Actas</span>
          </StyledNavLink>
        </li>
        <li>
          <StyledNavLink to="/communications">
            <HiSignal />
            <span>Com</span>
          </StyledNavLink>
        </li>
        <li>
          <StyledNavLink to="/users">
            <HiOutlineUsers />
            <span>Usuarios</span>
          </StyledNavLink>
        </li>
        <li>
          <StyledNavLink to="/Locations">
            <SlLocationPin />
            <span>Ubicaciones</span>
          </StyledNavLink>
        </li>
        <li>
          <StyledNavLink to="/settings">
            <HiOutlineCog6Tooth />
            <span>Configuración</span>
          </StyledNavLink>
        </li>
      </NavList>
    </nav>
  );
}

export default MainNav;
