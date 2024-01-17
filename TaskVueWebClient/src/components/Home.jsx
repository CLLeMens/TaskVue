import React, { useState, useEffect } from "react";
import { Layout, Button, Card, Tag, Modal, Divider, Typography } from "antd";
import { InfoCircleTwoTone } from "@ant-design/icons";
import { useTheme } from "../context/ThemeContext.jsx";
import { makeRequest } from "../api/api.js";
import { GETHOMEINFO, PROCESSFLOW, TIMER } from "../api/endpoints.js";

const { Title } = Typography;

const Home = () => {
  // Using theme from useTheme hook
  const { theme, toggleTheme } = useTheme();
  // State variables for various time tracking and modal visibility
  const [information, setInformation] = useState(null);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [pauseTime, setPauseTime] = useState(0);
  const [workedTime, setWorkedTime] = useState(0);
  const [pauseDuration, setPauseDuration] = useState(0);
  const [breakTime, setBreakTime] = useState(0);
  const [processFlowState, setProcessFlowState] = useState([]);
  const [workBreakTimes, setWorkBreakTimes] = useState(null);
  // Effect hook to periodically check local storage for process flow data
  useEffect(() => {
    const interval = setInterval(() => {
      const storedProcessFlow = localStorage.getItem("processFlow");
      if (storedProcessFlow) {
        const parsedData = JSON.parse(storedProcessFlow);
        setProcessFlowState(parsedData);
      }
    }, 500);
    // Cleanup function to clear the interval
    return () => clearInterval(interval);
  }, []);
  // Effect hook to update work and break times when process flow state changes
  useEffect(() => {
    setWorkBreakTimes(calculateWorkAndBreakTime(processFlowState));
  }, [processFlowState]);

  useEffect(() => {
    // Set target time (e.g., 15:00)
    const targetHour = 0;
    const targetMinute = 0;

    // Get current date and time
    const now = new Date();
    const targetTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      targetHour,
      targetMinute
    );

    // If target time has already passed today, set it for tomorrow
    if (targetTime < now) {
      targetTime.setDate(targetTime.getDate() + 1);
    }

    // Calculate how long to wait (in milliseconds)
    const timeout = targetTime.getTime() - now.getTime();

    // Set timeout to execute function at set time
    const timer = setTimeout(() => {
      localStorage.removeItem("processFlow");
      // Here you can perform additional actions
    }, timeout);

    // Cleanup function to clear the timer in case the component is unmounted
    return () => clearTimeout(timer);
  }, []);
  // Effect hook to restore timer from local storage when component mounts
  useEffect(() => {
    const savedTimer = JSON.parse(localStorage.getItem("timer"));
    if (savedTimer) {
      setStartTime(new Date(savedTimer.startTime));

      setIsRunning(savedTimer.isRunning);
      setPauseTime(savedTimer.pauseTime);
      if (savedTimer.breakTime) {
        setBreakTime(new Date(savedTimer.breakTime));
      }

      let calc_timer;
      if (savedTimer.isRunning) {
        // If timer is running, calculate the time since the start minus the pause time
        calc_timer =
          new Date() -
          new Date(savedTimer.startTime) -
          savedTimer.pauseTime * 1000;
      } else {
        // If timer is not running, calculate the time until the last stop (breakTime) minus the pause time
        calc_timer =
          new Date(savedTimer.breakTime) -
          new Date(savedTimer.startTime) -
          savedTimer.pauseTime * 1000;
      }
      setTimer(Math.floor(calc_timer / 1000));
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await makeRequest("GET", GETHOMEINFO);
        setInformation(response);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  // Timer-Functions
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setTimer((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Functions to stop and start the Timers
  const startTimer = async () => {
    try {
      const response = await makeRequest("GET", TIMER, { method: "start" });
    } catch (error) {
      console.log(error);
    }

    const startTime = new Date();
    setIsRunning(true);
    setStartTime(startTime);
    // Store timer state in local storage
    localStorage.setItem(
      "timer",
      JSON.stringify({
        startTime: startTime,
        isRunning: true,
        pauseTime: pauseTime,
      })
    );
    processFlow("start");
  };

  // Function to stop the timer
  const stopTimer = () => {
    // Set running state to false and reset timer
    setIsRunning(false);
    setTimer(0);
    // Remove timer data from local storage
    localStorage.removeItem("timer");
    // Update pause duration and worked time states
    const newPauseDuration = pauseTime;
    setWorkedTime(timer);
    setPauseDuration(newPauseDuration);
    // Show the modal
    setIsModalVisible(true);

    // Reset timer, pause time, and start time states
    setTimer(0);
    setPauseTime(0);
    setStartTime(null);

    // Update process flow with "stop" event
    processFlow("stop");

    // Function to send process flow data to server and stop the timer on the server
    const fetchData = async () => {
      try {
        // Send process flow data to server
        await makeRequest(
          "POST",
          PROCESSFLOW,
          JSON.parse(localStorage.getItem("processFlow"))
        );
      } catch (error) {
        console.log(error);
      }
      try {
        // Send stop command to server
        const response = await makeRequest("GET", TIMER, { method: "stop" });
      } catch (error) {
        console.log(error);
      }
    };

    // Execute the fetchData function
    fetchData();
  };

  // Function to toggle the timer
  const toggleTimer = async (process) => {
    // Toggle running state
    setIsRunning(!isRunning);
    if (!isRunning) {
      // Calculate pause time in whole seconds
      let additionalPauseTime = Math.floor((new Date() - breakTime) / 1000);

      try {
        // Send start command to server
        const response = await makeRequest("GET", TIMER, { method: "start" });
      } catch (error) {
        console.log(error);
      }

      // Update pause time and start time states
      setPauseTime(pauseTime + additionalPauseTime);
      setStartTime(new Date());
      // Store timer data in local storage
      localStorage.setItem(
        "timer",
        JSON.stringify({
          startTime: startTime,
          isRunning: true,
          pauseTime: pauseTime + additionalPauseTime,
          breakTime: breakTime,
        })
      );
    } else {
      try {
        // Send stop command to server
        const response = await makeRequest("GET", TIMER, { method: "stop" });
      } catch (error) {
        console.log(error);
      }
      // Update break time state and store timer data in local storage
      setBreakTime(new Date());
      localStorage.setItem(
        "timer",
        JSON.stringify({
          startTime: startTime,
          isRunning: false,
          pauseTime: pauseTime,
          breakTime: new Date(),
        })
      );
    }
    processFlow(process);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  // Format the Timer-Display
  const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;

    return (
      <>
        {hours.toString().padStart(2, "0")}
        <span
          style={{
            color: "inherit",
            fontSize: "2rem",
            margin: "0 0.2rem",
          }}
        >
          :
        </span>
        {minutes.toString().padStart(2, "0")}
        <span
          style={{
            color: "inherit",
            fontSize: "2rem",
            margin: "0 0.2rem",
          }}
        >
          :
        </span>
        <span style={{ color: "grey", fontSize: "0.75em" }}>
          {seconds.toString().padStart(2, "0")}
        </span>
      </>
    );
  };

  const processFlow = (process) => {
    // check if localstorage with the key 'processFlow' exists if not create it
    if (!localStorage.getItem("processFlow")) {
      localStorage.setItem("processFlow", JSON.stringify([]));
    }

    //get the current process flow from localstorage
    const processFlow = JSON.parse(localStorage.getItem("processFlow"));

    //create a new process object
    const newProcess = {
      process: process,
      // time in HH:MM formal
      time: new Date().toLocaleTimeString(),
    };

    //add the new process to the process flow
    processFlow.push(newProcess);

    //save the new process flow to localstorage
    localStorage.setItem("processFlow", JSON.stringify(processFlow));
  };

  const enabledButtonStyle = {
    minWidth: "100px",
    marginRight: "3.5rem",
  };

  const disabledButtonStyle = {
    ...enabledButtonStyle,
    backgroundColor: "#ccc",
    color: "white",
    cursor: "not-allowed",
  };

  const getFontColor = () => ({
    color: theme === "dark" ? "#ffffff" : null,
  });

  // Function to calculate work and break time from process flow data
  function calculateWorkAndBreakTime() {
    // Retrieve process flow data from local storage
    const dataString = localStorage.getItem("processFlow");
    if (!dataString) {
      // If no data is found, return zero work and break time
      return { work: 0, break: 0 };
    }

    // Parse the JSON data string
    const data = JSON.parse(dataString);
    let workTime = 0;
    let breakTime = 0;
    let lastTime = null;
    let lastProcess = null;

    // Iterate over each entry in the process flow data
    data.forEach((entry) => {
      // Convert the time string to a Date object
      const currentDateTime = new Date(`01/01/2000 ${entry.time}`);
      if (lastTime) {
        // Calculate the time difference in seconds
        const seconds = (currentDateTime - lastTime) / 1000;

        // If the last process was "start" and the current process is "pause" or "stop", add the time to workTime
        if (
          lastProcess === "start" &&
          ["pause", "stop"].includes(entry.process)
        ) {
          workTime += seconds;
        } else if (
          // If the last process was "pause" or "stop" and the current process is "start", add the time to breakTime
          ["pause", "stop"].includes(lastProcess) &&
          entry.process === "start"
        ) {
          breakTime += seconds;
        }
      }

      // Update lastTime and lastProcess for the next iteration
      lastTime = currentDateTime;
      lastProcess = entry.process;
    });

    // Convert workTime and breakTime from seconds to hours, rounded to two decimal places
    const workTimeHours = Math.round((workTime / 3600) * 100) / 100;
    const breakTimeHours = Math.round((breakTime / 3600) * 100) / 100;

    // Return the calculated work and break times
    return { work: workTimeHours, break: breakTimeHours };
  }

  // Function to calculate total hours from a list of events
  function calculateTotalHours(events) {
    let totalSeconds = 0;

    // Iterate over each event
    events.forEach((event) => {
      // Split the time string into start and end times
      const [startTime, endTime] = event.time.split(" - ");
      // Split the start and end times into hours and minutes
      const [startHours, startMinutes] = startTime.split(":").map(Number);
      const [endHours, endMinutes] = endTime.split(":").map(Number);

      // Convert the start and end times to total seconds
      const startTotalSeconds = startHours * 3600 + startMinutes * 60;
      const endTotalSeconds = endHours * 3600 + endMinutes * 60;

      // Calculate the difference in seconds and add it to the total
      totalSeconds += endTotalSeconds - startTotalSeconds;
    });

    // Convert the total time from seconds to hours
    return totalSeconds / 3600;
  }

  // Render the component
  return (
    <>
      <div style={{ marginTop: "50px", padding: "20px" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginBottom: "20px",
            textAlign: "left",
            minWidth: "100%",
          }}
        >
          <span
            style={{ ...getFontColor(), fontWeight: "bold", fontSize: "22px" }}
          >
            <InfoCircleTwoTone
              twoToneColor="#52c41a"
              style={{ fontSize: "24px", marginRight: "10px" }}
            />{" "}
            Note
          </span>

          <span style={{ ...getFontColor(), marginLeft: "38px" }}>
            The Software is running. To pause or continue click the buttons
            below.
          </span>
        </div>
        <div className={"timer-wrapper"}>
          <Button
            type={"primary"}
            style={enabledButtonStyle}
            onClick={() =>
              isRunning
                ? toggleTimer("pause")
                : timer > 0
                ? toggleTimer("start")
                : startTimer()
            }
          >
            {isRunning ? "Pause" : timer > 0 ? "Continue" : "Start"}
          </Button>

          <Button
            type={"primary"}
            style={timer > 0 ? enabledButtonStyle : disabledButtonStyle}
            onClick={stopTimer}
            disabled={timer === 0}
            danger
          >
            Stop
          </Button>
          <Card className={"timer-card"}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "3rem",
                color: "#242424",
              }}
            >
              {formatTime(timer)}
            </div>
          </Card>
        </div>
        <Divider
          orientation="left"
          style={{ ...getFontColor(), borderColor: "lightgray" }}
        >
          Information
        </Divider>
        <div
          className={"information-wrapper"}
          style={{
            padding: "0 105px 0 0",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <div>
            <Title
              level={4}
              style={{
                textAlign: "left",
                margin: "50px 0 25px 40px",
                color: "#ffffff",
              }}
            >
              Monitoring
            </Title>
            <div
              className={"monitoring-wrapper"}
              style={{
                display: "flex",
                flexDirection: "row",
                minWidth: "100%",
              }}
            >
              <ul
                style={{
                  ...getFontColor(),
                  listStyle: "none",
                  textAlign: "left",
                  marginLeft: "40px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                <li>Smartphone-Detection</li>
                <li>Drowziness-Detection</li>
                <li>Distraction-Detection</li>
                <li>Other People-Detection</li>
              </ul>
              <ul
                style={{
                  listStyle: "none",
                  marginLeft: "40px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                <Tag
                  color={
                    information && information.settings[0].smartphone
                      ? "green"
                      : "red"
                  }
                  style={{
                    textAlign: "center",
                    fontSize: "13px",
                    fontWeight: "bold",
                  }}
                >
                  {information && information.settings[0].smartphone
                    ? "Active"
                    : "Inactive"}
                </Tag>

                <Tag
                  color={
                    information && information.settings[0].fatigue
                      ? "green"
                      : "red"
                  }
                  style={{
                    textAlign: "center",
                    fontSize: "13px",
                    fontWeight: "bold",
                  }}
                >
                  {information && information.settings[0].fatigue
                    ? "Active"
                    : "Inactive"}
                </Tag>

                <Tag
                  color={
                    information && information.settings[0].distractions
                      ? "green"
                      : "red"
                  }
                  style={{
                    textAlign: "center",
                    fontSize: "13px",
                    fontWeight: "bold",
                  }}
                >
                  {information && information.settings[0].distractions
                    ? "Active"
                    : "Inactive"}
                </Tag>

                <Tag
                  color={
                    information && information.settings[0].other_people
                      ? "green"
                      : "red"
                  }
                  style={{
                    textAlign: "center",
                    fontSize: "13px",
                    fontWeight: "bold",
                  }}
                >
                  {information && information.settings[0].other_people
                    ? "Active"
                    : "Inactive"}
                </Tag>
              </ul>
            </div>
          </div>

          <div className={"goals-wrapper"}>
            <Title
              level={4}
              style={{
                textAlign: "left",
                margin: "50px 0 25px 40px",
                color: "#ffffff",
              }}
            >
              Goals
            </Title>
            <div style={{ display: "flex", flexDirection: "row" }}>
              <ul
                style={{
                  ...getFontColor(),
                  listStyle: "none",
                  textAlign: "left",
                  marginLeft: "40px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                <li>Working hours</li>
                <li>Breaks</li>
                <li>Distractions</li>
              </ul>
              <ul
                style={{
                  ...getFontColor(),
                  listStyle: "none",
                  marginLeft: "40px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                <li>
                  {workBreakTimes &&
                    parseFloat(workBreakTimes.work) +
                      parseFloat((timer / 3600).toFixed(2))}
                  h / {information && information.goals[0].workload}h
                </li>
                <li>
                  {workBreakTimes &&
                    parseFloat(workBreakTimes.break) +
                      parseFloat((pauseDuration / 3600).toFixed(2))}
                  h / {information && information.goals[0].breaks}h
                </li>
                <li>
                  {calculateTotalHours(
                    JSON.parse(localStorage.getItem("distractions"))
                  ).toFixed(2)}{" "}
                  / {information && information.goals[0].distractions}h
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Modal title="Work overview" open={isModalVisible} onOk={handleOk}>
        <p style={{ fontSize: "1rem" }}>
          Actual Workload: {formatTime(workedTime)}
        </p>
        <p>Actual Breaks: {formatTime(pauseDuration)}</p>
      </Modal>
    </>
  );
};

export default Home;
