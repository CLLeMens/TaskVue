import React, {useEffect, useState} from 'react';
import {Switch, Layout, Slider, Typography, Menu, Button, Select} from 'antd';
import {makeRequest} from "../api/api.js";
import {USERSETTINGS} from "../api/endpoints.js";

const {Title} = Typography;

const Settings = () => {
    const [theme, setTheme] = useState('light');
    const [selectedHeaderItem, setSelectedHeaderItem] = useState(() => {
        const storedValue = sessionStorage.getItem('selectedHeaderItemSettings')
        return storedValue ? storedValue : 'settings';
    });
    const [initialState, setInitialState] = useState({
        isNotificationsOn: null,
        appTheme: null,
        isTrackFatigueOn: null,
        isTrackOtherPeopleOn: null,
        isTrackSmartphoneOn: null,
        isStandUpReminderOn: null,
        isBreakReminderOn: null,
        isStayProductiveReminderOn: null,
        isPositiveFeedbackOn: null,
        trackingGrade: null,
    });

    const [editedData, setEditedData] = useState({
        isNotificationsOn: null,
        appTheme: null,
        isTrackFatigueOn: null,
        isTrackOtherPeopleOn: null,
        isTrackSmartphoneOn: null,
        isStandUpReminderOn: null,
        isBreakReminderOn: null,
        isStayProductiveReminderOn: null,
        isPositiveFeedbackOn: null,
        trackingGrade: null,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await makeRequest('GET', USERSETTINGS);

                setEditedData({
                    isNotificationsOn: response.notifications,
                    appTheme: response.theme,
                    isTrackFatigueOn: response.track_fatigue,
                    isTrackOtherPeopleOn: response.track_other_people,
                    isTrackSmartphoneOn: response.track_smartphone,
                    isStandUpReminderOn: response.stand_up_reminder,
                    isBreakReminderOn: response.break_reminder,
                    isStayProductiveReminderOn: response.productivity_reminder,
                    isPositiveFeedbackOn: response.positive_feedback_reminder,
                    trackingGrade: response.tracking_grade,
                });

                setInitialState({
                    isNotificationsOn: response.notifications,
                    appTheme: response.theme,
                    isTrackFatigueOn: response.track_fatigue,
                    isTrackOtherPeopleOn: response.track_other_people,
                    isTrackSmartphoneOn: response.track_smartphone,
                    isStandUpReminderOn: response.stand_up_reminder,
                    isBreakReminderOn: response.break_reminder,
                    isStayProductiveReminderOn: response.productivity_reminder,
                    isPositiveFeedbackOn: response.positive_feedback_reminder,
                    trackingGrade: response.tracking_grade,
                });


            } catch (error) {
                console.log(error);
            }
        }
        fetchData();
    }, []);


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
        return Object.keys(editedData).some(key => editedData[key] !== initialState[key]);
    };


    const handleInputChange = (name, value) => {
        console.log(name, value)
        setEditedData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };
    // Funktion zum Speichern der Einstellungen
    const saveSettings = async () => {
       try {
           await makeRequest('POST', USERSETTINGS, editedData);
       } catch (error) {
              console.log(error);
       }
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
                        <Switch style={{width: '55px', marginLeft: 'auto'}} checked={editedData.isNotificationsOn}
                                onChange={e => handleInputChange('isNotificationsOn', e)}/>
                        <Select
                            style={{width: '100px'}}
                            onChange={e => handleInputChange('appTheme', e)}
                            value={editedData.appTheme} // Verwenden Sie value anstelle von defaultValue
                            options={[
                                {value: 'system', label: 'System'},
                                {value: 'dark', label: 'Dark'},
                                {value: 'light', label: 'Light'}
                            ]}
                        />

                    </div>

                </div>
                {editedData.isNotificationsOn && (
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
                                <Switch checked={editedData.isStandUpReminderOn}
                                         onChange={e => handleInputChange('isStandUpReminderOn', e)}/>
                                <Switch checked={editedData.isBreakReminderOn}
                                        onChange={e => handleInputChange('isBreakReminderOn', e)}/>
                                <Switch checked={editedData.isStayProductiveReminderOn}
                                        onChange={e => handleInputChange('isStayProductiveReminderOn', e)}/>
                                <Switch checked={editedData.isPositiveFeedbackOn}
                                        onChange={e => handleInputChange('isPositiveFeedbackOn', e)}/>
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
                        <Switch checked={editedData.isTrackFatigueOn} onChange={e => handleInputChange('isTrackFatigueOn', e)}
                                style={{width: '55px', marginLeft: 'auto'}}/>
                        <Switch checked={editedData.isTrackOtherPeopleOn} onChange={e => handleInputChange('isTrackOtherPeopleOn', e)}
                                style={{width: '55px', marginLeft: 'auto'}}/>
                        <Switch checked={editedData.isTrackSmartphoneOn} onChange={e => handleInputChange('isTrackSmartphoneOn', e)}
                                style={{width: '55px', marginLeft: 'auto'}}/>
                        <div style={{display: 'flex', alignItems: 'center', flexDirection: 'column', width: '300px'}}>
                            <Slider
                                className={theme === 'dark' ? 'dark-theme-slider' : "light-theme-slider"}
                                value={editedData.trackingGrade}
                               onChange={e => handleInputChange('trackingGrade', e)}
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
                                {editedData.trackingGrade >= 0.75 ? 'High' : editedData.trackingGrade >= 0.5 ? 'Medium' : 'Low'}
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
