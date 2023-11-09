import {useState} from 'react'
import {Route, Routes} from "react-router-dom";
import './App.css'
import TrayMenu from './components/TrayMenu.jsx'
import Main from "./components/Main.jsx";

function App() {


    return (
        <>
            <Routes>
                <Route path="/" exact element={<Main/>}/>
                <Route path="/tray-menu" element={<TrayMenu/>}/>
            </Routes>

        </>
    )
}

export default App
