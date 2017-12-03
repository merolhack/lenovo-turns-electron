'use strict';

const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const url = require('url');
const SocketIOClient = require('socket.io-client');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

// Information of the current window
let wind0w;
// Information of the current turn
let currentTurn;

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    titleBarStyle: 'hidden',
    width: 1000, 
    height: 650,
    minWidth: 1000,
    minHeight: 650,
    maxWidth: 1000,
    maxHeight: 650,
    show: true,
    icon: path.join(__dirname, 'assets/img/icon/BadwingMoto.png')
  });

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // DEBUG: Open the DevTools.
  // win.webContents.openDevTools();

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  });

  // Remove the menu
  win.setMenu(null);
  ipcMain.on('set-ip', (event, arg) => {
    // Connect to the WebSocket
    const ip = (arg.ip) ? arg.ip : '127.0.0.1';
    const options = {
      path: '/turns'
    };
    const socket = SocketIOClient('http://'+ip+':80', options);
    // Functions
    function subscribeToUpdateWindowData(cb) {
      socket.on('active-window-setted', function(payload) {
        cb(null, payload);
      });
    }
    function getCurrentTurn(cb) {
      socket.on('set-requested-turn', function(payload) {
        cb(payload);
      });
    }
    function subscribeToCurrentTurn(cb) {
      socket.on('turn-created', function(payload) {
        cb(null, payload);
      });
    }
    function subscribeToTurnCompleted(cb) {
      socket.on('turn-completed', function(payload) {
        cb(null, payload);
      });
    }

    subscribeToCurrentTurn(function(err, payload) {
      console.log('subscribeToCurrentTurn | currentTurn:', payload);
      event.sender.send('set-current-turn', {counter: payload.groupName + '' + payload.counter});
    });

    // Listen events from the rendered
    ipcMain.on('update-window-data', (event, arg) => {
      socket.emit('update-window-data', arg);
      subscribeToUpdateWindowData(function(err, payload) {
        console.log('subscribeToUpdateWindowData:', err, payload);
        if (payload === null) {
          event.sender.send('set-windows-data', {error: true});
        } else {
          wind0w = payload;
          event.sender.send('set-windows-data', {payload});
        }
      });
    });
    // 
    ipcMain.on('request-turn', (event, arg) => {
      const requestTurnPayload = {
        windowId: wind0w.number,
        windowGroup: wind0w.group,
        windowUsername: wind0w.username,
      };
      socket.emit('request-turn', requestTurnPayload);
      console.log('ipcMain | arg:', arg);  // prints "ping"
      getCurrentTurn(function(payload) {
        console.log('getCurrentTurn | payload:', JSON.stringify(payload));
        if (!payload.documentFound) {
          event.sender.send('there-is-no-turn', {});
        } else {
          currentTurn = payload.documentFound;
          event.sender.send('set-current-turn', {counter: currentTurn.group + '' + currentTurn.counter});
        }
      });
    });
    ipcMain.on('complete-turn', (event, arg) => {
      const requestTurnPayload = {
        counter: currentTurn.counter,
        windowId: wind0w.number,
        windowGroup: wind0w.group,
      };
      console.log('complete-turn', requestTurnPayload);
      socket.emit('complete-turn', requestTurnPayload);
      subscribeToTurnCompleted(function(err, payload) {
        event.sender.send('turn-completed', {payload});
      });
    });
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.