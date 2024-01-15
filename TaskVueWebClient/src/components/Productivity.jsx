import React, { useEffect, useState } from "react";
import moment from "moment";
import { Bar } from "react-chartjs-2";
import dayjs from "dayjs";
import { ConfigProvider, DatePicker, Typography } from "antd";
import locale from "antd/es/locale/de_DE";
import { useTheme } from "../context/ThemeContext.jsx";
import { makeRequest } from "../api/api.js";
import { MONTHSCORES, PROCESSFLOW_WEEK, TRACKWEEK } from "../api/endpoints.js";

const { Title } = Typography;

const Productivity = ({ week }) => {
  const { theme, toggleTheme } = useTheme();

  const [currentDate, setCurrentDate] = useState(moment());

  const startDay = currentDate.clone().startOf("month").startOf("week");
  const endDay = currentDate.clone().endOf("month").endOf("week").add(1, "day");
  const currentWeek = dayjs().week();
  const [weekStatistics, setWeekStatistics] = useState([]);
  const [weekDistractions, setWeekDistractions] = useState([]);
  const [labels, setLabels] = useState(); // Initialize the labels based on the actual week
  const [monthScores, setMonthScores] = useState([]);

  // Effect to fetch week statistics
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Format the week number
        const year = currentDate.year();
        const weekNumber = currentDate.week() - 1;
        const formattedWeek = `${year}-${weekNumber
          .toString()
          .padStart(2, "0")}`;

        // Make request to get week statistics
        const response = await makeRequest("GET", PROCESSFLOW_WEEK, {
          date: formattedWeek,
        });
        setWeekStatistics(response);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();

    // Generate labels for the week
    setLabels(generateLabelsForWeek(currentWeek));
  }, []);

  // Effect to fetch week distractions
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Format the week number
        const year = currentDate.year();
        const weekNumber = currentDate.week() - 1;
        const formattedWeek = `${year}-${weekNumber
          .toString()
          .padStart(2, "0")}`;

        // Make request to get week distractions
        const response = await makeRequest("GET", TRACKWEEK, {
          date: formattedWeek,
        });
        setWeekDistractions(response);
      } catch (e) {
        console.log(e);
      }
    };

    fetchData();
  }, []);

  // Effect to fetch month scores
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Format the month number
        const year = currentDate.year();
        const monthNumber = currentDate.month() + 1;
        const formattedMonth = `${year}-${monthNumber
          .toString()
          .padStart(2, "0")}`;

        // Make request to get month scores
        const response = await makeRequest("GET", MONTHSCORES, {
          date: formattedMonth,
        });
        setMonthScores(response);
      } catch (e) {
        console.log(e);
      }
    };
    fetchData();
  }, [currentDate]);

  // Function to handle week change
  const handleWeekChange = async (date) => {
    // If a date is provided
    if (date) {
      // Extract the year and week number from the date
      const year = date.year();
      const weekNumber = date.week();
      // Format the week as a string
      const formattedWeek = `${year}-${weekNumber.toString().padStart(2, "0")}`;

      // Try to fetch the week statistics
      try {
        const response = await makeRequest("GET", PROCESSFLOW_WEEK, {
          date: formattedWeek,
        });
        // Update the week statistics state
        setWeekStatistics(response);
      } catch (error) {
        console.log(error);
      }

      // Try to fetch the week distractions
      try {
        const response = await makeRequest("GET", TRACKWEEK, {
          date: formattedWeek,
        });
        // Update the week distractions state
        setWeekDistractions(response);
      } catch (e) {
        console.log(e);
      }

      // If a date is provided, generate labels for the week
      if (date) {
        setLabels(generateLabelsForWeek(date.week()));
      }
    }
  };

  // Function to get text style based on theme
  const getTextStyle = () => ({
    color: theme === "dark" ? "#ffffff" : "black",
  });

  // Function to get background style based on theme
  const getBackgroundStyle = () => ({
    backgroundColor: theme === "dark" ? "#2b2b2d" : "#f4f4f6",
  });

  // Function to generate an array of days in the current month
  const daysArray = () => {
    const days = [];
    // Start at the first day of the month
    let day = currentDate.clone().startOf("month");

    // Determine the weekday of the first day of the month
    let firstDayOfWeek = day.day();

    // If the first day of the month is a Sunday, set firstDayOfWeek to 7 (for European calendars)
    firstDayOfWeek = firstDayOfWeek === 0 ? 7 : firstDayOfWeek;

    // Add empty days if the month does not start with Monday (adjusted for European calendars)
    for (let i = 1; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    // Add the actual days of the month
    while (day.month() === currentDate.month()) {
      days.push(day.clone());
      day = day.add(1, "day");
    }

    return days;
  };

  // Function to get to the previous month
  const previousMonth = () => {
    setCurrentDate((prev) => prev.clone().subtract(1, "month"));
  };
  // Function to get to the next month
  const nextMonth = () => {
    setCurrentDate((prev) => prev.clone().add(1, "month"));
  };
  // Function to check if the provided day is today
  const isToday = (day) => {
    return day.isSame(moment(), "day");
  };

  // Function to determine the productivity level (this is just a placeholder)
  const getProductivityLevel = (day) => {
    // Get the score for the day
    const score = monthScores[day.date() - 1];

    // Determine the productivity level based on the score
    if (score === -1) return "none";
    if (score < 0.5) return "low";
    if (score < 0.75) return "medium";
    return "high";
  };

  // Function to generate the labels for the given week
  const generateLabelsForWeek = (week) => {
    // Get the year for the week
    const year = dayjs().week(week).year();
    // Get the first day of the week
    let firstDayOfWeek = dayjs().year(year).week(week).startOf("week");
    const weekLabels = [];
    // Generate labels for each day of the week
    for (let i = 0; i < 7; i++) {
      weekLabels.push(firstDayOfWeek.add(i, "day").format("DD.MM"));
    }
    return weekLabels;
  };

  // Configuration for the bar chart
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "right",
      },
      title: {
        display: false,
        text: "Activity graph",
      },
    },
  };

  // Function to calculate total hours from a list of events
  function calculateTotalHours(events) {
    let totalSeconds = 0;

    // Iterate over each event
    try {
      Object.values(events).forEach((eventList) => {
        eventList.forEach((event) => {
          // Split the time string into start and end times
          const { "Start time": startTime, "Stop time": stopTime } = event;
          // Split the start and end times into hours, minutes and seconds
          const [startHours, startMinutes, startSeconds] = startTime
            .split(":")
            .map(Number);
          const [endHours, endMinutes, endSeconds] = stopTime
            .split(":")
            .map(Number);

          // Convert the start and end times to total seconds
          const startTotalSeconds =
            startHours * 3600 + startMinutes * 60 + startSeconds;
          const endTotalSeconds =
            endHours * 3600 + endMinutes * 60 + endSeconds;

          // Calculate the difference in seconds and add it to the total
          totalSeconds += endTotalSeconds - startTotalSeconds;
        });
      });

      // Convert the total time from seconds to hours
      return (totalSeconds / 3600).toFixed(2);
    } catch (e) {
      return 0;
    }
  }

  // Define the data for the bar chart
  const dataBarChart = {
    // Use the labels generated for the current week
    labels,
    // Define the datasets for the chart
    datasets: [
      {
        // The 'Work' dataset
        label: "Work",
        // Map the work statistics for each day of the week
        data: weekStatistics.map((day) => day.work),
        // Set the color for the 'Work' dataset
        backgroundColor: "rgba(126,211,127,0.80)",
        // Set the border radius for the bars
        borderRadius: 4,
      },
      {
        // The 'Distractions' dataset
        label: "Distractions",
        // Map the total distraction hours for each day of the week
        data: weekDistractions.map((day) => calculateTotalHours(day)),
        // Set the color for the 'Distractions' dataset
        backgroundColor: "rgba(240, 128, 128, 0.8)",
        // Set the border radius for the bars
        borderRadius: 4,
      },
      {
        // The 'Breaks' dataset
        label: "Breaks",
        // Map the break statistics for each day of the week
        data: weekStatistics.map((day) => day.break),
        // Set the color for the 'Breaks' dataset
        backgroundColor: "rgba(85, 100, 255, 0.8)",
        // Set the border radius for the bars
        borderRadius: 4,
      },
    ],
  };

  return (
    <div style={{ minWidth: "100%" }}>
      <div
        className="calendar-container"
        style={{ ...getTextStyle(), ...getBackgroundStyle() }}
      >
        <div
          style={{
            display: "flex",
            minWidth: "100%",
            justifyContent: "space-between",
          }}
        >
          // Button to go to the previous month
          <button
            className="month-switch"
            onClick={previousMonth}
            style={{ ...getTextStyle(), ...getBackgroundStyle() }}
          >
            {"<"}
          </button>
          // Display the current month and year
          <div
            className="month-display"
            style={{ ...getTextStyle(), ...getBackgroundStyle() }}
          >
            {currentDate.format("MMMM YYYY")}
          </div>
          // Button to go to the next month
          <button
            className="month-switch"
            onClick={nextMonth}
            style={{ ...getTextStyle(), ...getBackgroundStyle() }}
          >
            {">"}
          </button>
        </div>
        <div
          className="days-of-week"
          style={{ ...getTextStyle(), ...getBackgroundStyle() }}
        >
          // Render the days of the week
          {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
            <div className="day-of-week" key={day}>
              {day}
            </div>
          ))}
        </div>
        // Render the grid of dates for the current month
        <div className="date-grid">
          {daysArray().map((day, index) => (
            // For each day, render a div with appropriate classes based on whether the day is in the current month, today, and its productivity level

            <div
              key={index}
              className={`day ${
                day && day.isSame(currentDate, "month") ? "" : "not-this-month"
              } ${day ? getProductivityLevel(day) : ""} ${
                day && isToday(day) ? "today" : ""
              }`}
            >
              {day ? day.date() : ""}
            </div>
          ))}
        </div>
      </div>
      // Render the container for the activity chart
      <div
        style={{
          maxWidth: "70%",
          minWidth: "70%",
          position: "absolute",
          bottom: "20px",
        }}
      >
        // Render the title and week picker for the activity chart
        <div
          style={{ display: "flex", flexDirection: "row", minWidth: "100%" }}
        >
          // Render the title of the activity chart
          <Title
            level={5}
            style={{
              ...getTextStyle(),
              textAlign: "left",
              margin: "30px 0 30px 24px",
              display: "flex",
              alignItems: "center",
            }}
          >
            Activity Chart
          </Title>
          // Render the week picker for the activity chart
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              margin: "30px auto 30px 30px",
            }}
          >
            <ConfigProvider locale={locale}>
              <DatePicker
                placeholder="Select week"
                onChange={handleWeekChange}
                picker="week"
                style={{ marginLeft: "23px", marginRight: "auto" }}
                defaultValue={dayjs().week(currentWeek)}
              />
            </ConfigProvider>
          </div>
        </div>
        // Render the container for the bar chart
        <div className={"chart-wrapper"}>
          // Render the bar chart with the defined options and data
          <Bar options={barChartOptions} data={dataBarChart} />
        </div>
      </div>
    </div>
  );
};

export default Productivity;
