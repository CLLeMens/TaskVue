import React, { useEffect, useState } from "react";
import {
  Switch,
  Layout,
  Slider,
  Typography,
  Menu,
  Button,
  Select,
  Input,
} from "antd";
import { makeRequest } from "../api/api.js";
import { USERSETTINGS } from "../api/endpoints.js";
import { useTheme } from "../context/ThemeContext.jsx";

// Importing the Typography component from Ant Design
const { Title } = Typography;

// Define the Settings component
const Settings = () => {
  // Use the custom hook to get the current theme and the function to toggle it
  const { theme, toggleTheme } = useTheme();

  // State to keep track of the selected header item
  const [selectedHeaderItem, setSelectedHeaderItem] = useState(() => {
    // Try to get the selected header item from the session storage
    const storedValue = sessionStorage.getItem("selectedHeaderItemSettings");
    // If a value was stored, use it, otherwise default to 'settings'
    return storedValue ? storedValue : "settings";
  });

  // State to keep track of whether the settings are being loaded
  const [loading, setLoading] = useState(false);

  // State to keep track of the initial settings
  const [initialState, setInitialState] = useState({
    name: null,
    isNotificationsOn: null,
    appTheme: null,
    isTrackFatigueOn: null,
    isTrackOtherPeopleOn: null,
    isTrackSmartphoneOn: null,
    isDistracted: null,
    trackingGrade: null,
  });

  // State to keep track of the edited settings
  const [editedData, setEditedData] = useState({
    name: null,
    isNotificationsOn: null,
    appTheme: null,
    isTrackFatigueOn: null,
    isTrackOtherPeopleOn: null,
    isTrackSmartphoneOn: null,
    isDistracted: null,
    trackingGrade: null,
  });
  // Use effect hook to fetch the settings when the component mounts
  useEffect(() => {
    // Define the async function to fetch the data
    const fetchData = async () => {
      try {
        // Make a GET request to the USERSETTINGS endpoint
        const response = await makeRequest("GET", USERSETTINGS);
        // Log the response
        console.log(response);
        // Set the edited data state with the response data
        setEditedData({
          name: response.name,
          isNotificationsOn: response.notifications,
          appTheme: response.theme,
          isTrackFatigueOn: response.track_fatigue,
          isTrackOtherPeopleOn: response.track_other_people,
          isTrackSmartphoneOn: response.track_smartphone,
          isDistracted: response.track_distraction,
          trackingGrade: response.tracking_grade,
        });

        // Set the initial state with the response data
        setInitialState({
          name: response.name,
          isNotificationsOn: response.notifications,
          appTheme: response.theme,
          isTrackFatigueOn: response.track_fatigue,
          isTrackOtherPeopleOn: response.track_other_people,
          isTrackSmartphoneOn: response.track_smartphone,
          isDistracted: response.track_distraction,
          trackingGrade: response.tracking_grade,
        });
      } catch (error) {
        // Log any errors
        console.log(error);
      }
    };
    // Call the fetch data function
    fetchData();
  }, []); // Empty dependency array means this effect runs once on component mount

  // Function to check if any changes have been made to the settings
  const hasChanges = () => {
    // Compare each key in the edited data with the initial state
    return Object.keys(editedData).some(
      (key) => editedData[key] !== initialState[key]
    );
  };

  // Function to handle changes to the input fields
  const handleInputChange = (name, value) => {
    // If notifications are being turned on, request permission
    if (name === "isNotificationsOn" && value) {
      const permission = requestNotificationPermission();
      // If permission is not granted, return without making changes
      if (!permission) {
        return;
      }
    }
    // Update the edited data with the new value
    setEditedData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Function to save the settings
  const saveSettings = async () => {
    // Set loading to true while the request is being made
    setLoading(true);
    try {
      // Make a POST request to the USERSETTINGS endpoint with the edited data
      const response = await makeRequest("POST", USERSETTINGS, editedData);
      // After a delay, check the response and update the theme if necessary
      setTimeout(function () {
        if (response.message === "new theme") {
          toggleTheme(editedData.appTheme);
        }
        // Update the initial state with the edited data
        setInitialState(editedData);
        // Set loading to false now that the request is complete
        setLoading(false);
        // Store the user's name in local storage
        localStorage.setItem("userName", JSON.stringify(editedData.name));
      }, 1000);
    } catch (error) {
      // Log any errors
      console.log(error);
    }
  };

  // Function to request permission for notifications
  const requestNotificationPermission = async () => {
    // Request permission
    const permission = await Notification.requestPermission();
    // If permission is granted, send a test notification
    if (permission === "granted") {
      sendTestNotification();
      return true;
    } else {
      // If permission is denied, log a message and return false
      console.log("Notification permission denied");
      return false;
    }
  };

  // Function to send a test notification
  const sendTestNotification = () => {
    // Create a new notification with a title and body
    new Notification("Test Notification", {
      body: "This is a test notification!",
    });
  };

  // Define the items for the header
  const headerItems = [{ key: "settings", label: "Settings" }];

  // Function to get the text style based on the current theme
  const getTextStyle = () => ({
    color: theme === "dark" ? "#ffffff" : null,
    marginBottom: "30px",
  });

  // Define the style for the enabled save button
  const enabledButtonStyle = {
    width: "120px",
    marginBottom: "35px",
  };

  // Define the style for the disabled save button
  const disabledButtonStyle = {
    ...enabledButtonStyle,
    backgroundColor: "#ccc",
    color: "white",
    cursor: "not-allowed",
  };

  return (
    // Use the Layout component with the current theme
    <Layout
      theme={theme}
      style={{
        // Set the background color based on the current theme
        backgroundColor: theme === "dark" ? "#242424" : "#ffffff",
        // Add a transition for the background color and text color
        transition: "background-color 0.4s ease, color 0.4s ease",
      }}
    >
      // Use the Menu component for the header
      <Menu
        mode="horizontal"
        defaultSelectedKeys={["settings"]}
        items={headerItems}
        // When an item is clicked, update the selected header item
        onClick={(e) => setSelectedHeaderItem(e.key)}
        className={`custom-menu ${theme}-theme`} // Add the theme-specific class
        style={{
          margin: "30px 0 0 45px",
          fontSize: "1.2rem",
          // Add a transition for the background color and text color
          transition: "background-color 0.4s ease, color 0.4s ease",
          // Set the background color based on the current theme
          backgroundColor: theme === "dark" ? "#242424" : "#ffffff",
          borderBottom: "none",
          // Set the text color based on the current theme
          color: theme === "dark" ? "#ffffff" : "black",
        }}
      />
      // Container for the settings
      <div
        className={"settings-wrapper"}
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          textAlign: "left",
          margin: " 45px 0 0 65px",
        }}
      >
        // Title for the general settings
        <Title level={4} style={getTextStyle()}>
          General
        </Title>
        // Container for the general settings
        <div
          className={"general-wrapper"}
          style={{
            ...getTextStyle(),
            display: "flex",
            flexDirection: "row",
            gap: "30px",
            marginBottom: "65px",
            minWidth: "100%",
          }}
        >
          // Container for the labels of the general settings
          <div
            style={{ display: "flex", flexDirection: "column", gap: "30px" }}
          >
            <div>Name</div>
            <div>Notifications</div>
            <div>Theme</div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "30px",
              marginLeft: "auto",
              marginRight: "45px",
            }}
          >
            <Input
              value={editedData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              style={{ minWidth: "250px" }}
            />
            <Switch
              style={{ width: "45px", marginLeft: "auto" }}
              checked={editedData.isNotificationsOn}
              onChange={(e) => handleInputChange("isNotificationsOn", e)}
            />
            // Select-button for theme
            <Select
              style={{ width: "100px", marginLeft: "auto" }}
              onChange={(e) => handleInputChange("appTheme", e)}
              value={editedData.appTheme} // use value instead of defaultValue
              options={[
                { value: "system", label: "System" },
                { value: "dark", label: "Dark" },
                { value: "light", label: "Light" },
              ]}
            />
          </div>
        </div>
        <Title level={4} style={getTextStyle()}>
          Tracking
        </Title>
        // Container for the tracking settings
        <div
          className={"tracking-wrapper"}
          style={{
            // Apply the text style based on the current theme
            ...getTextStyle(),
            // Arrange the tracking settings in a row with a gap between them
            display: "flex",
            flexDirection: "row",
            gap: "30px",
            // Add a margin at the bottom
            marginBottom: "40px",
          }}
        >
          // Container for the labels of the tracking settings
          <div
            style={{
              // Arrange the labels in a column with a gap between them
              display: "flex",
              flexDirection: "column",
              gap: "30px",
            }}
          >
            // Labels for the tracking settings
            <div>Track drowziness</div>
            <div>Track other people</div>
            <div>Track Smartphone</div>
            <div>Track Distraction</div>
            <div>Tracking grade</div>
          </div>
          // Container for the switches of the tracking settings
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "30px",
              marginLeft: "auto",
              marginRight: "45px",
            }}
          >
            // Switch for enabling or disabling drowziness tracking
            <Switch
              // The current value is the drowziness tracking setting from the edited data
              checked={editedData.isTrackFatigueOn}
              // When the switch is toggled, update the drowziness tracking setting in the edited data
              onChange={(e) => handleInputChange("isTrackFatigueOn", e)}
              // Set a width for the switch and align it to the right
              style={{ width: "45px", marginLeft: "auto" }}
            />
            // Switch for enabling or disabling other people tracking
            <Switch
              // The current value is the other people tracking setting from the edited data
              checked={editedData.isTrackOtherPeopleOn}
              // When the switch is toggled, update the other people tracking setting in the edited data
              onChange={(e) => handleInputChange("isTrackOtherPeopleOn", e)}
              // Set a width for the switch and align it to the right
              style={{ width: "45px", marginLeft: "auto" }}
            />
            // Switch for enabling or disabling smartphone tracking
            <Switch
              // The current value is the smartphone tracking setting from the edited data
              checked={editedData.isTrackSmartphoneOn}
              // When the switch is toggled, update the smartphone tracking setting in the edited data
              onChange={(e) => handleInputChange("isTrackSmartphoneOn", e)}
              // Set a width for the switch and align it to the right
              style={{ width: "45px", marginLeft: "auto" }}
            />
            // Switch for enabling or disabling distraction tracking
            <Switch
              // The current value is the distraction tracking setting from the edited data
              checked={editedData.isDistracted}
              // When the switch is toggled, update the distraction tracking setting in the edited data
              onChange={(e) => handleInputChange("isDistracted", e)}
              // Set a width for the switch and align it to the right
              style={{ width: "45px", marginLeft: "auto" }}
            />
            // Container for the tracking grade slider and label
            <div
              style={{
                // Arrange the slider and label in a column
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
                width: "300px",
              }}
            >
              <Slider
                className={
                  theme === "dark" ? "dark-theme-slider" : "light-theme-slider"
                }
                value={editedData.trackingGrade}
                onChange={(e) => handleInputChange("trackingGrade", e)}
                min={0}
                max={1}
                step={0.1}
                style={{
                  flex: 1,
                  marginRight: "10px",
                  width: "100%",
                }} // using flex: 1, so the slider takes the most space available
              />
              <div style={{ minWidth: "100%", textAlign: "right" }}>
                {editedData.trackingGrade >= 0.75
                  ? "High"
                  : editedData.trackingGrade >= 0.5
                  ? "Medium"
                  : "Low"}
              </div>
            </div>
          </div>
        </div>
        <Button
          onClick={saveSettings}
          type={"primary"}
          disabled={!hasChanges()}
          loading={loading}
          style={hasChanges() ? enabledButtonStyle : disabledButtonStyle}
        >
          Save
        </Button>
      </div>
    </Layout>
  );
};

export default Settings;
