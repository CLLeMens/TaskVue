import {Badge, List, Tag, Typography} from "antd";
import React, {useEffect, useState} from "react";
import dayjs from "dayjs";
import weekOfYear from 'dayjs/plugin/weekOfYear';
import {Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title as TitleJS, Tooltip, Legend} from 'chart.js';
import {Bar} from 'react-chartjs-2';

const {Title} = Typography;

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    TitleJS,
    Tooltip,
    Legend
);


const History = ({week}) => {
    const [theme, setTheme] = useState('light');
    const [defaultDates, setDefaultDates] = useState(week);

    useEffect(() => {
        setDefaultDates(week);
    }, [week]);


    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (e) => {
            setTheme(e.matches ? 'dark' : 'light');
        };

        mediaQuery.addEventListener('change', handleChange);

        handleChange(mediaQuery);

        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);


    // Statische Daten für die Wochentage und deren Status
    const weekData = [
        {date: '11 Sep, 2023', day: 'Monday', status: 'Good', percentage: 80},
        {date: '12 Sep, 2023', day: 'Tuesday', status: 'Good', percentage: 85},
        {date: '13 Sep, 2023', day: 'Wednesday', status: 'Bad', percentage: 50},
        {date: '14 Sep, 2023', day: 'Thursday', status: 'Ok', percentage: 65},
        {date: '15 Sep, 2023', day: 'Friday', status: 'Very Good', percentage: 91},
        {date: '16 Sep, 2023', day: 'Saturday', status: 'Break', percentage: 'Weekend'},
        {date: '17 Sep, 2023', day: 'Sunday', status: 'Break', percentage: 'Weekend'},

    ];

    // Funktion, um den Statusfarbe zu bestimmen
    const getStatusColor = (status) => {
        switch (status) {
            case 'Good':
                return 'green';
            case 'Bad':
                return 'red';
            case 'Ok':
                return 'gold';
            case 'Very Good':
                return 'green';
            default:
                return 'blue';
        }
    };
    // Funktion, um Textfarbstil basierend auf dem Thema zurückzugeben
    const getTextStyle = () => ({
        color: theme === 'dark' ? '#ffffff' : 'black',
    });

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
        maintainAspectRatio: true,
        plugins: {
            legend: {
                display: false,
                position: 'bottom'
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
                label: 'Activity',
                data: [3, 2, 1, 4, 6, 2], // Die Datenpunkte für das Balkendiagramm
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
            // Weitere Datasets können hier hinzugefügt werden
        ],
    };

    const generateWeekLabels = () => {
        const startOfWeek = dayjs().startOf('week');
        const labels = [];

        for (let i = 1; i <= 6; i++) { // Passen Sie die Schleife an, wenn Sie mehr oder weniger Tage möchten
            labels.push(startOfWeek.add(i, 'day').format('DD.MM.'));
        }

        return labels;
    };


    return (
        <div className="site-layout-content" style={{margin: '16px 0', minWidth: '100%'}}>
            <List
                className="history-wrapper"
                itemLayout="horizontal"
                dataSource={weekData}
                style={{minWidth: '100%', ...getTextStyle()}} // Hier wird die Textfarbe für die ganze Liste gesetzt
                renderItem={item => (
                    <List.Item className={'history-element'}>
                        <List.Item.Meta
                            style={{textAlign: 'left'}}
                            avatar={<Badge
                                status={getStatusColor(item.status, theme)}/>} // Anpassen, um das Thema zu berücksichtigen
                            title={<div style={{
                                ...getTextStyle(),
                                fontSize: '11px',
                                letterSpacing: '.15rem'
                            }}>{item.date}</div>}
                            description={<span style={{...getTextStyle(), fontWeight: '900'}}>{item.day}</span>}
                        />
                        <Tag color={getStatusColor(item.status)} style={{
                            ...getTextStyle(),
                            marginRight: '20px',
                            color: getStatusColor(item.status),
                            width: '80px',
                            textAlign: 'center',
                            position: 'absolute',
                            left: '80%',
                            fontWeight: '800'
                        }}>{item.status}</Tag>
                        <div
                            style={{marginLeft: 'auto', ...getTextStyle()}}>{item.percentage}{item.status === 'Break' ? '' : '%'}</div>
                    </List.Item>
                )}
            />
            <Title level={5} style={{...getTextStyle(), textAlign: 'left', margin: '25px 24px 10px 24px'}}>Activity
                Chart</Title>
            <div className={'chart-wrapper'}>
                <Bar options={barChartOptions} data={dataBarChart}/>
            </div>


        </div>

    )
}

export default History
