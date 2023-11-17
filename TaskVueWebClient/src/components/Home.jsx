import React, {useState, useEffect} from 'react';
import {Layout, Button, Card, Tag, Modal, Divider, Typography} from 'antd';
import {InfoCircleTwoTone} from '@ant-design/icons';
import {useTheme} from "../context/ThemeContext.jsx";
import {makeRequest} from "../api/api.js";
import {GETHOMEINFO, PROCESSFLOW} from "../api/endpoints.js";

const {Title} = Typography;


const Home = () => {
    const {theme, toggleTheme} = useTheme();
    const [information, setInformation] = useState(null);
    const [timer, setTimer] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [pauseTime, setPauseTime] = useState(0);
    const [workedTime, setWorkedTime] = useState(0);
    const [pauseDuration, setPauseDuration] = useState(0);
    const [breakTime, setBreakTime] = useState(0);
    const [processFlowState, setProcessFlowState] = useState([]);
    const [workBreakTimes, setWorkBreakTimes] = useState(null);

    useEffect(() => {
    const interval = setInterval(() => {
        const storedProcessFlow = localStorage.getItem('processFlow');
        if (storedProcessFlow) {
            const parsedData = JSON.parse(storedProcessFlow);
            setProcessFlowState(parsedData);
        }
    }, 500);

    return () => clearInterval(interval);
}, []);


    useEffect(() => {
        setWorkBreakTimes(calculateWorkAndBreakTime(processFlowState));
    }, [processFlowState]); // Hören auf Änderungen im processFlowState


    useEffect(() => {
        // Ziel-Uhrzeit setzen (z.B. 15:00 Uhr)
        const targetHour = 0;
        const targetMinute = 0;

        // Aktuelles Datum und Zeit ermitteln
        const now = new Date();
        const targetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), targetHour, targetMinute);

        // Wenn die Zielzeit heute bereits vergangen ist, setzen Sie sie für morgen
        if (targetTime < now) {
            targetTime.setDate(targetTime.getDate() + 1);
        }

        // Berechnen, wie lange gewartet werden muss (in Millisekunden)
        const timeout = targetTime.getTime() - now.getTime();

        // Timeout einstellen, um die Funktion zur festgelegten Zeit auszuführen
        const timer = setTimeout(() => {
            localStorage.removeItem('processFlow');
            // Hier können Sie weitere Aktionen ausführen
        }, timeout);

        // Bereinigungsfunktion, um den Timer zu löschen, falls die Komponente unmountet wird
        return () => clearTimeout(timer);
    }, []);


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
                console.log(response)
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
        processFlow('start');
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

        processFlow('stop');

        const fetchData = async () => {
            try {
                await makeRequest('POST', PROCESSFLOW, JSON.parse(localStorage.getItem('processFlow')));
            } catch (error) {
                console.log(error);
            }
        }
        fetchData();

    };

    const toggleTimer = (process) => {

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
        processFlow(process);
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


    const processFlow = (process) => {
        // check if localstorage with the key 'processFlow' exists if not create it
        if (!localStorage.getItem('processFlow')) {
            localStorage.setItem('processFlow', JSON.stringify([]));
        }

        //get the current process flow from localstorage
        const processFlow = JSON.parse(localStorage.getItem('processFlow'));

        //create a new process object
        const newProcess = {
            process: process,
            // time in HH:MM formal
            time: new Date().toLocaleTimeString(),
        }

        //add the new process to the process flow
        processFlow.push(newProcess);

        //save the new process flow to localstorage
        localStorage.setItem('processFlow', JSON.stringify(processFlow));
    }


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


    function calculateWorkAndBreakTime() {
        const dataString = localStorage.getItem('processFlow');
        if (!dataString) {
            return {work: 0, break: 0};
        }

        const data = JSON.parse(dataString);
        let workTime = 0;
        let breakTime = 0;
        let lastTime = null;
        let lastProcess = null;

        data.forEach(entry => {
            const currentDateTime = new Date(`01/01/2000 ${entry.time}`);
            if (lastTime) {
                const seconds = (currentDateTime - lastTime) / 1000;

                if (lastProcess === 'start' && ['pause', 'stop'].includes(entry.process)) {
                    workTime += seconds;
                } else if (['pause', 'stop'].includes(lastProcess) && entry.process === 'start') {
                    breakTime += seconds;
                }
            }

            lastTime = currentDateTime;
            lastProcess = entry.process;
        });

        const workTimeHours = Math.round(workTime / 3600 * 100) / 100;
        const breakTimeHours = Math.round(breakTime / 3600 * 100) / 100;

        return {work: workTimeHours, break: breakTimeHours};
    }


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
                            onClick={() => isRunning ? toggleTimer('pause') : (timer > 0 ? toggleTimer('start') : startTimer())}>
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
                                <li>{workBreakTimes && parseFloat(workBreakTimes.work) + parseFloat((timer / 3600).toFixed(2))}h
                                    / {information && information.goals[0].workload}h
                                </li>
                                <li>{workBreakTimes && parseFloat(workBreakTimes.break) + parseFloat((pauseDuration / 3600).toFixed(2))}h
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
