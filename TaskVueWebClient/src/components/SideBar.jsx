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
            if (currentProcessFlow !== today) {
                const preparedProcessFlow = JSON.parse(currentProcessFlow);
                const periods = calculatePeriods(preparedProcessFlow);
                setToday(periods);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [today]);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await makeRequest('GET', TRACKJSON);
                console.log(response);
            } catch (e) {
                console.log(e);
            }
        };

        fetchData(); // Call it immediately on component mount

        const interval = setInterval(fetchData, 10000); // Call it every 10 seconds

        return () => clearInterval(interval); // Clear interval on component unmount
    }, []);


        function formatTime(timeString) {
            return timeString.substring(0, 5);
        }


        function calculatePeriods(data) {
            let periods = [];
            let lastTime = null;
            let lastProcess = null;
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
                                {today && today.map((event, index) => (
                                    <div key={index} className="event-item" style={{position: 'relative'}}>
                                        {/* Farbe wird nun über CSS gesetzt */}
                                        <span className="event-dot" style={{backgroundColor: event.color}}></span>
                                        <Text strong
                                              style={{color: theme === 'dark' ? 'white' : 'rgba(0, 0, 0, 0.85)',}}>{event.title}</Text>
                                        <Text className="event-time"
                                              style={{color: theme === 'dark' ? 'white' : 'rgba(0, 0, 0, 0.85)',}}>{event.time}</Text>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </Space>
                    <Paragraph style={{
                        color: theme === 'dark' ? 'white' : 'rgba(0, 0, 0, 0.85)',
                        position: 'absolute',
                        bottom: '0px',
                        left: '16px'
                    }}>© 2023 TaskVue</Paragraph>
                </Sider>

            </Layout>
        );
    };

    export default SideBar;
