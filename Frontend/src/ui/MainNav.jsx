import { useState, useCallback, useMemo } from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";

// Icons - Organized imports
import { HiSignal } from "react-icons/hi2";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { FaRegFolderOpen } from "react-icons/fa";
import {
  MdOutlineElectricMeter,
  MdOutlineDashboard,
  MdChecklistRtl,
  MdSignalWifiStatusbar3Bar,
} from "react-icons/md";
import { SlLocationPin, SlGraph } from "react-icons/sl";
import { RiAdminLine } from "react-icons/ri";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { GrValidate } from "react-icons/gr";
import { FaRegClock } from "react-icons/fa";

// Local components
import Tooltip from "./Tooltip";
import IconContainer from "./IconContainer";

// Styled components
const NavList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  list-style: none;
  padding: 0;
  margin: 0;
`;

const SubMenuOpener = styled.div`
  align-self: flex-end;
  padding: 0.5rem;
  display: flex;
  align-items: center;
`;

const SubMenu = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-left: 1.2rem;
  background-color: var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  margin-top: 0.2rem;
  box-shadow: var(--shadow-md);
  padding: 0.5rem;
  transition: all 0.3s ease;
`;

const SubMenuItem = styled.div`
  padding: 0.5rem;
  font-size: 1.4rem;
  color: var(--color-grey-600);
  width: 100%;
`;

const SidebarIcon = styled.div`
  font-size: ${({ size }) => size || "2.4rem"};
  color: ${({ color }) => color || "inherit"};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;

  @media (max-width: 768px) {
    font-size: ${({ mobileSize }) => mobileSize || "2rem"};
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: ${({ tabletSize }) => tabletSize || "2.8rem"};
  }

  @media (min-width: 1025px) {
    font-size: ${({ desktopSize }) => desktopSize || "3.2rem"};
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
    width: 100%;
    text-decoration: none;
    position: relative;
  }

  &:hover {
    background-color: var(--color-grey-100);
    border-radius: var(--border-radius-sm);
  }

  &:active,
  &.active:link,
  &.active:visited {
    color: var(--color-grey-900);
    background-color: var(--color-grey-200);
    border-radius: var(--border-radius-sm);
  }

  & svg {
    width: 2.4rem;
    height: 2.4rem;
    color: var(--color-grey-500);
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

const NavItem = styled.li`
  display: flex;
  flex-direction: column;
