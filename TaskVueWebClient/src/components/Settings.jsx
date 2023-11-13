import React, {useEffect, useState} from 'react';
import {Switch, Layout, Slider, Typography, Menu, Button, Select} from 'antd';
import {HistoryOutlined, HomeOutlined, RiseOutlined} from "@ant-design/icons";

const {Title} = Typography;

const Settings = () => {
    const [isNotificationsOn, setIsNotificationsOn] = useState(false);
    const [appTheme, setAppTheme] = useState('system');
    const [isTrackFatigueOn, setIsTrackFatigueOn] = useState(false);
    const [isTrackOtherPeopleOn, setIsTrackOtherPeopleOn] = useState(false);
    const [isTrackSmartphoneOn, setIsTrackSmartphoneOn] = useState(false);
    const [isStandUpReminderOn, setIsStandUpReminderOn] = useState(false);
    const [isBreakReminderOn, setIsBreakReminderOn] = useState(false);
    const [isStayProductiveReminderOn, setIsStayProductiveReminderOn] = useState(false);
    const [isPositiveFeedbackOn, setIsPositiveFeedbackOn] = useState(false);
    const [trackingGrade, setTrackingGrade] = useState(0);
    const [theme, setTheme] = useState('light');
    const [selectedHeaderItem, setSelectedHeaderItem] = useState(() => {
        const storedValue = sessionStorage.getItem('selectedHeaderItemSettings')
        return storedValue ? storedValue : 'settings';
    });


    // Anfangszustände als Referenz speichern
    const initialState = {
        isNotificationsOn: false,
        appTheme: 'system',
        isTrackFatigueOn: false,
        isTrackOtherPeopleOn: false,
        isTrackSmartphoneOn: false,
        isStandUpReminderOn: false,
        isBreakReminderOn: false,
        isStayProductiveReminderOn: false,
        isPositiveFeedbackOn: false,
        trackingGrade: 0,
    };


    useEffect(() => {

        sessionStorage.setItem('selectedHeaderItemSettings', selectedHeaderItem);
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


    // Prüfe, ob Änderungen vorgenommen wurden
    const hasChanges = () => {
        return isNotificationsOn !== initialState.isNotificationsOn ||
            appTheme !== initialState.appTheme ||
            isTrackFatigueOn !== initialState.isTrackFatigueOn ||
            isTrackOtherPeopleOn !== initialState.isTrackOtherPeopleOn ||
            isTrackSmartphoneOn !== initialState.isTrackSmartphoneOn ||
            isStandUpReminderOn !== initialState.isStandUpReminderOn ||
            isBreakReminderOn !== initialState.isBreakReminderOn ||
            isStayProductiveReminderOn !== initialState.isStayProductiveReminderOn ||
            isPositiveFeedbackOn !== initialState.isPositiveFeedbackOn ||
            trackingGrade !== initialState.trackingGrade;
    };

    // Funktion zum Speichern der Einstellungen
    const saveSettings = () => {
        console.log({
            isNotificationsOn,
            appTheme,
            isTrackFatigueOn,
            isTrackOtherPeopleOn,
            isTrackSmartphoneOn,
            isStandUpReminderOn,
            isBreakReminderOn,
            isStayProductiveReminderOn,
            isPositiveFeedbackOn,
            trackingGrade
        });
    };

    const headerItems = [
        {key: 'settings', label: 'Settings'},

    ];

    const getTextStyle = () => ({
        color: theme === 'dark' ? '#ffffff' : 'black',
        marginBottom: '30px'
    });

    const enabledButtonStyle = {
        width: '120px',
        marginBottom: '35px'
    }

    const disabledButtonStyle = {
        ...enabledButtonStyle,
        backgroundColor: '#ccc',
        color: 'white',
        cursor: 'not-allowed',
    };

    return (
        <Layout theme={theme} style={{backgroundColor: theme === 'dark' ? '#242424' : '#ffffff'}}>
            <Menu
                mode="horizontal"
                defaultSelectedKeys={['settings']}
                items={headerItems}
                onClick={(e) => setSelectedHeaderItem(e.key)}
                className={`custom-menu ${theme}-theme`} // Hier fügen Sie die themenspezifische Klasse hinzu
                style={{
                    margin: '30px 0 0 50px',
                    fontSize: '1.2rem',
                    backgroundColor: theme === 'dark' ? '#242424' : '#ffffff',
                    borderBottom: 'none',
                    color: theme === 'dark' ? '#ffffff' : 'black',
                }}
            />
            <div className={'settings-wrapper'} style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                textAlign: 'left',
                margin: ' 50px 0 0 65px'
            }}>
                <Title level={4} style={getTextStyle()}>General</Title>

                <div className={'general-wrapper'}
                     style={{
                         display: 'flex',
                         flexDirection: 'row',
                         gap: '30px',
                         marginBottom: '65px',
                         minWidth: '100%'
                     }}>
                    <div style={{display: 'flex', flexDirection: 'column', gap: "30px"}}>
                        <div>
                            Notifications
                        </div>
                        <div>
                            Theme
                        </div>
                    </div>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: "30px",
                        marginLeft: 'auto',
                        marginRight: '50px',
                        width: '100px'
                    }}>
                        <Switch style={{width: '55px', marginLeft: 'auto'}} checked={isNotificationsOn} onChange={setIsNotificationsOn}/>
                        <Select
                            style={{width: '100px'}}
                            onChange={setAppTheme}
                            defaultValue={'system'}
                            options={[
                                {
                                    value: 'system',
                                    label: 'System',
                                },   {
                                    value: 'dark',
                                    label: 'Dark',
                                },
                                   {
                                    value: 'light',
                                    label: 'Light',
                                }
                                ]} />
                    </div>

                </div>
                {isNotificationsOn && (
                    <div>
                        <Title level={4} style={getTextStyle()}>Notifications</Title>
                        <div className={'notifications-wrapper'}
                             style={{
                                 display: 'flex',
                                 flexDirection: 'row',
                                 gap: '30px',
                                 marginBottom: '65px',
                                 minWidth: '100%'
                             }}>
                            <div style={{display: 'flex', flexDirection: 'column', gap: "30px"}}>
                                <div>Reminder to stand up</div>


                                <div>Reminder to take breaks</div>


                                <div>Reminder to stay productive</div>


                                <div>Positive Feedback</div>
                            </div>

                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: "30px",
                                marginLeft: 'auto',
                                marginRight: '50px',
                                width: '55px'
                            }}>
                                <Switch checked={isStandUpReminderOn} onChange={setIsStandUpReminderOn}/>
                                <Switch checked={isBreakReminderOn} onChange={setIsBreakReminderOn}/>
                                <Switch checked={isStayProductiveReminderOn} onChange={setIsStayProductiveReminderOn}/>
                                <Switch checked={isPositiveFeedbackOn} onChange={setIsPositiveFeedbackOn}/>
                            </div>

                        </div>
                    </div>
                )}
                <Title level={4} style={getTextStyle()}>Tracking</Title>
                <div className={'tracking-wrapper'}
                     style={{display: 'flex', flexDirection: 'row', gap: '30px', marginBottom: '40px'}}>
                    <div style={{display: 'flex', flexDirection: 'column', gap: "30px"}}>
                        <div>
                            Track fatigue
                        </div>
                        <div>
                            Track other people
                        </div>
                        <div>
                            Track Smartphone
                        </div>
                        <div>
                            Tracking grade
                        </div>
                    </div>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: "30px",
                        marginLeft: 'auto',
                        marginRight: '50px',

                    }}>
                        <Switch checked={isTrackFatigueOn} onChange={setIsTrackFatigueOn}
                                style={{width: '55px', marginLeft: 'auto'}}/>
                        <Switch checked={isTrackOtherPeopleOn} onChange={setIsTrackOtherPeopleOn}
                                style={{width: '55px', marginLeft: 'auto'}}/>
                        <Switch checked={isTrackSmartphoneOn} onChange={setIsTrackSmartphoneOn}
                                style={{width: '55px', marginLeft: 'auto'}}/>
                        <div style={{display: 'flex', alignItems: 'center', flexDirection: 'column', width: '300px'}}>
                            <Slider
                                className={theme === 'dark' ? 'dark-theme-slider' : "light-theme-slider"}
                                value={trackingGrade}
                                onChange={setTrackingGrade}
                                min={0}
                                max={1}
                                step={0.1}
                                style={{
                                    flex: 1,
                                    marginRight: '10px',
                                    width: '100%'
                                }} // Verwenden Sie flex: 1, damit der Slider die meiste Breite einnimmt
                            />
                            <div style={{minWidth: '100%', textAlign: 'right'}}>
                                {trackingGrade >= 0.75 ? 'High' : trackingGrade >= 0.5 ? 'Medium' : 'Low'}
                            </div>
                        </div>
                    </div>
                </div>
                <Button
                    onClick={saveSettings}
                    type={'primary'}
                    disabled={!hasChanges()}
                    style={hasChanges() ? enabledButtonStyle : disabledButtonStyle}>
                    Save
                </Button>
            </div>
        </Layout>
    );
};

export default Settings;
