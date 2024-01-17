import React, {useState, useEffect} from 'react';
import {Layout, Menu, Avatar, Space, Typography, Timeline} from 'antd';
import {
    UserOutlined,
    DashboardOutlined,
    AimOutlined,
    SettingOutlined,
} from '@ant-design/icons';
import {useTheme} from "../context/ThemeContext.jsx";
import {makeRequest} from "../api/api.js";
import {PROCESSFLOW, TRACKJSON} from "../api/endpoints.js";

const {Sider} = Layout;
const {Title, Paragraph, Text} = Typography;


const SideBar = ({onMenuSelect, selectedItem}) => {
    const {theme, toggleTheme} = useTheme();
    const [today, setToday] = useState(null);
    const [userName, setUserName] = useState(JSON.parse(localStorage.getItem('userName')));
    const [lastProcess, setLastProcess] = useState([]);
    const [distractions, setDistractions] = useState([]); // Array mit allen Distractions
    const iconStyle = {fontSize: '18px'}; // Definieren Sie einen gemeinsamen Stil für alle Icons


    const sidebaritems = [
        {key: 'dashboard', icon: <DashboardOutlined style={iconStyle}/>, label: 'Dashboard'},
        {key: 'goals', icon: <AimOutlined style={iconStyle}/>, label: 'Goals'},
        {key: 'settings', icon: <SettingOutlined style={iconStyle}/>, label: 'Settings'},
    ];


    useEffect(() => {
        // check if localstorage processFlow exists
        const fetchData = async () => {
            try {
                const response = await makeRequest('GET', PROCESSFLOW)


                // check if response is empty object
                if (Object.keys(response).length !== 0) {
                    const periods = calculatePeriods(response);
                    setToday(periods);
                } else {
                    localStorage.removeItem('processFlow')
                }

            } catch (e) {
                console.log(e);
            }
        }
        fetchData();

    }, [])


    useEffect(() => {
        const interval = setInterval(() => {
            const currentUserName = localStorage.getItem('userName');
            if (currentUserName !== userName) {
                setUserName(currentUserName);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [userName]);

    useEffect(() => {
        const interval = setInterval(() => {
            const currentProcessFlow = localStorage.getItem('processFlow');
            const preparedProcessFlow = JSON.parse(currentProcessFlow);
            if (!deepCompareArrays(calculatePeriods(preparedProcessFlow), calculatePeriods(lastProcess))) {
                const periods = calculatePeriods(preparedProcessFlow);
                setToday(periods);
                setLastProcess(preparedProcessFlow);

            }
        }, 1000);

        return () => clearInterval(interval);
    }, [today]);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await makeRequest('GET', TRACKJSON);

                const distractions = mergeDistractions(response);

                setDistractions(distractions)

                localStorage.setItem('distractions', JSON.stringify(distractions));


            } catch (e) {
                console.log(e);
            }
        };

        fetchData(); // Call it immediately on component mount

        const interval = setInterval(fetchData, 1000);

        return () => clearInterval(interval); // Clear interval on component unmount
    }, [today]);


    const mergeDistractions = (newContent) => {
        const distractions = [];

        for (const key in newContent) {
            newContent[key].forEach(({'Start time': startTime, 'Stop time': stopTime}) => {
                distractions.push({
                    time: `${startTime.substring(0, 5)} - ${stopTime.substring(0, 5)}`,
                    title: 'Distractions',
                    color: 'rgba(240, 128, 128, 0.8)'
                });
            });
        }

        return distractions;
    };


    function formatTime(timeString) {
        return timeString.substring(0, 5);
    }

    const deepCompareArrays = (arr1, arr2) => {
        if (arr1.length !== arr2.length) {
            return false;
        }

        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i].time !== arr2[i].time || arr1[i].title !== arr2[i].title || arr1[i].color !== arr2[i].color) {
                return false;
            }
        }

        return true;
    };


    function calculatePeriods(data) {
        let periods = [];
        let lastTime = null;
        let lastProcess = null;
        if (!data) {
            return periods;
        }
        if (data.length % 2 !== 0) {
            data.pop();
        }

        data.forEach(item => {
            if (lastTime) {
                let periodType = lastProcess === 'start' ? 'Work' : 'Break';
                let color = periodType === 'Work' ? 'rgba(126,211,127,0.80)' : 'rgba(85, 100, 255, 0.8)';
                periods.push({
                    time: `${formatTime(lastTime)} - ${formatTime(item.time)}`,
                    title: periodType,
                    color: color
                });
            }
            lastTime = item.time;
            lastProcess = item.process;
        });

        return periods;
    }


    const combinedEvents = [...(today || []), ...(distractions || [])].sort((a, b) => {
        // Extrahiere die Startzeit aus den Zeitbereichen.
        let startTimeA = a.time.split(' - ')[0];
        let startTimeB = b.time.split(' - ')[0];

        // Konvertiere die Zeit in eine Zahl für den Vergleich.
        let secondsA = startTimeA.split(':').reduce((acc, time) => (60 * acc) + +time, 0);
        let secondsB = startTimeB.split(':').reduce((acc, time) => (60 * acc) + +time, 0);

        // Überprüfe, ob die Startzeiten gleich sind und ob es sich um 'Break' und 'Distractions' handelt
        if (secondsA === secondsB) {
            if (a.title === 'Distractions' && b.title === 'Break') {
                return -1;
            } else if (b.title === 'Distractions' && a.title === 'Break') {
                return 1;
            }
        }

        return secondsA - secondsB;
    });

    const eventItems = combinedEvents.map((event, index) => (
        <div key={index} className="event-item" style={{position: 'relative'}}>
            <span className="event-dot" style={{backgroundColor: event.color}}></span>
            <Text strong
                  style={{color: theme === 'dark' ? 'white' : 'rgba(0, 0, 0, 0.85)'}}>{event.title}</Text>
            <Text className="event-time"
                  style={{color: theme === 'dark' ? 'white' : 'rgba(0, 0, 0, 0.85)'}}>{event.time}</Text>
        </div>
    ));


    return (
        <Layout>
            <Sider
                width={300}
                style={{
                    height: '100vh',
                    minWidth: '300px',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    backgroundColor: theme === 'dark' ? '#2b2b2d' : '#f4f4f6',
                    transition: 'background-color 0.4s ease, color 0.4s ease',
                }}
            >
                <Space
                    direction="vertical"
                    size={50}
                    style={{width: '100%'}}
                >
                    <div style={{display: 'flex', alignItems: 'center', margin: '16px'}}>
                        <Avatar size="large" icon={<UserOutlined/>}/>
                        <span
                            style={{marginLeft: '10px', color: theme === 'dark' ? 'white' : 'rgba(0, 0, 0, 0.85)'}}>
                            {JSON.parse(localStorage.getItem('userName'))}
                        </span>
                    </div>

                    <Menu
                        onClick={(item) => onMenuSelect(item.key)}
                        theme={theme}
                        style={{
                            transition: 'background-color 0.4s ease, color 0.4s ease',
                            backgroundColor: theme === 'dark' ? '#2b2b2d' : '#f4f4f6',
                            textAlign: 'left',
                            fontSize: {iconStyle},
                        }}
                        mode="inline" defaultSelectedKeys={[selectedItem]}
                        items={sidebaritems.map(item => ({
                            ...item,
                            style: {

                                padding: '22px 10px',
                            }
                        }))}

                    />
                    <div>
                        <Paragraph style={{
                            color: theme === 'dark' ? 'white' : 'rgba(0, 0, 0, 0.85)',
                            textAlign: 'left',
                            marginLeft: '14px',
                            fontWeight: 'bold',
                            letterSpacing: '.1rem'
                        }}>TODAY</Paragraph>
                        <div className="custom-events">
                            {eventItems}
                        </div>
                    </div>

                </Space>
                <Paragraph style={{
                    color: theme === 'dark' ? 'white' : 'rgba(0, 0, 0, 0.85)',
                    position: 'absolute',
                    bottom: '0px',
                    left: '16px'
                }}>© 2024 TaskVue</Paragraph>
            </Sider>

        </Layout>
    );
};

export default SideBar;