`;

function MainNav() {
  const [tooltipVisible, setTooltipVisible] = useState(null);
  const [timeoutId, setTimeoutId] = useState(null);
  const [activeSubMenu, setActiveSubMenu] = useState(null);

  const handleMouseEnter = useCallback(
    (index) => {
      if (timeoutId) clearTimeout(timeoutId);
      const id = setTimeout(() => setTooltipVisible(index), 150);
      setTimeoutId(id);
    },
    [timeoutId]
  );

  const handleMouseLeave = useCallback(() => {
    if (timeoutId) clearTimeout(timeoutId);
    setTooltipVisible(null);
  }, [timeoutId]);

  const handleFocus = useCallback((index) => {
    setTooltipVisible(index);
  }, []);

  const handleBlur = useCallback(() => {
    setTooltipVisible(null);
  }, []);

  const toggleSubMenu = useCallback((subMenuTag) => {
    setActiveSubMenu((prev) => (prev === subMenuTag ? null : subMenuTag));
  }, []);

  // Navigation items data
  const navItems = useMemo(
    () => [
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
      {
        to: "/actas",
        icon: FaRegFolderOpen,
        text: "Actas",
        tooltip: "Actas",
      },
      {
        to: "/communications",
        icon: HiSignal,
        text: "Com",
        tooltip: "Comunicaciones",
        hasSubMenu: true,
        subMenuTag: "communications",
        subMenuItems: [
          {
            to: "/communications/status",
            icon: MdSignalWifiStatusbar3Bar,
            text: "Estado Comm",
            tooltip: "Estado Comm",
          },
          {
            to: "/communications/tiempo",
            icon: FaRegClock,
            text: "Tiempo Comm",
            tooltip: "Tiempo Comunicaciones",
          },
        ],
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
        text: "Admin",
        tooltip: "Administración",
        hasSubMenu: true,
        subMenuTag: "admin",
        subMenuItems: [
          {
            to: "/admin/validaciones",
            icon: GrValidate,
            text: "Validaciones",
            tooltip: "Validaciones",
          },
          {
            to: "/admin/plan_verificaciones",
            icon: MdChecklistRtl,
            text: "Plan de Verificaciones",
            tooltip: "Plan de Verificaciones",
          },
        ],
      },
    ],
    []
  );

  const renderNavItem = useCallback(
    (item, index) => (
      <StyledNavLink
        to={item.to}
        onMouseEnter={() => handleMouseEnter(index)}
        onMouseLeave={handleMouseLeave}
        onFocus={() => handleFocus(index)}
        onBlur={handleBlur}
        aria-describedby={`tooltip-${index}`}
        aria-haspopup={item.hasSubMenu ? "true" : undefined}
        aria-expanded={
          item.hasSubMenu && activeSubMenu === item.subMenuTag
            ? "true"
            : "false"
        }
        onClick={
          item.hasSubMenu
            ? (e) => {
                e.preventDefault();
                toggleSubMenu(item.subMenuTag);
              }
            : undefined
        }
      >
        <IconContainer>
          <SidebarIcon
            size="2.4rem"
            mobileSize="2rem"
            tabletSize="2.8rem"
            desktopSize="3.2rem"
          >
            <item.icon />
          </SidebarIcon>
          <Tooltip
            sidebar
            id={`tooltip-${index}`}
            position="right"
            bgColor="linear-gradient(to bottom right, #EB3349, #F45C43)"
            fontSize="1.2rem"
            padding="0.8rem 1.2rem"
            isVisible={tooltipVisible === index}
            role="tooltip"
            aria-hidden={tooltipVisible !== index}
          >
            {item.tooltip}
          </Tooltip>
        </IconContainer>
        <span>{item.text}</span>
        {item.hasSubMenu && (
          <SubMenuOpener>
            {activeSubMenu === item.subMenuTag ? (
              <IoIosArrowUp />
            ) : (
              <IoIosArrowDown />
            )}
          </SubMenuOpener>
        )}
      </StyledNavLink>
    ),
    [
      handleMouseEnter,
      handleMouseLeave,
      handleFocus,
      handleBlur,
      tooltipVisible,
      activeSubMenu,
      toggleSubMenu,
    ]
  );

  const renderSubMenuItem = useCallback(
    (subItem, index) => (
      <StyledNavLink
        key={subItem.to}
        to={subItem.to}
        onMouseEnter={() => handleMouseEnter(index)}
        onMouseLeave={handleMouseLeave}
        onFocus={() => handleFocus(index)}
        onBlur={handleBlur}
        aria-describedby={`tooltip-${index}`}
      >
        <IconContainer>
          <SidebarIcon
            size="2.4rem"
            mobileSize="2rem"
            tabletSize="2.8rem"
            desktopSize="3.2rem"
          >
            <subItem.icon />
          </SidebarIcon>
          <Tooltip
            sidebar
            id={`tooltip-${index}`}
            position="right"
            bgColor="linear-gradient(to bottom right, #EB3349, #F45C43)"
            fontSize="1.2rem"
            padding="0.8rem 1.2rem"
            isVisible={tooltipVisible === index}
            role="tooltip"
            aria-hidden={tooltipVisible !== index}
          >
            {subItem.tooltip}
          </Tooltip>
        </IconContainer>
        <SubMenuItem>{subItem.text}</SubMenuItem>
      </StyledNavLink>
    ),
    [
      handleMouseEnter,
      handleMouseLeave,
      handleFocus,
      handleBlur,
      tooltipVisible,
    ]
  );

  return (
    <nav aria-label="Main navigation">
      <NavList>
        {navItems.map((item, index) => (
          <NavItem key={`${item.to}-${index}`}>
            {renderNavItem(item, index)}
            {item.hasSubMenu && activeSubMenu === item.subMenuTag && (
              <SubMenu
                aria-label={`${item.text} submenu`}
                aria-hidden={activeSubMenu !== item.subMenuTag}
              >
                {item.subMenuItems.map((subItem, subIndex) => (
                  <div key={subItem.to}>
                    {renderSubMenuItem(subItem, index + subIndex + 100)}
                  </div>
                ))}
              </SubMenu>
            )}
          </NavItem>
        ))}
      </NavList>
    </nav>
  );
}

export default MainNav;
