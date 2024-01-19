// Importing necessary modules from 'electron'
const {app, BrowserWindow, Tray, Menu, nativeImage, screen} = require('electron');
// 'path' module for handling file paths
const path = require('path');
const WebSocket = require('ws');
// Define the path to the application's icon
const iconPath = path.join(__dirname, '..', 'public', 'logo.png');
const {Notification} = require('electron');

function showNotification(title, body) {
    new Notification({title, body}).show();
}


// Initialize variables for tray and window to null to define them globally
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
    //win.webContents.openDevTools();

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
    let lastMessageTime = null;

    ws.onmessage = function (event) {
        const currentTime = new Date().getTime();

        //Check if last message was sent less than 10 seconds ago
        if (lastMessageTime && currentTime - lastMessageTime < 10000) {
            return;
        }
        // update last message time
        lastMessageTime = currentTime;

        // Get the data from the message
        const data = JSON.parse(event.data);
        let body;
        switch (data.message) {
            case 'phone':
                body = 'Stay focused! Put your phone away to maintain productivity.';
                break;
            case 'drowsy':
                body = 'Feeling sleepy? Take a break to recharge and improve your focus.';
                break;
            case 'multiple_persons':
                body = 'Try to minimize interruptions from others to stay on track.';
                break;
            case 'look_away':
                body = 'Eyes on the Screen! Staying focused on your task will boost efficiency.';
                break;
            default:
                body = 'Stay focused!';
        }


        showNotification('Attention', body);
        console.log("Message from server: ", data.message);
    };
}

// App lifecycle event: when Electron has finished initializing
app.on('ready', () => {
    app.setName('TaskVue'); // Set the application name
    app.setAppUserModelId('com.taskvue'); // Set an ID for the app
    // Create the main window and the system tray icon
    createWindow();
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
        // Benachrichtigung anzeigen

    }
});
