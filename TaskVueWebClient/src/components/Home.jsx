import React, {useState, useEffect} from 'react';
import {Layout, Button, Card, Tag, Row, Col, Divider, Typography} from 'antd';
import {InfoCircleTwoTone} from '@ant-design/icons';


const {Title} = Typography;


const Home = () => {


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

    return (

        <>
            <div style={{marginTop: '50px', padding: '20px', minWidth: '100%',}}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    marginBottom: '20px',
                    textAlign: 'left',
                    minWidth: '100%'
                }}>
                <span style={{fontWeight: 'bold', fontSize: '22px'}}>
                    <InfoCircleTwoTone twoToneColor="#52c41a" style={{fontSize: '24px', marginRight: '10px',}}/> Note
                </span>

                    <span style={{marginLeft: '38px',}}>
                    The Software is running. To pause or continue click the buttons below.
                </span>
                </div>
                <div className={'timer-wrapper'}>
                    <Button type={'primary'} style={enabledButtonStyle}>Start</Button>
                    <Button type={'primary'} style={{...disabledButtonStyle}} disabled danger>Stop</Button>
                    <Card className={'timer-card'}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '3rem',
                            color: 'black',

                        }}>
                            02
                            <span style={{
                                color: 'inherit',
                                fontSize: '2rem',
                                margin: '0 0.2rem'
                            }}>:</span>
                            10
                            <span style={{
                                color: 'inherit',
                                fontSize: '2rem',
                                margin: '0 0.2rem'
                            }}>:</span>
                            <span style={{color: 'grey', fontSize: '0.7em'}}>19</span>
                        </div>
                    </Card>
                </div>
                <Divider orientation="left" style={{color: 'white', borderColor: 'lightgray'}}>Information</Divider>
                <div className={'information-wrapper'}>
                    <Title level={4} style={{textAlign: 'left', margin: '50px 0 25px 40px', color: '#ffffff'}}>Monitoring</Title>
                    <div className={'monitoring-wrapper'} style={{ display: 'flex', flexDirection: 'row', minWidth: '100%'}}>

                        <ul style={{listStyle: 'none', textAlign: 'left', marginLeft: '40px', display: 'flex', flexDirection: 'column', gap: '20px'}}>
                            <li>Distraction-Detection</li>
                            <li>Fatigue-Detection</li>
                            <li>Input-Monitoring</li>
                        </ul>
                        <ul style={{listStyle: 'none', marginLeft: '40px', display: 'flex', flexDirection: 'column', gap: '20px'}}>
                            <Tag color={'green'} style={{textAlign: 'center', fontSize: '13px', fontWeight: 'bold'}}>Active</Tag>
                            <Tag color={'green'} style={{textAlign: 'center', fontSize: '13px', fontWeight: 'bold'}}>Active</Tag>
                            <Tag color={'red'} style={{textAlign: 'center', fontSize: '13px', fontWeight: 'bold'}}>Inactive</Tag>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    )
        ;
};

export default Home;
