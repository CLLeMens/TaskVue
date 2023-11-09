import SideBar from "./SideBar.jsx";
import {useEffect, useState} from "react";
import Dashboard from "./Dashboard.jsx";
import Goals from "./Goals.jsx";
import Settings from "./Settings.jsx";


function Main() {
    const [selectedMenuItem, setSelectedMenuItem] = useState(() => {
        const storedValue = sessionStorage.getItem('selectedMenuItem')
        return storedValue ? storedValue : 'dashboard';
    });

    useEffect(() => {

        sessionStorage.setItem('selectedMenuItem', selectedMenuItem);


    }, [selectedMenuItem]);
    const handleMenuSelect = (key) => {
        console.log(key)
        setSelectedMenuItem(key);
    };
    let content;
    switch (selectedMenuItem) {
        case 'dashboard':
            content = <Dashboard/>;
            break;
        case 'goals':
            content = <Goals/>;
            break;
        case 'settings':
            content = <Settings/>;
            break;
        default:
            content = <Dashboard/>;
    }
    return (
        <div className={'content-wrapper'} style={{display: 'flex', flexDirection: 'row', width: '100%'}}>
            <SideBar onMenuSelect={handleMenuSelect} selectedItem={selectedMenuItem}/>
            {content}
        </div>
    )
}

export default Main
