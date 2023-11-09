import React, {useState, useEffect} from 'react';
import {Layout, Menu, DatePicker, Button, List, Badge} from 'antd';
import {
    HistoryOutlined,
    SettingOutlined,
    SyncOutlined,
    RiseOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/de';
import Goals from "./Goals.jsx";
import Settings from "./Settings.jsx";
import History from "./History.jsx";
import Productivity from "./Productivity.jsx"; // Importieren Sie die deutsche Lokalisierung

dayjs.locale('de'); // Verwenden Sie die deutsche Lokalisierung

const {Header, Content} = Layout;
const {RangePicker} = DatePicker;

const Dashboard = () => {
    const [theme, setTheme] = useState('light');

    // Definiere das Start- und Enddatum der aktuellen Woche direkt in useState
    const startOfWeek = dayjs().startOf('week').add(1, 'day'); // Montag
    const endOfWeek = dayjs().endOf('week').add(1, 'day'); // Sonntag
    const [defaultDates, setDefaultDates] = useState([startOfWeek, endOfWeek]);


    const [selectedHeaderItem, setSelectedHeaderItem] = useState(() => {
        const storedValue = sessionStorage.getItem('selectedHeaderItem')
        return storedValue ? storedValue : 'history';
    });

    useEffect(() => {

        sessionStorage.setItem('selectedHeaderItem', selectedHeaderItem);
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (e) => {
            setTheme(e.matches ? 'dark' : 'light');
        };

        mediaQuery.addEventListener('change', handleChange);

        handleChange(mediaQuery);

        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [selectedHeaderItem]);


    const headerItems = [
        {key: 'history', icon: <HistoryOutlined/>, label: 'History'},
        {key: 'productivity', icon: <RiseOutlined/>, label: 'Productivity'},
    ];

    let content;
    switch (selectedHeaderItem) {
        case 'history':
            content = <History/>;
            break;
        case 'productivity':
            content = <Productivity/>;
            break;
        default:
            content = <History/>;
    }

    return (
        <Layout className="layout" style={{backgroundColor: theme === 'dark' ? '#242424' : '#ffffff',}}>
            <Header
                style={{backgroundColor: theme === 'dark' ? '#242424' : '#ffffff', marginTop: '35px', padding: '0'}}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    minWidth: '100%'
                }}>
                    <Menu
                        mode="horizontal"
                        defaultSelectedKeys={[selectedHeaderItem]}
                        items={headerItems}
                        onClick={(e) => setSelectedHeaderItem(e.key)}
                        className={`custom-menu ${theme}-theme`} // Hier fügen Sie die themenspezifische Klasse hinzu
                        style={{
                            flex: 1,
                            backgroundColor: theme === 'dark' ? '#242424' : '#ffffff',
                            borderBottom: 'none',
                            color: theme === 'dark' ? '#ffffff' : 'black',
                        }}
                    />


                    <div style={{flex: 1, display: 'flex', justifyContent: 'flex-end'}}>
                        <RangePicker
                            style={{marginRight: '8px'}}
                            format="DD MMM YY"
                            defaultValue={defaultDates} // Verwende die Standarddaten aus dem useState-Hook
                        />
                    </div>
                </div>
            </Header>
            <Content style={{padding: '0 25px 0 0'}}>
                {content}
            </Content>
        </Layout>
    );
};

export default Dashboard;
