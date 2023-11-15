import React, {useEffect, useRef, useState} from 'react';
import {TimePicker, InputNumber, Table, Layout, Menu, ConfigProvider, Button} from 'antd';
import moment from 'moment';
import {makeRequest} from "../api/api.js";
import {USERGOALS} from "../api/endpoints.js";
import dayjs from "dayjs";
import {useTheme} from "../context/ThemeContext.jsx";

const Goals = () => {
    const {theme, toggleTheme} = useTheme();
    const [loading, setLoading] = useState(false);
    const format = 'HH:mm';
    const [columns, setColumns] = useState([]);

    const [initialData, setInitialData] = useState([
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
    ])

    const [editedData, setEditedData] = useState([
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
    ])


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await makeRequest('GET', USERGOALS);
                setEditedData(response)
                setInitialData(response)
            } catch (error) {
                console.log(error);
            }
        };
        fetchData();
    }, []);


    function decimalToTime(decimal) {

        // Ermittelt die Stunden (ganzzahliger Teil der Dezimalzahl)
        const hours = Math.floor(decimal);

        // Wandelt den Dezimalteil in Minuten um (multipliziert mit 60)
        const minutes = Math.round((decimal - hours) * 60);

        // Formatiert Stunden und Minuten in ein HH:mm-Format
        // Fügt eine führende Null hinzu, falls nötig
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }


    function timeToDecimal(timeString) {
        // Zerlegt die Zeit in Stunden und Minuten
        const [hours, minutes] = timeString.split(':').map(Number);

        // Berechnet die Dezimalzeit
        return hours + minutes / 60;
    }

    useEffect(() => {
        setColumns([

            {
                title: 'Day',
                dataIndex: 'day',
                key: 'day',
            },
            {
                title: 'Workload',
                dataIndex: 'workload',
                key: 'workload',

                render: (text, record) => {
                    const timeString = record.workload !== null ? decimalToTime(record.workload) : null;
                    const momentTime = timeString ? dayjs(timeString, format) : null;

                    return (
                        <TimePicker
                            value={momentTime}
                            format={format}
                            onChange={(time, timeString) => handleTimeChange(record.key, 'workload', time, timeString)}
                        />
                    );
                },
            },
            {
                title: 'Break',
                dataIndex: 'breakTime',
                key: 'breakTime',
                render: (text, record) => {
                    const timeString = record.breakTime !== null ? decimalToTime(record.breakTime) : null;
                    const momentTime = timeString ? dayjs(timeString, format) : null;

                    return (
                        <TimePicker
                            value={momentTime}
                            format={format}
                            onChange={(time) => handleTimeChange(record.key, 'breakTime', time)}
                        />
                    )

                },
            },
            {
                title: 'Distractions',
                dataIndex: 'distractions',
                key: 'distractions',
                render: (text, record) => {
                    const timeString = record.distractions !== null ? decimalToTime(record.distractions) : null;
                    const momentTime = timeString ? dayjs(timeString, format) : null;

                    return (
                        <TimePicker
                            value={momentTime}
                            format={format}
                            onChange={(value) => handleTimeChange(record.key, 'distractions', value)}
                        />
                    )
                },
            },
        ])
        ;
    }, [editedData]);


    const handleTimeChange = (key, field, time) => {
        let newList = []
        const newData = editedData.map((item) => {

            if (item.key === key) {
                const timeString = time ? time.format('HH:mm') : null;
                const decimalTime = timeString ? timeToDecimal(timeString) : null;
                newList.push({...item, [field]: decimalTime});
                return
            }

            newList.push(item)

        });
        setEditedData(newList);
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

    const saveGoals = async () => {
      setLoading(true)
        try{
          const response = await makeRequest('POST', USERGOALS, editedData);
          setTimeout(function (){
              setInitialData(editedData);
              setLoading(false);
          }, 1000);
        } catch (error) {
            console.log(error);
        }
    };

    const hasChanges = () => {
        return Object.keys(editedData).some(key => {
            const editedItem = editedData[key];
            const initialItem = initialData[key];
            return Object.keys(editedItem).some(prop => editedItem[prop] !== initialItem[prop]);
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
                <Table className={'goals-table'} dataSource={editedData} columns={columns} pagination={false}/>
            </ConfigProvider>
            <Button
                onClick={saveGoals}
                type={'primary'}
                disabled={!hasChanges()}
                loading={loading}
                style={hasChanges() ? enabledButtonStyle : disabledButtonStyle}>
                Save
            </Button>
        </Layout>


    );
};

export default Goals;
