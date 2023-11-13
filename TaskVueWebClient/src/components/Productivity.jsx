import React, {useEffect, useState} from 'react';
import moment from 'moment';
import {Bar} from "react-chartjs-2";
import dayjs from "dayjs";
import {ConfigProvider, DatePicker, Typography} from "antd";
import locale from "antd/es/locale/en_GB";

const {Title} = Typography;


const Productivity = ({week}) => {
    const [theme, setTheme] = useState('light');

    const [currentDate, setCurrentDate] = useState(moment());
    const [defaultDates, setDefaultDates] = useState(week);
    const startDay = currentDate.clone().startOf('month').startOf('week');
    const endDay = currentDate.clone().endOf('month').endOf('week').add(1, 'day');
    const currentWeek = dayjs().week();

    useEffect(() => {

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (e) => {
            setTheme(e.matches ? 'dark' : 'light');
        };

        mediaQuery.addEventListener('change', handleChange);

        handleChange(mediaQuery);

        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const getTextStyle = () => ({
        color: theme === 'dark' ? '#ffffff' : 'black',
    });
    const getBackgroundStyle = () => ({
        backgroundColor: theme === 'dark' ? '#2b2b2d' : '#f4f4f6',
    });

    const daysArray = () => {
        const days = [];
        let day = startDay.clone();

        while (day.isBefore(endDay, 'day')) {
            days.push(day.clone());
            day.add(1, 'day');
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
        // Beispiel: Setzen Sie Ihre eigene Logik hier, um den Produktivitätslevel zu bestimmen
        if (day.date() === 1) return 'low';
        if (day.date() === 30) return 'none';
        if (day.date() === 15) return 'medium';
        if (day.date() === 14) return 'none';
        return 'high';
    };


    // Diese Funktion generiert die Labels für die gegebene Woche
    const generateLabelsForWeek = (week) => {
        // Finde den ersten Tag der gegebenen Woche und das entsprechende Jahr
        const year = dayjs().week(week).year();
        let firstDayOfWeek = dayjs().year(year).week(week).startOf('week');

        // Erstelle ein Array für die Labels
        const labels = [];

        // Füge jeden Tag der Woche zum Array hinzu
        for (let i = 0; i < 7; i++) {
            labels.push(firstDayOfWeek.add(i, 'day').format('DD.MM'));
        }

        return labels;
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

    // Setze die Labels für das Diagramm
    const labels = generateLabelsForWeek(week);

    const dataBarChart = {
        labels,
        datasets: [
            {
                label: 'Work',
                data: [5, 6, 7, 8, 5, 4, 3], // Beispielwerte für Arbeitszeit
                backgroundColor: 'rgba(126,211,127,0.80)',
                borderRadius: 4,

            },
            {
                label: 'Distractions',
                data: [1, 2, 1, 3, 2, 1, 2], // Beispielwerte für Ablenkungen
                backgroundColor: 'rgba(240, 128, 128, 0.8)',
                borderRadius: 4,

            },
            {
                label: 'Breaks',
                data: [2, 1, 2, 1, 2, 3, 2], // Beispielwerte für Pausen
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
                    {daysArray().map(day => (
                        <div
                            key={day}
                            className={
                                `day ${day.isSame(currentDate, 'month') ? '' : 'not-this-month'} ${getProductivityLevel(day)} ${isToday(day) ? 'today' : ''}`
                            }
                        >
                            {day.date()}
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
                                onChange={e => setDefaultDates(dayjs(e).week())}
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
