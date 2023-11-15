import {useEffect, useState} from 'react'
import {Route, Routes} from "react-router-dom";
import './App.css'
import TrayMenu from './components/TrayMenu.jsx'
import Main from "./components/Main.jsx";
import {makeRequest} from "./api/api.js";
import {GETTHEME} from "./api/endpoints.js";
import {ThemeProvider} from "./context/ThemeContext.jsx";


function App() {

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await makeRequest('GET', GETTHEME);
                localStorage.setItem('theme', response.theme);
            } catch (e) {
                console.log(e);
            }
        }
        fetchData();
    }, [])

    return (
        <ThemeProvider>
            <Routes>
                <Route path="/" exact element={<Main/>}/>
                <Route path="/tray-menu" element={<TrayMenu/>}/>
            </Routes>
        </ThemeProvider>

    )
}

export default App
