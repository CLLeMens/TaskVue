import {Badge, ConfigProvider, DatePicker, List, Tag, Typography} from "antd";
import React, {useEffect, useState} from "react";
import dayjs from "dayjs";
import {Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title as TitleJS, Tooltip, Legend} from 'chart.js';
import locale from "antd/es/locale/en_GB";

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
    const currentWeek = dayjs().week();



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


    return (
        <div className="site-layout-content" style={{margin: '16px 0', minWidth: '100%'}}>
            <div style={{flex: 1, display: 'flex', justifyContent: 'flex-end', minWidth: '100%', margin: '30px 0 30px auto'}}>
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


        </div>

    )
}

export default History
