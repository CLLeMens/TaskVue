import React, {useEffect, useState} from 'react';
import moment from 'moment';
import {Bar} from "react-chartjs-2";
import dayjs from "dayjs";
import {ConfigProvider, DatePicker, Typography} from "antd";
import locale from "antd/es/locale/de_DE";
import {useTheme} from "../context/ThemeContext.jsx";
import {makeRequest} from "../api/api.js";
import {MONTHSCORES, PROCESSFLOW_WEEK, TRACKWEEK} from "../api/endpoints.js";

const {Title} = Typography;


const Productivity = ({week}) => {
    const {theme, toggleTheme} = useTheme();

    const [currentDate, setCurrentDate] = useState(moment());

    const startDay = currentDate.clone().startOf('month').startOf('week');
    const endDay = currentDate.clone().endOf('month').endOf('week').add(1, 'day');
    const currentWeek = dayjs().week();
    const [weekStatistics, setWeekStatistics] = useState([]);
    const [weekDistractions, setWeekDistractions] = useState([]);
    const [labels, setLabels] = useState(); // Initialisiere die Labels basierend auf der aktuellen Woche
    const [monthScores, setMonthScores] = useState([]);

    useEffect(() => {

        const fetchData = async () => {
            try {
                const year = currentDate.year();

                const weekNumber = currentDate.week() - 1;

                const formattedWeek = `${year}-${weekNumber.toString().padStart(2, '0')}`;

                const response = await makeRequest('GET', PROCESSFLOW_WEEK, {'date': formattedWeek});
                setWeekStatistics(response);
            } catch (error) {
                console.log(error);
            }
        }
        fetchData();

        setLabels(generateLabelsForWeek(currentWeek));
    }, [])


    useEffect(() => {
        const fetchData = async () => {
            try {
                const year = currentDate.year();

                const weekNumber = currentDate.week() - 1;

                const formattedWeek = `${year}-${weekNumber.toString().padStart(2, '0')}`;

                const response = await makeRequest('GET', TRACKWEEK, {'date': formattedWeek});
                setWeekDistractions(response);
            } catch (e) {
                console.log(e);
            }
        }

        fetchData();
    }, [])


    useEffect(() => {
        const fetchData = async () => {
            try {
                const year = currentDate.year();

                const monthNumber = currentDate.month() + 1;

                const formattedMonth = `${year}-${monthNumber.toString().padStart(2, '0')}`;

                const response = await makeRequest('GET', MONTHSCORES, {'date': formattedMonth});
                setMonthScores(response);
            } catch (e) {
                console.log(e)
            }
        }
        fetchData()
    }, []);


    const handleWeekChange = async (date) => {
        if (date) {
            const year = date.year();
            const weekNumber = date.week();
            const formattedWeek = `${year}-${weekNumber.toString().padStart(2, '0')}`;

            try {
                const response = await makeRequest('GET', PROCESSFLOW_WEEK, {'date': formattedWeek});
                setWeekStatistics(response);
            } catch (error) {
                console.log(error);
            }

            try {
                const response = await makeRequest('GET', TRACKWEEK, {'date': formattedWeek});
                setWeekDistractions(response);
            } catch (e) {
                console.log(e);
            }

            if (date) {
                setLabels(generateLabelsForWeek(date.week()));
            }

        }
    };


    const getTextStyle = () => ({
        color: theme === 'dark' ? '#ffffff' : 'black',
    });
    const getBackgroundStyle = () => ({
        backgroundColor: theme === 'dark' ? '#2b2b2d' : '#f4f4f6',
    });

    const daysArray = () => {
        const days = [];
        // Start am ersten Tag des Monats
        let day = currentDate.clone().startOf('month');

        // Ermitteln des Wochentags des ersten Tages des Monats
        let firstDayOfWeek = day.day();

        // Wenn der erste Tag des Monats ein Sonntag ist, setze firstDayOfWeek auf 7 (für europäische Kalender)
        firstDayOfWeek = firstDayOfWeek === 0 ? 7 : firstDayOfWeek;

        // Füge leere Tage hinzu, wenn der Monat nicht mit Montag beginnt (angepasst für europäische Kalender)
        for (let i = 1; i < firstDayOfWeek; i++) {
            days.push(null);
        }

        // Füge die tatsächlichen Tage des Monats hinzu
        while (day.month() === currentDate.month()) {
            days.push(day.clone());
            day = day.add(1, 'day');
        }

        return days;
    };


    const previousMonth = () => {
        setCurrentDate(prev => prev.clone().subtract(1, 'month'));
    };

    const nextMonth = () => {
        setCurrentDate(prev => prev.clone().add(1, 'month'));
    };

    const isToday = (day) => {
        return day.isSame(moment(), 'day');
    };


    // Funktion, um den Produktivitätslevel zu bestimmen (dies ist nur ein Platzhalter)
    const getProductivityLevel = day => {
        const score = monthScores[day.date() - 1];

        if (score === -1) return 'none'
        if (score < 0.5) return 'low';
        if (score < 0.75) return 'medium';
        return 'high';

    };


    // Diese Funktion generiert die Labels für die gegebene Woche
    const generateLabelsForWeek = (week) => {
        const year = dayjs().week(week).year();
        let firstDayOfWeek = dayjs().year(year).week(week).startOf('week');
        const weekLabels = [];
        for (let i = 0; i < 7; i++) {
            weekLabels.push(firstDayOfWeek.add(i, 'day').format('DD.MM'));
        }
        return weekLabels;
    };

    // Konfiguration für das Balkendiagramm
    const barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,

        plugins: {
            legend: {
                display: true,
                position: 'right'
            },
            title: {
                display: false,
                text: 'Aktivitätsgraph'
            },
        },
    };


    function calculateTotalHours(events) {
        let totalSeconds = 0;

        try {
            Object.values(events).forEach(eventList => {
                eventList.forEach(event => {
                    const {"Start time": startTime, "Stop time": stopTime} = event;
                    const [startHours, startMinutes, startSeconds] = startTime.split(':').map(Number);
                    const [endHours, endMinutes, endSeconds] = stopTime.split(':').map(Number);

                    const startTotalSeconds = startHours * 3600 + startMinutes * 60 + startSeconds;
                    const endTotalSeconds = endHours * 3600 + endMinutes * 60 + endSeconds;

                    // Berechne die Differenz in Sekunden
                    totalSeconds += endTotalSeconds - startTotalSeconds;
                });
            });

            // Umwandlung der Gesamtzeit von Sekunden in Stunden
            return (totalSeconds / 3600).toFixed(2);
        } catch (e) {
            return 0;
        }
    }


    const dataBarChart = {
        labels,
        datasets: [
            {
                label: 'Work',
                data: weekStatistics.map(day => day.work),
                backgroundColor: 'rgba(126,211,127,0.80)',
                borderRadius: 4,

            },
            {
                label: 'Distractions',
                data: weekDistractions.map(day => calculateTotalHours(day)),
                backgroundColor: 'rgba(240, 128, 128, 0.8)',
                borderRadius: 4,

            },
            {
                label: 'Breaks',
                data: weekStatistics.map(day => day.break),
                backgroundColor: 'rgba(85, 100, 255, 0.8)',
                borderRadius: 4,
            },
        ],
    };

    return (
        <div style={{minWidth: '100%'}}>
            <div className="calendar-container" style={{...getTextStyle(), ...getBackgroundStyle()}}>
                <div style={{display: 'flex', minWidth: '100%', justifyContent: 'space-between'}}>
                    <button className="month-switch" onClick={previousMonth}
                            style={{...getTextStyle(), ...getBackgroundStyle()}}>{"<"}</button>
                    <div className="month-display"
                         style={{...getTextStyle(), ...getBackgroundStyle()}}>{currentDate.format('MMMM YYYY')}</div>
                    <button className="month-switch" onClick={nextMonth}
                            style={{...getTextStyle(), ...getBackgroundStyle()}}>{">"}</button>
                </div>


                <div className="days-of-week" style={{...getTextStyle(), ...getBackgroundStyle()}}>
                    {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
                        <div className="day-of-week" key={day}>{day}</div>
                    ))}
                </div>

                <div className="date-grid">
                    {daysArray().map((day, index) => (
                        <div
                            key={index}
                            className={
                                `day ${day && day.isSame(currentDate, 'month') ? '' : 'not-this-month'} ${day ? getProductivityLevel(day) : ''} ${day && isToday(day) ? 'today' : ''}`
                            }
                        >
                            {day ? day.date() : ''}
                        </div>
                    ))}
                </div>
            </div>
            <div style={{maxWidth: '70%', minWidth: '70%', position: 'absolute', bottom: '20px'}}>
                <div style={{display: 'flex', flexDirection: "row", minWidth: '100%'}}>
                    <Title level={5} style={{
                        ...getTextStyle(),
                        textAlign: 'left',
                        margin: '30px 0 30px 24px',
                        display: 'flex',
                        alignItems: 'center'
                    }}>Activity
                        Chart</Title>
                    <div style={{

                        display: 'flex',
                        justifyContent: 'flex-start',
                        margin: '30px auto 30px 30px'
                    }}>
                        <ConfigProvider locale={locale}>
                            <DatePicker
                                placeholder="Select week"
                                onChange={handleWeekChange}
                                picker="week"

                                style={{marginLeft: '23px', marginRight: 'auto'}}
                                defaultValue={dayjs().week(currentWeek)}
                            />
                        </ConfigProvider>
                    </div>
                </div>
                <div className={'chart-wrapper'}>
                    <Bar options={barChartOptions} data={dataBarChart}/>
                </div>
            </div>

        </div>
    )
        ;
};

export default Productivity;
