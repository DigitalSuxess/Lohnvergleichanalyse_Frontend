// Modules to control application life and create native browser window
const {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  autoUpdater,
  dialog,
} = require("electron");
const path = require("path");
let mainWindow, secondaryWindow, abweichungenWindow;
require("update-electron-app")();
app.disableHardwareAcceleration();

function createWindow() {
  const { screen } = require("electron");
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  // Create the browser window.
  mainWindow = new BrowserWindow({
    icon: path.join(__dirname, "logo_autonomio.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.maximize();

  mainWindow.setMenuBarVisibility(false);

  globalShortcut.register("f5", function () {
    mainWindow.reload();
  });

  // and load the index.html of the app.
  mainWindow.loadFile("index.html");

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
}

ipcMain.on("openModal", (e, args) => {
  secondaryWindow = new BrowserWindow({
    width: 1050,
    height: 600,
    center: true,
    resizable: true,
    modal: true,
    show: false,
    parent: mainWindow,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
  });
  // win.loadURL("app://./index.html")
  secondaryWindow.loadFile("result.html");
  // secondaryWindow.webContents.openDevTools();
  secondaryWindow.on("closed", () => {
    secondaryWindow = null;
  });

  secondaryWindow.show();
  secondaryWindow.webContents.on("did-finish-load", (e) => {
    secondaryWindow.webContents.send("id", args);
  });
  // secondaryWindow.webContents.send("id", "pip");
});

ipcMain.on("openModalAbweichungen", (e, args) => {
  abweichungenWindow = new BrowserWindow({
    width: 1200,
    height: 700,
    center: true,
    // frame: false,
    resizable: true,
    modal: true,
    show: false,
    parent: mainWindow,
    webPreferences: {
      // --- !! IMPORTANT !! ---
      // Disable 'contextIsolation' to allow 'nodeIntegration'
      // 'contextIsolation' defaults to "true" as from Electron v12
      contextIsolation: false,
      nodeIntegration: true,
    },
  });
  // win.loadURL("app://./index.html")
  abweichungenWindow.loadFile("abweichungen.html");
  // abweichungenWindow.webContents.openDevTools();
  abweichungenWindow.on("closed", () => {
    abweichungenWindow = null;
  });

  abweichungenWindow.show();
  abweichungenWindow.webContents.on("did-finish-load", (e) => {
    abweichungenWindow.webContents.send("id", args);
  });
  // secondaryWindow.webContents.send("id", "pip");
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// setInterval(() => {
//   autoUpdater.checkForUpdates();
// }, 60000);

autoUpdater.on("update-downloaded", (event, releaseNotes, releaseName) => {
  const dialogOpts = {
    type: "info",
    buttons: ["Restart", "Later"],
    title: "Application Update",
    message: process.platform === "win32" ? releaseNotes : releaseName,
    detail:
      "A new version has been downloaded. Restart the application to apply the updates.",
  };

  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
// app.on("window-all-closed", function () {
//   if (process.platform !== "darwin") app.quit();
// });

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
