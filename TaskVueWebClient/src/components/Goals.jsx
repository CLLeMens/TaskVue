import React, { useEffect, useRef, useState } from "react";
import {
  TimePicker,
  InputNumber,
  Table,
  Layout,
  Menu,
  ConfigProvider,
  Button,
} from "antd";
import moment from "moment";
import { makeRequest } from "../api/api.js";
import { USERGOALS } from "../api/endpoints.js";
import dayjs from "dayjs";
import { useTheme } from "../context/ThemeContext.jsx";

const Goals = () => {
  const { theme, toggleTheme } = useTheme(); // Using custom hook to get current theme and function to toggle it
  const [loading, setLoading] = useState(false); // Using useState to manage loading state
  const format = "HH:mm"; // Defining the format for time
  const [columns, setColumns] = useState([]); // Using useState to manage columns state

  // Initial data for the table

  const [initialData, setInitialData] = useState([
    {
      key: "1",
      day: "Monday",
      workload: null,
      end: null,
      breakTime: null,
      distractions: null,
    },
    {
      key: "2",
      day: "Tuesday",
      workload: null,
      end: null,
      breakTime: null,
      distractions: null,
    },
    {
      key: "3",
      day: "Wednesday",
      workload: null,
      end: null,
      breakTime: null,
      distractions: null,
    },
    {
      key: "4",
      day: "Thursday",
      workload: null,
      end: null,
      breakTime: null,
      distractions: null,
    },
    {
      key: "5",
      day: "Friday",
      workload: null,
      end: null,
      breakTime: null,
      distractions: null,
    },
    {
      key: "6",
      day: "Saturday",
      workload: null,
      end: null,
      breakTime: null,
      distractions: null,
    },
    {
      key: "7",
      day: "Sunday",
      workload: null,
      end: null,
      breakTime: null,
      distractions: null,
    },
  ]);

  const [editedData, setEditedData] = useState([
    {
      key: "1",
      day: "Monday",
      workload: null,
      end: null,
      breakTime: null,
      distractions: null,
    },
    {
      key: "2",
      day: "Tuesday",
      workload: null,
      end: null,
      breakTime: null,
      distractions: null,
    },
    {
      key: "3",
      day: "Wednesday",
      workload: null,
      end: null,
      breakTime: null,
      distractions: null,
    },
    {
      key: "4",
      day: "Thursday",
      workload: null,
      end: null,
      breakTime: null,
      distractions: null,
    },
    {
      key: "5",
      day: "Friday",
      workload: null,
      end: null,
      breakTime: null,
      distractions: null,
    },
    {
      key: "6",
      day: "Saturday",
      workload: null,
      end: null,
      breakTime: null,
      distractions: null,
    },
    {
      key: "7",
      day: "Sunday",
      workload: null,
      end: null,
      breakTime: null,
      distractions: null,
    },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await makeRequest("GET", USERGOALS);
        setEditedData(response);
        setInitialData(response);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  function decimalToTime(decimal) {
    // Extracts the hours (integer part of the decimal)
    const hours = Math.floor(decimal);

    // Converts the decimal part into minutes (multiplies by 60)
    const minutes = Math.round((decimal - hours) * 60);

    // Formats hours and minutes into a HH:mm format
    // Adds a leading zero if necessary
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  }

  function timeToDecimal(timeString) {
    // Splits the time into hours and minutes
    const [hours, minutes] = timeString.split(":").map(Number);

    // Calculates the decimal time
    return hours + minutes / 60;
  }
  // useEffect hook to set the columns of the table
  useEffect(() => {
    setColumns([
      {
        title: "Day",
        dataIndex: "day",
        key: "day",
      },
      {
        title: "Workload",
        dataIndex: "workload",
        key: "workload",

        // Render function for the Workload column
        render: (text, record) => {
          // Converts the workload time from decimal to HH:mm format
          const timeString =
            record.workload !== null ? decimalToTime(record.workload) : null;
          // Converts the time string to a moment object
          const momentTime = timeString ? dayjs(timeString, format) : null;

          // Returns a TimePicker component with the workload time

          return (
            <TimePicker
              value={momentTime}
              format={format}
              onChange={(time, timeString) =>
                handleTimeChange(record.key, "workload", time, timeString)
              }
            />
          );
        },
      },
      {
        title: "Break",
        dataIndex: "breakTime",
        key: "breakTime",
        render: (text, record) => {
          const timeString =
            record.breakTime !== null ? decimalToTime(record.breakTime) : null;
          const momentTime = timeString ? dayjs(timeString, format) : null;

          return (
            <TimePicker
              value={momentTime}
              format={format}
              onChange={(time) =>
                handleTimeChange(record.key, "breakTime", time)
              }
            />
          );
        },
      },
      {
        title: "Distractions",
        dataIndex: "distractions",
        key: "distractions",
        render: (text, record) => {
          const timeString =
            record.distractions !== null
              ? decimalToTime(record.distractions)
              : null;
          const momentTime = timeString ? dayjs(timeString, format) : null;

          return (
            <TimePicker
              value={momentTime}
              format={format}
              onChange={(value) =>
                handleTimeChange(record.key, "distractions", value)
              }
            />
          );
        },
      },
    ]);
  }, [editedData]);

  // This function handles changes to the time fields in the data
  const handleTimeChange = (key, field, time) => {
    // Initialize an empty array for the new list
    let newList = [];
    // Map through the edited data
    const newData = editedData.map((item) => {
      // If the item key matches the provided key
      if (item.key === key) {
        // Convert the time to a string
        const timeString = time ? time.format("HH:mm") : null;
        // Convert the time string to decimal
        const decimalTime = timeString ? timeToDecimal(timeString) : null;
        // Push the updated item to the new list
        newList.push({ ...item, [field]: decimalTime });
        return;
      }

      // If the item key does not match, push the item to the new list
      newList.push(item);
    });
    // Update the state with the new list
    setEditedData(newList);
  };

  // Define the header items for the table
  const headerItems = [{ key: "goals", label: "Goals" }];

  // Define the style for the enabled button
  const enabledButtonStyle = {
    width: "120px",
    margin: "35px 0 35px 63px",
  };

  // Define the style for the disabled button
  const disabledButtonStyle = {
    ...enabledButtonStyle,
    backgroundColor: "#ccc",
    color: "white",
    cursor: "not-allowed",
  };

  // This function saves the goals by making a POST request with the edited data
  const saveGoals = async () => {
    // Set loading to true
    setLoading(true);
    try {
      // Make the POST request
      const response = await makeRequest("POST", USERGOALS, editedData);
      // After a delay, set the initial data to the edited data and set loading to false
      setTimeout(function () {
        setInitialData(editedData);
        setLoading(false);
      }, 1000);
    } catch (error) {
      // Log any errors
      console.log(error);
    }
  };

  // This function checks if there are any changes between the initial and edited data
  const hasChanges = () => {
    return Object.keys(editedData).some((key) => {
      const editedItem = editedData[key];
      const initialItem = initialData[key];
      return Object.keys(editedItem).some(
        (prop) => editedItem[prop] !== initialItem[prop]
      );
    });
  };

  // The component returns a Layout with a Menu and other children
  return (
    <Layout
      theme={theme}
      style={{ backgroundColor: theme === "dark" ? "#242424" : "#ffffff" }}
    >
      <Menu
        mode="horizontal"
        defaultSelectedKeys={["goals"]}
        items={headerItems}
        className={`custom-menu ${theme}-theme`} // Add the theme-specific class here
        style={{
          margin: "30px 0 50px 50px",
          fontSize: "1.2rem",
          backgroundColor: theme === "dark" ? "#242424" : "#ffffff",
          borderBottom: "none",
          color: theme === "dark" ? "#ffffff" : "black",
        }}
      />
      <ConfigProvider
        theme={{
          components: {
            Table: {
              // Dynamic styles for Table component based on theme
              headerBg: theme === "dark" ? "#1f1f1f" : "#fafafa",
              headerColor: theme === "dark" ? "#e3e3e3" : "#5c5c5c",
              borderColor: theme === "dark" ? "#3a3a3a" : "#e8e8e8",
              colorBgContainer: theme === "dark" ? "#2b2b2d" : "#f4f4f6",
              colorPrimary: "#1677ff",
              colorBorder: theme === "dark" ? "#3a3a3a" : "#e8e8e8",
              colorText: theme === "dark" ? "#ffffff" : "black",
              colorTextSecondary: theme === "dark" ? "#a6a6a6" : "#595959",
              borderRadiusBase: "6px",
            },
            DatePicker: {
              presetsWidth: 180,
            },
          },
        }}
      >
        <Table // Table component to display data
          className={"goals-table"} // Class for styling
          dataSource={editedData} // Data source for the table
          columns={columns} // Columns for the table
          pagination={false} // Disable pagination
        />
      </ConfigProvider>
      // Button component to save changes
      <Button
        onClick={saveGoals} // Function to save goals
        type={"primary"} // Button type
        disabled={!hasChanges()} // Disable button if there are no changes
        loading={loading} // Show loading indicator when saving
        style={hasChanges() ? enabledButtonStyle : disabledButtonStyle} // Dynamic style based on whether there are changes
      >
        Save
      </Button>
    </Layout>
  );
};

export default Goals;
