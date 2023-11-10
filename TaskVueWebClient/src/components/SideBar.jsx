import React, {useState, useEffect} from 'react';
import {Layout, Menu, Avatar, Space, Typography, Timeline} from 'antd';
import {
    UserOutlined,
    DashboardOutlined,
    AimOutlined,
    SettingOutlined,
} from '@ant-design/icons';

const {Sider} = Layout;
const {Title, Paragraph, Text} = Typography;


const SideBar = ({onMenuSelect, selectedItem}) => {
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        // Hilfsfunktion, um das Theme zu ändern
        const handleChange = (e) => {
            setTheme(e.matches ? 'dark' : 'light');
        };

        // Event Listener hinzufügen
        mediaQuery.addEventListener('change', handleChange);

        // Setze das initiale Theme basierend auf der aktuellen Einstellung
        handleChange(mediaQuery);

        // Cleanup-Funktion, um den Event Listener zu entfernen
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);


    const iconStyle = {fontSize: '18px'}; // Definieren Sie einen gemeinsamen Stil für alle Icons

    const sidebaritems = [
        {key: 'dashboard', icon: <DashboardOutlined style={iconStyle}/>, label: 'Dashboard'},
        {key: 'goals', icon: <AimOutlined style={iconStyle}/>, label: 'Goals'},
        {key: 'settings', icon: <SettingOutlined style={iconStyle}/>, label: 'Settings'},
    ];

    // Beispieldaten für Ereignisse
    const events = [
        {time: '08:00 - 08:30', title: 'Smartphone', color: 'pink'},
        {time: '08:30 - 12:00', title: 'Work', color: 'green'},
        {time: '12:00 - 12:30', title: 'Lunch Break', color: 'blue'},
        {time: '12:30 - 14:00', title: 'Work', color: 'green'},
        {time: '14:00 - 14:10', title: 'Another Person', color: 'yellow'},
        {time: '14:10 - 15:30', title: 'Work', color: 'green'},
        {time: '15:30 - 16:00', title: 'Smartphone', color: 'pink'},

    ];


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
                }}
            >
                <Space
                    direction="vertical"
                    size={50}
                    style={{width: '100%'}}
                >
                    <div style={{display: 'flex', alignItems: 'center', margin: '16px'}}>
                        <Avatar size="large" icon={<UserOutlined/>}/>
                        <span style={{marginLeft: '10px', color: theme === 'dark' ? 'white' : 'rgba(0, 0, 0, 0.85)'}}>
                            Max Mustermann
                        </span>
                    </div>

                    <Menu
                        onClick={(item) => onMenuSelect(item.key)}
                        theme={theme}
                        style={{
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
                            {events.map((event, index) => (
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
