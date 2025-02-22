import { HiOutlineMoon } from "react-icons/hi2";
import { IoSunnyOutline } from "react-icons/io5";
import { useDarkMode } from "../context/DarkModeContext";
import IconButton from "./IconButton";

function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  return (
    <IconButton onClick={toggleDarkMode}>
      {isDarkMode ? <IoSunnyOutline /> : <HiOutlineMoon />}
    </IconButton>
  );
}

export default DarkModeToggle;
