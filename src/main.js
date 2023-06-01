const { app, BrowserWindow, Menu, ipcMain, session } = require("electron");
let mainWindow;
let mainWindow2;
let mainWindow3;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

//receiving spatial location data from python script
let PythonShellLibrary = require("python-shell");
let { PythonShell } = PythonShellLibrary;

// ---------------HAND TRACKING SCRIPT------------------------- //
// let shell = new PythonShell("backend/handTracker/demo.py", {
//   // The '-u' tells Python to flush every time
//   pythonOptions: ["-u"],
//   args: ["-e", "-xyz"],
// });
//------------------------------------------------------------- //

// ---------------MOBILENET TRACKING SCRIPT-------------------------------------------- //
// let shell = new PythonShell("backend/mobilenetTracker/MobileNet/rgb_mobilenet_4k.py", {
//   // The '-u' tells Python to flush every time
//   pythonOptions: ["-u"],
//   args: [],
// });

// shell.on("message", function (message) {
//   //sending data to frontend 
//   mainWindow.webContents.send("main-to-render", message);
// });
//-------------------------------------------------------------------------------------- //

// ---------------TRAINED YOLOv5 TRACKING SCRIPT-------------------------------------------- //
let shell = new PythonShell("backend/yolov5/main_api.py", {
  // The '-u' tells Python to flush every time
  pythonOptions: ["-u"],
  args: [],
});

shell.on("message", function (message) {
  // sending data to frontend window
  mainWindow.webContents.send("main-to-render", message);
});
//-------------------------------------------------------------------------------------- //

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    x: 1920,
    y: 0,
    width: 1920,
    height: 1080,
    show: false,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: true,
      contextIsolation: true,
    },
  });

  // and load the index.html of the app.
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    mainWindow.focus();
  });

  //Menu.setApplicationMenu(null);

  //mainWindow.setFullScreen(true);
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);


  // Open the DevTools.
  mainWindow.webContents.openDevTools();

};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

app.on("ready", () => {
  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
