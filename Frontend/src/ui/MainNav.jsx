import { useState } from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { HiOutlineHome, HiOutlineUsers } from "react-icons/hi";
import { MdOutlineElectricMeter } from "react-icons/md";
import { HiSignal } from "react-icons/hi2";
import { SlLocationPin } from "react-icons/sl";
import { HiOutlineCog6Tooth } from "react-icons/hi2";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { VscGraphLine } from "react-icons/vsc";
import { SlGraph } from "react-icons/sl";
import { FaRegFolderOpen } from "react-icons/fa";
import Tooltip from "./Tooltip";
import IconContainer from "./IconContainer";
import { MdOutlineDashboard } from "react-icons/md";
import { RiAdminLine } from "react-icons/ri";

const NavList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const SidebarIcon = styled.div`
  font-size: ${({ size }) => size || "24px"};
  color: ${({ color }) => color || "inherit"};
  display: inline-flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    font-size: ${({ mobileSize }) => mobileSize || "20px"};
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: ${({ tabletSize }) => tabletSize || "28px"};
    color: blue;
  }

  @media (min-width: 1025px) {
    font-size: ${({ desktopSize }) => desktopSize || "32px"};
  }
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
    padding: 1.2rem 1.5rem;
    transition: all 0.3s;
    border-radius: 0px;
  }

  &:hover {
    background-color: var(--color-grey-50);
  }
  &:active,
  &.active:link,
  &.active:visited {
    color: var(--color-grey-900);
    background-color: var(--color-grey-200);
    border-radius: var(--border-radius-sm);
    /* border-bottom-right-radius: 0px; */
  }

  & svg {
    width: 2.4rem;
    height: 2.4rem;
    color: var(--color-grey-400);
    transition: all 0.3s;

    @media (max-width: 1200px) and (min-width: 768px) {
      display: none;
    }
    @media (max-width: 768px) and (min-width: 480px) {
      width: 3rem;
      height: 3rem;
      padding: 0;
      margin: 0;
    }
  }

  &:hover svg {
    color: var(--color-grey-800);
    transform: scale(1.1);
  }
  &:active svg,
  &.active:link svg,
  &.active:visited svg {
    color: var(--color-institucional-celeste);
    transform: scale(1.2);
  }

  & > span {
    @media (max-width: 1200px) and (min-width: 768px) {
      font-size: 1.55rem;
    }
    @media (max-width: 768px) and (min-width: 480px) {
      display: none;
    }
  }
`;

function MainNav() {
  const [tooltipVisible, setTooltipVisible] = useState(null);
  const [timeoutId, setTimeoutId] = useState(null);

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

  const navItems = [
    {
      to: "/dashboard",
      icon: MdOutlineDashboard,
      text: "Dashboard",
      tooltip: "Dashboard",
    },
    {
      to: "/meters",
      icon: MdOutlineElectricMeter,
      text: "Medidores",
      tooltip: "Medidores",
    },
    {
      to: "/reports",
      icon: HiOutlineDocumentReport,
      text: "Informes",
      tooltip: "Informes",
    },
    { to: "/actas", icon: FaRegFolderOpen, text: "Actas", tooltip: "Actas" },
    {
      to: "/communications",
      icon: HiSignal,
      text: "Com",
      tooltip: "Comunicaciones",
    },
    {
      to: "/demanda",
      icon: SlGraph,
      text: "Demanda",
      tooltip: "Demanda",
    },
    {
      to: "/locations",
      icon: SlLocationPin,
      text: "Ubicaciones",
      tooltip: "Ubicaciones",
    },
    {
      to: "/admin",
      icon: RiAdminLine,
      text: "Administración",
      tooltip: "Administración",
    },
  ];

  return (
    <nav>
      <NavList>
        {navItems.map((item, index) => (
          <li key={item.to}>
            <StyledNavLink
              to={item.to}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
              onFocus={() => handleFocus(index)}
              onBlur={handleBlur}
              aria-describedby={`tooltip-${index}`}
            >
              <IconContainer>
                <SidebarIcon
                  size="40px"
                  mobileSize="20px"
                  tabletSize="30px"
                  desktopSize="40px"
                >
                  <item.icon />
                </SidebarIcon>
                <Tooltip
                  sidebar
                  id={`tooltip-${index}`}
                  className="tooltip"
                  position="right"
                  bgColor="linear-gradient(to bottom right, #EB3349, #F45C43)"
                  fontSize="12px"
                  padding="8px 12px"
                  isVisible={tooltipVisible === index}
                  role="tooltip"
                  aria-hidden={tooltipVisible !== index}
                >
                  {item.tooltip}
                </Tooltip>
              </IconContainer>
              <span>{item.text}</span>
            </StyledNavLink>
          </li>
        ))}
      </NavList>
    </nav>
  );
}

export default MainNav;
