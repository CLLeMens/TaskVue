import React, {useState, useEffect} from "react";
import {Layout, Menu, Avatar, Space, Typography, Timeline} from "antd";
import {
    UserOutlined,
    DashboardOutlined,
    AimOutlined,
    SettingOutlined,
} from "@ant-design/icons";
import {useTheme} from "../context/ThemeContext.jsx";
import {makeRequest} from "../api/api.js";
import {PROCESSFLOW, TRACKJSON} from "../api/endpoints.js";

const {Sider} = Layout;
const {Title, Paragraph, Text} = Typography;

// SideBar component
const SideBar = ({onMenuSelect, selectedItem}) => {
    // Use the custom theme hook
    const {theme, toggleTheme} = useTheme();
    // State for today's data
    const [today, setToday] = useState(null);
    // State for the user's name, initially loaded from local storage
    const [userName, setUserName] = useState(
        JSON.parse(localStorage.getItem("userName"))
    );
    // State for the last process data
    const [lastProcess, setLastProcess] = useState([]);
    // State for the distractions data
    const [distractions, setDistractions] = useState([]); // Array with all Distractions
    // Define a common style for all icons
    const iconStyle = {fontSize: "18px"};

    // Define the items for the sidebar
    const sidebaritems = [
        {
            key: "dashboard",
            icon: <DashboardOutlined style={iconStyle}/>,
            label: "Dashboard",
        },
        {key: "goals", icon: <AimOutlined style={iconStyle}/>, label: "Goals"},
        {
            key: "settings",
            icon: <SettingOutlined style={iconStyle}/>,
            label: "Settings",
        },
    ];

    useEffect(() => {
        // check if localstorage processFlow exists
        const fetchData = async () => {
            try {
                const response = await makeRequest("GET", PROCESSFLOW);

                // check if response is empty object
                if (Object.keys(response).length !== 0) {
                    const periods = calculatePeriods(response);
                    setToday(periods);
                } else {
                    localStorage.removeItem("processFlow");
                }
            } catch (e) {
                console.log(e);
            }
        };
        fetchData();
    }, []);

    // Effect hook to update the user's name from local storage every second
    useEffect(() => {
        // Set an interval to run every second
        const interval = setInterval(() => {
            // Get the current user's name from local storage
            const currentUserName = localStorage.getItem("userName");
            // If the current user's name is different from the one in state, update the state
            if (currentUserName !== userName) {
                setUserName(currentUserName);
            }
        }, 1000);

        // Clear the interval when the component is unmounted
        return () => clearInterval(interval);
    }, [userName]); // Depend on the userName state

    // Effect hook to update the process flow data every second
    useEffect(() => {
        // Set an interval to run every second
        const interval = setInterval(() => {
            // Get the current process flow data from local storage
            const currentProcessFlow = localStorage.getItem("processFlow");
            // Parse the process flow data
            const preparedProcessFlow = JSON.parse(currentProcessFlow);
            // If the current process flow data is different from the last one, update the state
            if (
                !deepCompareArrays(
                    calculatePeriods(preparedProcessFlow),
                    calculatePeriods(lastProcess)
                )
            ) {
                // Calculate the periods from the process flow data
                const periods = calculatePeriods(preparedProcessFlow);
                // Update the today and lastProcess states
                setToday(periods);
                setLastProcess(preparedProcessFlow);
            }
        }, 1000);

        // Clear the interval when the component is unmounted
        return () => clearInterval(interval);
    }, [today]); // Depend on the today state

    // Effect hook to fetch the distractions data
    useEffect(() => {
        // Define the function to fetch the data
        const fetchData = async () => {
            try {
                // Make a GET request to the TRACKJSON endpoint
                const response = await makeRequest("GET", TRACKJSON);

                // Merge the distractions from the response
                const distractions = mergeDistractions(response);

                // Update the distractions state
                setDistractions(distractions);

                // Store the distractions in local storage
                localStorage.setItem("distractions", JSON.stringify(distractions));
            } catch (e) {
                // Log any errors
                console.log(e);
            }
        };

        // Call the fetchData function immediately on component mount
        fetchData();

        // Set an interval to fetch the data every second
        const interval = setInterval(fetchData, 1000);

        // Clear the interval when the component is unmounted
        return () => clearInterval(interval);
    }, [today]); // Depend on the today state

    // Function to merge distractions
    const mergeDistractions = (newContent) => {
        // Initialize an array to store the distractions
        const distractions = [];

        // Loop over the keys in the new content
        for (const key in newContent) {
            // For each item in the current key
            newContent[key].forEach(
                ({"Start time": startTime, "Stop time": stopTime}) => {
                    // Push a new distraction to the array
                    distractions.push({
                        // Format the time string
                        time: `${startTime} - ${stopTime}`,
                        title: "Distractions",
                        color: "rgba(240, 128, 128, 0.8)",
                    });
                }
            );
        }

        // Return the distractions
        return distractions;
    };

    // Function to format the time string
    function formatTime(timeString) {
        // Return the time string without the seconds
        return timeString.substring(0, 5);
    }

    // Function to deeply compare two arrays
    const deepCompareArrays = (arr1, arr2) => {
        // If the arrays have different lengths, they are not equal
        if (arr1.length !== arr2.length) {
            return false;
        }

        // Loop over the items in the arrays
        for (let i = 0; i < arr1.length; i++) {
            // If any item is different, the arrays are not equal
            if (
                arr1[i].time !== arr2[i].time ||
                arr1[i].title !== arr2[i].title ||
                arr1[i].color !== arr2[i].color
            ) {
                return false;
            }
        }

        // If all items are equal, the arrays are equal
        return true;
    };

    // Function to calculate the periods
    function calculatePeriods(data) {
        // Initialize an array to store the periods
        let periods = [];
        // Initialize variables to store the last time and process
        let lastTime = null;
        let lastProcess = null;

        if (data === null) {
            return [];
        }

        // If the data length is odd, remove the last item
        if (data.length % 2 !== 0) {
            data.pop();
        }

        // Loop over the items in the data
        data.forEach((item) => {
            // If there is a last time
            if (lastTime) {
                // Determine the period type based on the last process
                let periodType = lastProcess === "start" ? "Work" : "Break";
                // Determine the color based on the period type
                let color =
                    periodType === "Work"
                        ? "rgba(126,211,127,0.80)"
                        : "rgba(85, 100, 255, 0.8)";
                // Push a new period to the array
                periods.push({
                    // Format the time range
                    time: `${formatTime(lastTime)} - ${formatTime(item.time)}`,
                    // Set the title to the period type
                    title: periodType,
                    // Set the color
                    color: color,
                });
            }
            // Update the last time and process
            lastTime = item.time;
            lastProcess = item.process;
        });

        // Return the periods
        return periods;
    }

    // Combine the today and distractions arrays and sort them
    const combinedEvents = [...(today || []), ...(distractions || [])].sort(
        (a, b) => {
            // Extract the start times from the time ranges and truncate to HH:MM if necessary
            let startTimeA = a.time.split(" - ")[0].slice(0, 5);
            let startTimeB = b.time.split(" - ")[0].slice(0, 5);

            // Convert the times to numbers for comparison
            let secondsA = startTimeA
                .split(":")
                .reduce((acc, time) => 60 * acc + +time, 0);
            let secondsB = startTimeB
                .split(":")
                .reduce((acc, time) => 60 * acc + +time, 0);

            // Check if the start times are equal and if it is a distraction and a break
            if (secondsA === secondsB) {
                if (a.title === "Distractions" && b.title === "Break") {
                    return -1;
                } else if (b.title === "Distractions" && a.title === "Break") {
                    return 1;
                }
            }

            // Compare the times
            return secondsA - secondsB;
        }
    );


    function formatTimeForm(time) {
        // Check, if the format is HH:MM:SS - HH:MM:SS
        if (time.includes(":") && time.length > 13) {
            // Split the string by ' - ' and delete the seconds
            return time.split(' - ').map(t => t.slice(0, 5)).join(' - ');
        }
        return time;
    }

    // Map the combined events to JSX elements
    const eventItems = combinedEvents.map((event, index) => (
        // Create a div for each event
        <div key={index} className="event-item" style={{position: "relative"}}>

      <span
          className="event-dot"
          style={{backgroundColor: event.color}}
      ></span>

            <Text
                strong
                style={{color: theme === "dark" ? "white" : "rgba(0, 0, 0, 0.85)"}}
            >
                {event.title}
            </Text>

            <Text
                className="event-time"
                style={{color: theme === "dark" ? "white" : "rgba(0, 0, 0, 0.85)"}}
            >
                {formatTimeForm(event.time)}
            </Text>
        </div>
    ));

    // Return the layout for the sidebar
    return (
        <Layout>

            <Sider
                width={300}
                style={{
                    height: "100vh",
                    minWidth: "300px",
                    position: "fixed",
                    left: 0,
                    top: 0,
                    // Set the background color based on the theme
                    backgroundColor: theme === "dark" ? "#2b2b2d" : "#f4f4f6",
                    transition: "background-color 0.4s ease, color 0.4s ease",
                }}
            >

                <Space direction="vertical" size={50} style={{width: "100%"}}>

                    <div
                        style={{display: "flex", alignItems: "center", margin: "16px"}}
                    >

                        <Avatar size="large" icon={<UserOutlined/>}/>

                        <span
                            style={{
                                marginLeft: "10px",
                                color: theme === "dark" ? "white" : "rgba(0, 0, 0, 0.85)",
                            }}
                        >

              {JSON.parse(localStorage.getItem("userName"))}
            </span>
                    </div>

                    <Menu
                        // Handle menu item selection
                        onClick={(item) => onMenuSelect(item.key)}
                        // Set the theme of the menu
                        theme={theme}
                        style={{
                            // Transition the background color and color
                            transition: "background-color 0.4s ease, color 0.4s ease",
                            // Set the background color based on the theme
                            backgroundColor: theme === "dark" ? "#2b2b2d" : "#f4f4f6",
                            // Align the text to the left
                            textAlign: "left",
                            // Set the font size
                            fontSize: {iconStyle},
                        }}
                        // Set the mode of the menu
                        mode="inline"
                        // Set the default selected key
                        defaultSelectedKeys={[selectedItem]}
                        // Map the sidebar items to menu items
                        items={sidebaritems.map((item) => ({
                            ...item,
                            style: {
                                padding: "22px 10px",
                            },
                        }))}
                    />

                    <div>

                        <Paragraph
                            style={{
                                color: theme === "dark" ? "white" : "rgba(0, 0, 0, 0.85)",
                                textAlign: "left",
                                marginLeft: "14px",
                                fontWeight: "bold",
                                letterSpacing: ".1rem",
                            }}
                        >
                            TODAY
                        </Paragraph>

                        <div className="custom-events">{eventItems}</div>
                    </div>
                </Space>

                <Paragraph
                    style={{
                        color: theme === "dark" ? "white" : "rgba(0, 0, 0, 0.85)",
                        position: "absolute",
                        bottom: "0px",
                        left: "16px",
                    }}
                >
                    © 2024 TaskVue
                </Paragraph>
            </Sider>
        </Layout>
    );
};

export default SideBar;
