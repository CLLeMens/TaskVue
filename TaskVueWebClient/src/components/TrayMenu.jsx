import { useTheme } from "../context/ThemeContext.jsx";

// Define the TrayMenu component
function TrayMenu() {
  // Use the useTheme hook to get the current theme and the function to toggle the theme
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <h1>HALLO WELT</h1>
    </>
  );
}

export default TrayMenu;
