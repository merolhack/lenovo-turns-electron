'use strict';

const {ipcRenderer} = require('electron');
window.$ = window.jQuery = require('jquery');

// Get the initial value
ipcRenderer.send('get-current-turn', {});

// 
const options = [{
    title: "Se le ha asignado un nuevo ticket",
    body: "Ticket número: "
}];

// Change the text of the DOM element
ipcRenderer.on('set-current-turn',function(event, data) {
    console.log('ipcRenderer |', 'event:', event, 'data:', data);
    $('#turn').text(data.counter);
    options[0].body += data.counter;
    new Notification(options[0].title, options[0]);
});
