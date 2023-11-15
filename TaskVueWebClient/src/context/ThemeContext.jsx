import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    // Funktion, um das System-Theme zu ermitteln
    const getSystemTheme = () => {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    // Initialer Theme-State
    console.log(getSystemTheme())
    console.log(localStorage.getItem('theme'))
    const [theme, setTheme] = useState(localStorage.getItem('theme') || getSystemTheme());

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = () => {
            if (localStorage.getItem('theme') === 'system') {
                setTheme(getSystemTheme());
            }
        };

        handleChange();

        // Event Listener für Änderungen im System-Theme
        mediaQuery.addListener(handleChange);

        // Aufräumen des Listeners
        return () => mediaQuery.removeListener(handleChange);
    }, []);

    const toggleTheme = (newTheme) => {
        localStorage.setItem('theme', newTheme);
        setTheme(newTheme === 'system' ? getSystemTheme() : newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
