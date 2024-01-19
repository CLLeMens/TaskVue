import React, { useState, useEffect } from "react";
import { Layout, Menu, DatePicker, ConfigProvider } from "antd";
import { RiseOutlined, HomeOutlined } from "@ant-design/icons";
import "dayjs/locale/de";
import Productivity from "./Productivity.jsx";
import dayjs from "dayjs";
import updateLocale from "dayjs/plugin/updateLocale";
import Home from "./Home.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

dayjs.extend(updateLocale); // Extending dayjs with the updateLocale plugin
dayjs.updateLocale("en", {
  // Updating the locale settings for dayjs
  weekStart: 1,
});

const { Header, Content } = Layout; // Destructuring Header and Content from Layout

const Dashboard = () => {
  const { theme, toggleTheme } = useTheme(); // Using the custom hook to get the current theme and the function to toggle it
  const currentWeek = dayjs().week(); // Getting the current week number

  // Using React's useState hook to manage the state of the selected header item
  // The initial value is retrieved from the session storage
  const [selectedHeaderItem, setSelectedHeaderItem] = useState(() => {
    const storedValue = sessionStorage.getItem("selectedHeaderItem");
    return storedValue ? storedValue : "home";
  });

  // Using React's useEffect hook to update the session storage whenever the selected header item changes
  useEffect(() => {
    sessionStorage.setItem("selectedHeaderItem", selectedHeaderItem);
  }, [selectedHeaderItem]);

  // Defining the header items
  const headerItems = [
    { key: "home", icon: <HomeOutlined />, label: "Home" },
    { key: "productivity", icon: <RiseOutlined />, label: "Productivity" },
  ];

  let content; // Variable to hold the content to be displayed
  // Using a switch statement to determine the content based on the selected header item
  switch (selectedHeaderItem) {
    case "home":
      content = <Home />;
      break;
    case "productivity":
      content = <Productivity week={currentWeek} />;
      break;
    default:
      content = <Home />;
  }

  // Returning the layout with the selected content
  return (
    <Layout
      className="layout"
      style={{ backgroundColor: theme === "dark" ? "#242424" : "#ffffff" }}
    >
      <Header
        style={{
          backgroundColor: theme === "dark" ? "#242424" : "#ffffff",
          marginTop: "15px",
          padding: "0",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            minWidth: "100%",
          }}
        >
          <Menu
            mode="horizontal"
            defaultSelectedKeys={[selectedHeaderItem]}
            items={headerItems}
            onClick={(e) => setSelectedHeaderItem(e.key)}
            className={`custom-menu ${theme}-theme`} // Hier fügen Sie die themenspezifische Klasse hinzu
            style={{
              flex: 1,
              backgroundColor: theme === "dark" ? "#242424" : "#ffffff",
              borderBottom: "none",
              color: theme === "dark" ? "#ffffff" : "black",
            }}
          />
        </div>
      </Header>
      <Content style={{ padding: "0 25px 0 0" }}>{content}</Content>
    </Layout>
  );
};

export default Dashboard;
