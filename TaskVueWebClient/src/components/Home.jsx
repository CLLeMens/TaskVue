import React, {useState, useEffect} from 'react';
import {Layout, Button, Card, Tag, Modal, Divider, Typography} from 'antd';
import {InfoCircleTwoTone} from '@ant-design/icons';
import {useTheme} from "../context/ThemeContext.jsx";
import {makeRequest} from "../api/api.js";
import {GETHOMEINFO} from "../api/endpoints.js";

const {Title} = Typography;


const Home = () => {
    const {theme, toggleTheme} = useTheme();
    const [information, setInformation] = useState(null);
    // Zustände für den Timer und den Laufstatus
    const [timer, setTimer] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [pauseTime, setPauseTime] = useState(0);
    const [workedTime, setWorkedTime] = useState(0);
    const [pauseDuration, setPauseDuration] = useState(0);
    const [breakTime, setBreakTime] = useState(0);


    useEffect(() => {
        const savedTimer = JSON.parse(localStorage.getItem('timer'));
        if (savedTimer) {
            setStartTime(new Date(savedTimer.startTime));

            setIsRunning(savedTimer.isRunning);
            setPauseTime(savedTimer.pauseTime);
            if (savedTimer.breakTime) {
                setBreakTime(new Date(savedTimer.breakTime));
            }


            let calc_timer;
            if (savedTimer.isRunning) {
                // Timer läuft: Berechne die Zeit seit dem Start abzüglich der Pausenzeit
                calc_timer = (new Date() - new Date(savedTimer.startTime)) - (savedTimer.pauseTime * 1000);
            } else {
                // Timer läuft nicht: Berechne die Zeit bis zum letzten Stopp (breakTime) abzüglich der Pausenzeit
                calc_timer = (new Date(savedTimer.breakTime) - new Date(savedTimer.startTime)) - (savedTimer.pauseTime * 1000);
            }
            setTimer(Math.floor(calc_timer / 1000));


        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await makeRequest('GET', GETHOMEINFO);
                setInformation(response)
            } catch (error) {
                console.log(error);
            }
        };
        fetchData();
    }, [])


    // Timer-Funktionen
    useEffect(() => {
        let interval;
        if (isRunning) {
            interval = setInterval(() => {
                setTimer(prevTime => prevTime + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning]);


    // Funktionen zum Starten und Stoppen des Timers
    const startTimer = () => {
        const startTime = new Date();
        setIsRunning(true);
        setStartTime(startTime);
        localStorage.setItem('timer', JSON.stringify({
            startTime: startTime,
            isRunning: true,
            pauseTime: pauseTime,
        }));
    };


    const stopTimer = () => {
        setIsRunning(false);
        setTimer(0);
        localStorage.removeItem('timer');
        const newPauseDuration = pauseTime;
        setWorkedTime(timer);
        setPauseDuration(newPauseDuration);
        setIsModalVisible(true);

        setTimer(0);
        setPauseTime(0);
        setStartTime(null);
    };

    const toggleTimer = () => {
        setIsRunning(!isRunning);
        if (!isRunning) {
            // Berechnen der Pausezeit in ganzen Sekunden
            let additionalPauseTime = Math.floor((new Date() - breakTime) / 1000);

            setPauseTime(pauseTime + additionalPauseTime);
            setStartTime(new Date());
            localStorage.setItem('timer', JSON.stringify({
                startTime: startTime,
                isRunning: true,
                pauseTime: pauseTime + additionalPauseTime,
                breakTime: breakTime

            }));
        } else {
            setBreakTime(new Date());
            localStorage.setItem('timer', JSON.stringify({
                startTime: startTime,
                isRunning: false,
                pauseTime: pauseTime,
                breakTime: new Date()
            }));
        }
    };

    const handleOk = () => {
        setIsModalVisible(false);
    };

    // Formatierung der Timer-Anzeige
    const formatTime = (timeInSeconds) => {
        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        const seconds = timeInSeconds % 60;

        return (
            <>
                {hours.toString().padStart(2, '0')}
                <span style={{
                    color: 'inherit',
                    fontSize: '2rem',
                    margin: '0 0.2rem'
                }}>:</span>
                {minutes.toString().padStart(2, '0')}
                <span style={{
                    color: 'inherit',
                    fontSize: '2rem',
                    margin: '0 0.2rem'
                }}>:</span>
                <span style={{color: 'grey', fontSize: '0.75em'}}>{seconds.toString().padStart(2, '0')}</span>
            </>
        );
    };


    const enabledButtonStyle = {
        minWidth: '100px',
        marginRight: '3.5rem',

    }

    const disabledButtonStyle = {
        ...enabledButtonStyle,
        backgroundColor: '#ccc',
        color: 'white',
        cursor: 'not-allowed',
    };

    const getFontColor = () => ({
        color: theme === 'dark' ? '#ffffff' : null,
    })

    return (

        <>
            <div style={{marginTop: '50px', padding: '20px'}}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    marginBottom: '20px',
                    textAlign: 'left',
                    minWidth: '100%'
                }}>
                <span style={{...getFontColor(), fontWeight: 'bold', fontSize: '22px'}}>
                    <InfoCircleTwoTone twoToneColor="#52c41a" style={{fontSize: '24px', marginRight: '10px',}}/> Note
                </span>

                    <span style={{...getFontColor(), marginLeft: '38px'}}>
                    The Software is running. To pause or continue click the buttons below.
                </span>
                </div>
                <div className={'timer-wrapper'}>
                    <Button type={'primary'} style={enabledButtonStyle}
                            onClick={isRunning ? toggleTimer : (timer > 0 ? toggleTimer : startTimer)}>
                        {isRunning ? 'Pause' : (timer > 0 ? 'Continue' : 'Start')}
                    </Button>

                    <Button type={'primary'} style={timer > 0 ? enabledButtonStyle : disabledButtonStyle}
                            onClick={stopTimer}
                            disabled={timer === 0} danger>
                        Stop
                    </Button>
                    <Card className={'timer-card'}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '3rem',
                            color: '#242424',
                        }}>
                            {formatTime(timer)}
                        </div>
                    </Card>
                </div>
                <Divider orientation="left" style={{...getFontColor(), borderColor: 'lightgray'}}>Information</Divider>
                <div className={'information-wrapper'} style={{
                    padding: '0 105px 0 0',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between'
                }}>
                    <div>
                        <Title level={4} style={{
                            textAlign: 'left',
                            margin: '50px 0 25px 40px',
                            color: '#ffffff',
                        }}>Monitoring</Title>
                        <div className={'monitoring-wrapper'}
                             style={{display: 'flex', flexDirection: 'row', minWidth: '100%'}}>

                            <ul style={{
                                ...getFontColor(),
                                listStyle: 'none',
                                textAlign: 'left',
                                marginLeft: '40px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '20px'
                            }}>
                                <li>Distraction-Detection</li>
                                <li>Fatigue-Detection</li>
                                <li>Input-Monitoring</li>
                            </ul>
                            <ul style={{
                                listStyle: 'none',
                                marginLeft: '40px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '20px'
                            }}>
                                <Tag color={information && information.settings[0].distraction ? 'green' : 'red'}
                                     style={{textAlign: 'center', fontSize: '13px', fontWeight: 'bold'}}>
                                    {information && information.settings[0].distraction ? 'Active' : 'Inactive'}
                                </Tag>

                                <Tag color={information && information.settings[0].fatigue ? 'green' : 'red'}
                                     style={{textAlign: 'center', fontSize: '13px', fontWeight: 'bold'}}>
                                    {information && information.settings[0].fatigue ? 'Active' : 'Inactive'}
                                </Tag>
                                <Tag color={information && information.settings[0].key_mouse ? 'green' : 'red'}
                                     style={{textAlign: 'center', fontSize: '13px', fontWeight: 'bold'}}>
                                    {information && information.settings[0].key_mouse ? 'Active' : 'Inactive'}
                                </Tag>
                            </ul>
                        </div>
                    </div>

                    <div className={'goals-wrapper'}>
                        <Title level={4} style={{
                            textAlign: 'left',
                            margin: '50px 0 25px 40px',
                            color: '#ffffff',
                        }}>Goals</Title>
                        <div style={{display: 'flex', flexDirection: 'row'}}>
                            <ul style={{
                                ...getFontColor(),
                                listStyle: 'none',
                                textAlign: 'left',
                                marginLeft: '40px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '20px'
                            }}>
                                <li>Working hours</li>
                                <li>Breaks</li>
                                <li>Distractions</li>
                            </ul>
                            <ul style={{
                                ...getFontColor(),
                                listStyle: 'none',
                                marginLeft: '40px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '20px'
                            }}>
                                <li>{(timer / 3600).toFixed(2)}h / {information && information.goals[0].workload}h</li>
                                <li>{(pauseDuration / 3600).toFixed(2)}h
                                    / {information && information.goals[0].breaks}h
                                </li>
                                <li>1.2h / {information && information.goals[0].distractions}h</li>
                            </ul>
                        </div>

                    </div>
                </div>
            </div>
            <Modal title="Work overview" open={isModalVisible} onOk={handleOk}>
                <p style={{fontSize: '1rem'}}>Actual Workload: {formatTime(workedTime)}</p>
                <p>Actual Breaks: {formatTime(pauseDuration)}</p>
            </Modal>
        </>
    )
        ;
};

export default Home;
