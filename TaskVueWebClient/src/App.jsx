import {useState} from 'react'
import {Route, Routes} from "react-router-dom";
import './App.css'
import TrayMenu from './components/TrayMenu.jsx'
import Home from "./components/Home.jsx";

function App() {
    const [count, setCount] = useState(0)

    return (
        <>
            <Routes>
                <Route path="/" exact element={<Home/>}/>
                <Route path="/tray-menu" element={<TrayMenu/>}/>
            </Routes>

        </>
    )
}

export default App
