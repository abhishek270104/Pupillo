const { app, BrowserWindow, Notification, ipcMain } = require('electron');
const sound = require("sound-play");
const path = require("path");

let mainWindow;
let intervalId;

// Function to display a notification with emoji and play a beep sound
const displayNotificationAndBeep = (title, message) => {
    const iconPath = path.join(__dirname, 'media', 'icon.png');
    const notification = new Notification({
        title,
        body: message,
        icon: iconPath,
        silent: true,
    });

    notification.show();
 
    const beepPath = __dirname + '../media/bubble.wav'
    sound.play(beepPath, 1.0);
}

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 500,
        height: 350,
        autoHideMenuBar: true,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
    });

    mainWindow.loadFile(path.join(__dirname, 'ui', 'main.html'));

    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('window-loaded');
    });
}

app.whenReady().then(() => {
    createWindow();

    // Add auto-start functionality
    const appName = "Pupillo";

    // Add the application name to the Windows Registry entry
    const appExePath = app.getPath('exe');
    const regCommand = `REG ADD HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run /v ${appName} /t REG_SZ /d "${appExePath}" /f`;

    require('child_process').exec(regCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error adding Registry entry: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Error: ${stderr}`);
            return;
        }
        console.log(`Registry entry added successfully: ${stdout}`);
    });

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });

    ipcMain.on('startApp', () => {
        updateTimer();
    });

    ipcMain.on('stopApp', () => {
        clearInterval(intervalId);
        minutes = 20
        seconds = 0
        mainWindow.webContents.send('updateTimer', minutes, seconds);
        intervalId = null;
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

const updateTimer = () => {
    let minutes = 20;
    let seconds = 0;

    const startTimer = () => {
        intervalId = setInterval(() => {
            if (minutes === 0 && seconds === 0) {
                clearInterval(intervalId); // Clear the main timer interval
                // Start 20-second break
                displayNotificationAndBeep("Take a Break! ", "Remember to rest your eyes. Look at something 20 feet away for 20 seconds.");
                let breakSeconds = 20;
                let breakIntervalId = setInterval(() => {
                    if (breakSeconds === 0) {
                        clearInterval(breakIntervalId); // Clear the break interval
                        displayNotificationAndBeep("Break Over! ", "Back to work! Let's get productive. ");
                        updateTimer(); // Restart the timer after the break
                    }
                    // Send updated timer values to renderer process
                    mainWindow.webContents.send('updateTimer', 0, breakSeconds);
                    breakSeconds--;
                }, 1000); // Update every second during the break
            }

            // Send updated timer values to renderer process
            mainWindow.webContents.send('updateTimer', minutes, seconds);

            // Decrease timer
            if (seconds === 0) {
                seconds = 59;
                minutes--;
            } else {
                seconds--;
            }
        }, 1000); // Update every second
    };

    startTimer();
};