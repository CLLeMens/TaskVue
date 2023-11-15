import React, {useState, useEffect} from 'react';
import {Layout, Menu, Avatar, Space, Typography, Timeline} from 'antd';
import {
    UserOutlined,
    DashboardOutlined,
    AimOutlined,
    SettingOutlined,
} from '@ant-design/icons';
import {useTheme} from "../context/ThemeContext.jsx";

const {Sider} = Layout;
const {Title, Paragraph, Text} = Typography;


const SideBar = ({onMenuSelect, selectedItem}) => {
    const { theme, toggleTheme } = useTheme();


    const iconStyle = {fontSize: '18px'}; // Definieren Sie einen gemeinsamen Stil für alle Icons

    const sidebaritems = [
        {key: 'dashboard', icon: <DashboardOutlined style={iconStyle}/>, label: 'Dashboard'},
        {key: 'goals', icon: <AimOutlined style={iconStyle}/>, label: 'Goals'},
        {key: 'settings', icon: <SettingOutlined style={iconStyle}/>, label: 'Settings'},
    ];

    // Beispieldaten für Ereignisse
    const events = [
        {time: '08:00 - 08:30', title: 'Distraction', color: 'rgba(240, 128, 128, 0.8)'},
        {time: '08:30 - 12:00', title: 'Work', color: 'rgba(126,211,127,0.80)'},
        {time: '12:00 - 12:30', title: 'Break', color: 'rgba(85, 100, 255, 0.8)'},
        {time: '12:30 - 14:00', title: 'Work', color: 'rgba(126,211,127,0.80)'},
        {time: '14:00 - 14:10', title: 'Distraction', color: 'rgba(240, 128, 128, 0.8)'},
        {time: '14:10 - 15:30', title: 'Work', color: 'rgba(126,211,127,0.80)'},
        {time: '15:30 - 16:00', title: 'Distraction', color: 'rgba(240, 128, 128, 0.8)'},

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
                        <span style={{marginLeft: '10px', color: theme === 'dark' ? 'white' : 'rgba(0, 0, 0, 0.85)'}}>
                            Max Mustermann
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
