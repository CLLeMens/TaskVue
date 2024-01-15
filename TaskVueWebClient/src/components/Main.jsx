import SideBar from "./SideBar.jsx";
import { useEffect, useState } from "react";
import Dashboard from "./Dashboard.jsx";
import Goals from "./Goals.jsx";
import Settings from "./Settings.jsx";

function Main() {
  // State for selected menu item, with initial value from session storage or default to 'dashboard'
  const [selectedMenuItem, setSelectedMenuItem] = useState(() => {
    const storedValue = sessionStorage.getItem("selectedMenuItem");
    return storedValue ? storedValue : "dashboard";
  });

  // Effect to store selected menu item in session storage whenever it changes
  useEffect(() => {
    sessionStorage.setItem("selectedMenuItem", selectedMenuItem);
  }, [selectedMenuItem]);

  // Handler for menu selection, updates selected menu item state
  const handleMenuSelect = (key) => {
    setSelectedMenuItem(key);
  };

  // Determine content to display based on selected menu item

  let content;
  switch (selectedMenuItem) {
    case "dashboard":
      content = <Dashboard />;
      break;
    case "goals":
      content = <Goals />;
      break;
    case "settings":
      content = <Settings />;
      break;
    default:
      content = <Dashboard />;
  }
  return (
    <div
      className={"content-wrapper"}
      style={{ display: "flex", flexDirection: "row", width: "100%" }}
    >
      <SideBar
        onMenuSelect={handleMenuSelect}
        selectedItem={selectedMenuItem}
      />
      {content}
    </div>
  );
}

export default Main;
