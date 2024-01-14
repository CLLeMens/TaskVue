import React, {useEffect, useState} from 'react';
import {Switch, Layout, Slider, Typography, Menu, Button, Select, Input} from 'antd';
import {makeRequest} from "../api/api.js";
import {USERSETTINGS} from "../api/endpoints.js";
import {useTheme} from "../context/ThemeContext.jsx";

const {Title} = Typography;

const Settings = () => {
    const {theme, toggleTheme} = useTheme();
    const [selectedHeaderItem, setSelectedHeaderItem] = useState(() => {
        const storedValue = sessionStorage.getItem('selectedHeaderItemSettings')
        return storedValue ? storedValue : 'settings';
    });
    const [loading, setLoading] = useState(false);

    const [initialState, setInitialState] = useState({
        name: null,
        isNotificationsOn: null,
        appTheme: null,
        isTrackFatigueOn: null,
        isTrackOtherPeopleOn: null,
        isTrackSmartphoneOn: null,
        isDistracted: null,
        trackingGrade: null,
    });

    const [editedData, setEditedData] = useState({
        name: null,
        isNotificationsOn: null,
        appTheme: null,
        isTrackFatigueOn: null,
        isTrackOtherPeopleOn: null,
        isTrackSmartphoneOn: null,
        isDistracted: null,
        trackingGrade: null,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await makeRequest('GET', USERSETTINGS);
                console.log(response);
                setEditedData({
                    name: response.name,
                    isNotificationsOn: response.notifications,
                    appTheme: response.theme,
                    isTrackFatigueOn: response.track_fatigue,
                    isTrackOtherPeopleOn: response.track_other_people,
                    isTrackSmartphoneOn: response.track_smartphone,
                    isDistracted: response.track_distraction,
                    trackingGrade: response.tracking_grade,
                });

                setInitialState({
                    name: response.name,
                    isNotificationsOn: response.notifications,
                    appTheme: response.theme,
                    isTrackFatigueOn: response.track_fatigue,
                    isTrackOtherPeopleOn: response.track_other_people,
                    isTrackSmartphoneOn: response.track_smartphone,
                    isDistracted: response.track_distraction,
                    trackingGrade: response.tracking_grade,
                });


            } catch (error) {
                console.log(error);
            }
        }
        fetchData();
    }, []);


    // Prüfe, ob Änderungen vorgenommen wurden
    const hasChanges = () => {
        return Object.keys(editedData).some(key => editedData[key] !== initialState[key]);
    };


    const handleInputChange = (name, value) => {
        if (name === 'isNotificationsOn' && value) {
            const permission = requestNotificationPermission();
            if (!permission) {
                return;
            }
        }
        setEditedData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };
    // Funktion zum Speichern der Einstellungen
    const saveSettings = async () => {
        setLoading(true);
        try {
            const response = await makeRequest('POST', USERSETTINGS, editedData);
            setTimeout(function () {
                if (response.message === 'new theme') {
                    toggleTheme(editedData.appTheme);
                }
                setInitialState(editedData)
                setLoading(false);
                localStorage.setItem('userName', JSON.stringify(editedData.name));
            }, 1000);
        } catch (error) {

            console.log(error);
        }


    };

    // Funktion, um die Zustimmung für Benachrichtigungen zu erhalten
    const requestNotificationPermission = async () => {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            sendTestNotification();
            return true;
        } else {
            console.log("Notification permission denied");
            return false;
        }
    };

    // Funktion, um eine Testbenachrichtigung zu senden
    const sendTestNotification = () => {
        new Notification("Test Notification", {
            body: "This is a test notification!",
        });
    };

    const headerItems = [
        {key: 'settings', label: 'Settings'},

    ];

    const getTextStyle = () => ({
        color: theme === 'dark' ? '#ffffff' : null,
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
        <Layout theme={theme} style={{
            backgroundColor: theme === 'dark' ? '#242424' : '#ffffff',
            transition: 'background-color 0.4s ease, color 0.4s ease',
        }}>
            <Menu
                mode="horizontal"
                defaultSelectedKeys={['settings']}
                items={headerItems}
                onClick={(e) => setSelectedHeaderItem(e.key)}
                className={`custom-menu ${theme}-theme`} // Hier fügen Sie die themenspezifische Klasse hinzu
                style={{
                    margin: '30px 0 0 45px',
                    fontSize: '1.2rem',
                    transition: 'background-color 0.4s ease, color 0.4s ease',
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
                margin: ' 45px 0 0 65px'
            }}>
                <Title level={4} style={getTextStyle()}>General</Title>

                <div className={'general-wrapper'}
                     style={{
                         ...getTextStyle(),
                         display: 'flex',
                         flexDirection: 'row',
                         gap: '30px',
                         marginBottom: '65px',
                         minWidth: '100%'
                     }}>
                    <div style={{display: 'flex', flexDirection: 'column', gap: "30px"}}>
                        <div>
                            Name
                        </div>
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
                        marginRight: '45px',

                    }}>
                        <Input
                            value={editedData.name}
                            onChange={e => handleInputChange('name', e.target.value)}
                            style={{minWidth: '250px'}}/>

                        <Switch style={{width: '45px', marginLeft: 'auto'}} checked={editedData.isNotificationsOn}
                                onChange={e => handleInputChange('isNotificationsOn', e)}/>
                        <Select
                            style={{width: '100px', marginLeft: 'auto'}}
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
                <Title level={4} style={getTextStyle()}>Tracking</Title>
                <div className={'tracking-wrapper'}
                     style={{
                         ...getTextStyle(),
                         display: 'flex',
                         flexDirection: 'row',
                         gap: '30px',
                         marginBottom: '40px'
                     }}>
                    <div style={{display: 'flex', flexDirection: 'column', gap: "30px"}}>
                        <div>
                            Track drowziness
                        </div>
                        <div>
                            Track other people
                        </div>
                        <div>
                            Track Smartphone
                        </div>
                        <div>
                            Track Distraction
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
                        marginRight: '45px',

                    }}>
                        <Switch checked={editedData.isTrackFatigueOn}
                                onChange={e => handleInputChange('isTrackFatigueOn', e)}
                                style={{width: '45px', marginLeft: 'auto'}}/>
                        <Switch checked={editedData.isTrackOtherPeopleOn}
                                onChange={e => handleInputChange('isTrackOtherPeopleOn', e)}
                                style={{width: '45px', marginLeft: 'auto'}}/>
                        <Switch checked={editedData.isTrackSmartphoneOn}
                                onChange={e => handleInputChange('isTrackSmartphoneOn', e)}
                                style={{width: '45px', marginLeft: 'auto'}}/>
                        <Switch checked={editedData.isDistracted}
                                onChange={e => handleInputChange('isDistracted', e)}
                                style={{width: '45px', marginLeft: 'auto'}}/>
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
                    loading={loading}
                    style={hasChanges() ? enabledButtonStyle : disabledButtonStyle}>
                    Save
                </Button>
            </div>
        </Layout>
    );
};

export default Settings;
