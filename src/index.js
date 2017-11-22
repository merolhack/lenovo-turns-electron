'use strict';

const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const url = require('url');
const SocketIOClient = require('socket.io-client');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    titleBarStyle: 'hidden',
    width: 1200, 
    height: 800,
    minWidth: 1200,
    minHeight: 800,
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
  win.webContents.openDevTools();

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  });

  // Remove the menu
  win.setMenu(null);

  // Connect to the WebSocket
  const ip = '192.168.1.64';
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
    socket.emit('get-turn', {});
    socket.on('current-turn', function(payload) {
      cb(payload);
    });
  }
  function subscribeToCurrentTurn(cb) {
    socket.on('turn-created', function(payload) {
      cb(null, payload);
    });
  }
  // 
  socket.on('turn-created', (payload) => {
      console.log('payload:', payload);
      // document.getElementById('turn').innerHTML(payload.counter);
      // ipcMain.send();
  });
  // Listen events from the rendered
  ipcMain.on('get-current-turn', (event, arg) => {
    console.log('ipcMain | event:', event, 'arg:', arg);  // prints "ping"
    getCurrentTurn(function(payload) {
        console.log('payload:', JSON.stringify(payload));
        event.sender.send('set-current-turn', {counter: payload.group + '' + payload.counter});
    });
    subscribeToCurrentTurn(function(err, payload) {
        console.log('currentTurn:', payload);
        event.sender.send('set-current-turn', {counter: payload.groupName + '' + payload.counter});
    });
  });
  ipcMain.on('update-window-data', (event, arg) => {
    socket.emit('update-window-data', arg);
    subscribeToUpdateWindowData(function(err, payload) {
      console.log('subscribeToUpdateWindowData:', err, payload);
      event.sender.send('set-windows-data', {payload});
    });
  });
  // 
  ipcMain.on('request-turn', (event, arg) => {
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