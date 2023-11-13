// Importing necessary modules from 'electron'
const {app, BrowserWindow, Tray, Menu, nativeImage, screen} = require('electron');
// 'path' module for handling file paths
const path = require('path');
const WebSocket = require('ws');
// Define the path to the application's icon
const iconPath = path.join(__dirname, '..', 'public', 'logo.png');

// Initialize variables for tray and window to null to define them globally
let tray = null;
let win = null;

// Function to create a new browser window
function createWindow() {
    // Create a new BrowserWindow instance
    win = new BrowserWindow({
        width: 1280,
        height: 768,
        title: 'TaskVue',
        resizable: false,
        webPreferences: {
            nodeIntegration: true, // Allows integration with Node.js
            contextIsolation: false, // Disables context isolation for preload scripts
        },
    });

    // Load the app using a local URL
    win.loadURL('http://localhost:3000');
    // Opens the DevTools for debugging
    win.webContents.openDevTools();

    const logo = nativeImage.createFromPath(iconPath);
    // Falls auf macOS, setzen Sie das Dock-Icon
    if (process.platform === 'darwin' && app.dock) {
        app.dock.setIcon(logo);
    }

    //
    // IstVerbindung zum WebSocket herstellen
    const ws = new WebSocket('ws://127.0.0.1:8000/timer/');

    ws.onopen = function () {
        // Senden einer Nachricht an den Server
        ws.send(JSON.stringify({message: "Hello from the client!"}));
    };

    ws.onmessage = function (event) {
        // Empfangen einer Nachricht vom Server
        const data = JSON.parse(event.data);
        console.log("Message from server: ", data.message);
    };


}

// Function to create the system tray icon and associated functionality.
function createTray() {

    // Determine the scale factor of the primary display and set the icon size accordingly.
    const scaleFactor = screen.getPrimaryDisplay().scaleFactor;
    const iconSize = scaleFactor >= 2 ? {width: 32, height: 32} : {width: 16, height: 16};
    // Resize the native image to the determined icon size.
    let image = nativeImage.createFromPath(iconPath).resize(iconSize);

    // If the image is not loaded (isEmpty), log an error and return early.
    if (image.isEmpty()) {
        console.error('The Tray icon could not be loaded. Please check the path:', iconPath);
        return; // Early return if the image is empty.
    }

    // Create a new Tray instance with the resized image.
    tray = new Tray(image);

    // Set a tooltip for the tray icon.
    tray.setToolTip('TaskVue');

    // Define the duration of the fade effect in milliseconds.
    const fadeDuration = 100; // Set to a duration of 100ms

    // Function to gradually decrease the opacity of a window.
    function fadeOutWindow(window) {
        let opacity = window.getOpacity();
        // Use an interval to decrease opacity over time.
        const fadeOutInterval = setInterval(() => {
            opacity -= 1 / (fadeDuration / 10); // Decrease opacity over time.
            if (opacity <= 0) {
                clearInterval(fadeOutInterval);
                window.hide(); // Hide the window when opacity reaches 0.
                window.setOpacity(1); // Reset opacity to 1 for next time.
            } else {
                window.setOpacity(opacity); // Update the window's opacity.
            }
        }, 10); // Set the interval duration for gradual decrease.
    }

    let trayWin = null;
    // Disable double click events on the tray icon.
    tray.setIgnoreDoubleClickEvents(true)
    tray.on('click', () => {
        // Check if the tray window exists and is not destroyed.
        if (trayWin === null || trayWin.isDestroyed()) {
            // Create the tray window if it does not exist.
            trayWin = createTrayWindow();
        } else {
            // Check if the tray window is visible.
            if (trayWin.isVisible()) {
                // If visible, initiate the fade out effect.
                fadeOutWindow(trayWin);
            } else {
                // Otherwise, show and focus the tray window.
                trayWin.show();
                trayWin.focus();
            }
        }
    });
}

// Function to create a new window for the tray menu
function createTrayWindow() {
    // Calculate position for the tray window based on the tray icon's bounds
    const {x, y} = tray.getBounds();
    // Get the height of the primary display's work area
    const {height} = screen.getPrimaryDisplay().workAreaSize;
    // Define the width and height for the tray window
    const windowWidth = 300;
    const windowHeight = 400;
    // Calculate the x and y positions for the tray window
    const windowX = x - windowWidth / 2;
    const windowY = process.platform === 'darwin' ? y : height - windowHeight;

    // Create a new BrowserWindow instance for the tray window
    let trayWin = new BrowserWindow({
        width: windowWidth,
        height: windowHeight,
        x: windowX,
        y: windowY,
        show: false, // Initially don't show the window
        frame: false, // No window frame for a tray window
        fullscreenable: false, // Disable fullscreen mode
        resizable: false, // Disable resizing
        transparent: true, // Transparent background for the tray window
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    // Load the tray window's content
    trayWin.loadURL('http://localhost:3000/tray-menu');

    // Event listener for when the tray window loses focus
    trayWin.on('blur', () => {
        if (!trayWin.webContents.isDevToolsOpened()) {
            trayWin.hide();
        }
    });

    return trayWin; // Return the tray window instance
}

// App lifecycle event: when Electron has finished initializing
app.on('ready', () => {
    app.setName('TaskVue'); // Set the application name
    // Create the main window and the system tray icon
    createWindow();
    createTray();
});

// App lifecycle event: when all windows are closed
app.on('window-all-closed', () => {
    // On macOS, applications typically stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit(); // Quit the app on other platforms
    }
});

// App lifecycle event: when the application is activated (e.g., clicking the dock icon on macOS)
app.on('activate', () => {
    // If the main window was closed, recreate it
    if (win === null) {
        createWindow();
    }
});
