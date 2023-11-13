import React, {useEffect, useState} from 'react';
import {TimePicker, InputNumber, Table, Layout, Menu, ConfigProvider, Button} from 'antd';
import moment from 'moment';

const Goals = () => {
    const [theme, setTheme] = useState('light');


    const format = 'HH:mm';


    const initialData = [
        {
            key: '1',
            day: 'Monday',
            workload: null,
            end: null,
            breakTime: null,
            distractions: null
        },
        {
            key: '2',
            day: 'Tuesday',
            workload: null,
            end: null,
            breakTime: null,
            distractions: null
        },
        {
            key: '3',
            day: 'Wednesday',
            workload: null,
            end: null,
            breakTime: null,
            distractions: null
        },
        {
            key: '4',
            day: 'Thursday',
            workload: null,
            end: null,
            breakTime: null,
            distractions: null
        },
        {
            key: '5',
            day: 'Friday',
            workload: null,
            end: null,
            breakTime: null,
            distractions: null
        },
        {
            key: '6',
            day: 'Saturday',
            workload: null,
            end: null,
            breakTime: null,
            distractions: null
        },
        {
            key: '7',
            day: 'Sunday',
            workload: null,
            end: null,
            breakTime: null,
            distractions: null
        },


    ];
    const [data, setData] = useState(initialData);

    const columns = [
        {
            title: 'Day',
            dataIndex: 'day',
            key: 'day',
        },
        {
            title: 'Workload',
            dataIndex: 'workload',
            key: 'workload',

            render: (text, record) => (
                <TimePicker

                    defaultValue={record.workload}
                    format={format}
                    onChange={(time) => handleTimeChange(record.key, 'workload', time)}
                />
            ),
        },
        {
            title: 'Break',
            dataIndex: 'breakTime',
            key: 'breakTime',
            render: (text, record) => (
                <TimePicker
                    defaultValue={record.breakTime}
                    format={format}
                    onChange={(time) => handleTimeChange(record.key, 'breakTime', time)}
                />
            ),
        },
        {
            title: 'Distractions',
            dataIndex: 'distractions',
            key: 'distractions',
            render: (text, record) => (
                <TimePicker
                    defaultValue={record.distractions}
                    format={format}
                    onChange={(value) => handleTimeChange(record.key, 'distractions', value)}
                />
            ),
        },
    ];

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


    const handleTimeChange = (key, field, time) => {
        const newData = data.map((item) => {
            if (item.key === key) {
                // Speichern Sie die Zeit als String im Format 'HH:mm' oder null, wenn kein Zeitwert ausgewählt ist
                const timeString = time ? time.format('HH:mm') : null;
                return {...item, [field]: timeString};
            }
            return item;
        });
        setData(newData);
    };


    const headerItems = [
        {key: 'goals', label: 'Goals'},

    ];

    const enabledButtonStyle = {
        width: '120px',
        margin: "35px 0 35px 63px",
    }

    const disabledButtonStyle = {
        ...enabledButtonStyle,
        backgroundColor: '#ccc',
        color: 'white',
        cursor: 'not-allowed',
    };

    const saveGoals = () => {
        console.log({
            data
        });
    };
    const hasChanges = () => {
        return data.some((row, index) => {
            const initialRow = initialData[index];
            // Da TimePicker moment Objekte zurückgibt und die initialen Werte null sind,
            // müssen wir die moment Objekte in ein vergleichbares Format umwandeln oder
            // prüfen, ob sie existieren.
            const workloadChanged = row.workload && (!initialRow.workload || !row.workload.isSame(initialRow.workload, 'minute'));
            const endChanged = row.end && (!initialRow.end || !row.end.isSame(initialRow.end, 'minute'));
            const breakTimeChanged = row.breakTime && (!initialRow.breakTime || !row.breakTime.isSame(initialRow.breakTime, 'minute'));
            const distractionsChanged = row.distractions !== initialRow.distractions;
            return workloadChanged || endChanged || breakTimeChanged || distractionsChanged;
        });
    };

    return (
        <Layout theme={theme} style={{backgroundColor: theme === 'dark' ? '#242424' : '#ffffff'}}>
            <Menu
                mode="horizontal"
                defaultSelectedKeys={['goals']}
                items={headerItems}
                className={`custom-menu ${theme}-theme`} // Hier fügen Sie die themenspezifische Klasse hinzu
                style={{
                    margin: '30px 0 50px 50px',
                    fontSize: '1.2rem',
                    backgroundColor: theme === 'dark' ? '#242424' : '#ffffff',
                    borderBottom: 'none',
                    color: theme === 'dark' ? '#ffffff' : 'black',
                }}
            />
            <ConfigProvider
                theme={{
                    components: {
                        Table: {
                            headerBg: theme === 'dark' ? '#1f1f1f' : '#fafafa',
                            headerColor: theme === 'dark' ? '#e3e3e3' : '#5c5c5c',
                            borderColor: theme === 'dark' ? '#3a3a3a' : '#e8e8e8',
                            colorBgContainer: theme === 'dark' ? '#2b2b2d' : '#f4f4f6',
                            colorPrimary: '#1677ff',
                            colorBorder: theme === 'dark' ? '#3a3a3a' : '#e8e8e8',
                            colorText: theme === 'dark' ? '#ffffff' : 'black',
                            colorTextSecondary: theme === 'dark' ? '#a6a6a6' : '#595959',
                            borderRadiusBase: '6px',
                        }, DatePicker: {
                            presetsWidth: 180,
                        },
                    },

                }}
            >
                <Table className={'goals-table'} dataSource={data} columns={columns} pagination={false}/>
            </ConfigProvider>
            <Button
                onClick={saveGoals}
                type={'primary'}
                disabled={!hasChanges()}
                style={hasChanges() ? enabledButtonStyle : disabledButtonStyle}>
                Save
            </Button>
        </Layout>


    );
};

export default Goals;
