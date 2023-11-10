import React, {useState, useEffect} from 'react';
import {Layout, Menu, DatePicker, ConfigProvider} from 'antd';
import {
    HistoryOutlined,
    RiseOutlined,
} from '@ant-design/icons';
import 'dayjs/locale/de';
import History from "./History.jsx";
import Productivity from "./Productivity.jsx";

import locale from "antd/es/locale/en_GB";
import dayjs from 'dayjs';
import updateLocale from 'dayjs/plugin/updateLocale';


dayjs.extend(updateLocale)
dayjs.updateLocale('en', {
    weekStart: 1
})

const {Header, Content} = Layout;


const Dashboard = () => {
    const [theme, setTheme] = useState('light');

    const currentWeek = dayjs().week();
    const [defaultDates, setDefaultDates] = useState(currentWeek);


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
            content = <History week={defaultDates}/>;
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
                style={{backgroundColor: theme === 'dark' ? '#242424' : '#ffffff', marginTop: '15px', padding: '0'}}>
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
                        <ConfigProvider locale={locale}>
                            <DatePicker
                                placeholder="Select week"
                                onChange={e => setDefaultDates(dayjs(e).week())}
                                picker="week"

                                style={{marginRight: '25px'}}
                                defaultValue={dayjs().week(currentWeek)}
                            />
                        </ConfigProvider>
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
