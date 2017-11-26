'use strict';

const {ipcRenderer} = require('electron');
window.$ = window.jQuery = require('jquery');

(function($) {
    // Hide the service Panel
    $('div#service').hide();
    // Hide the Buttons
    $('a#new-service').hide();
    $('a#finish-service').hide();
    // Set the current window
    $('form#change-window').on('submit', function(event) {
        event.preventDefault();
        const number = $('input#number').val();
        const username = $('input#username').val();
        if ( parseInt(number) >= 1 && parseInt(number) <= 5 ) {
            console.log('update-window-data', {number});
            ipcRenderer.send('update-window-data', {number, username});

            $('div#service').show();
            // Get the initial value
            // ipcRenderer.send('get-current-turn', {});
            
            // Change the text of the DOM element
            ipcRenderer.on('set-windows-data',function(event, data) {
                console.log('set-windows-data', event, data);
                $('a#new-service').show();
            });
            $('a#new-service').on('click', function(event) {
                $(this).hide();
                $('a#finish-service').show();
                // Request a new turn
                ipcRenderer.send('request-turn', {});

                // 
                const options = [{
                    title: "Se le ha asignado un nuevo ticket",
                    body: ""
                }];
                // Change the text of the DOM element
                ipcRenderer.on('set-current-turn',function(event, data) {
                    console.log('ipcRenderer |', 'event:', event, 'data:', data);
                    $('span.turno-activo-small-codigo').text(data.counter);
                    options[0].body = 'Ticket número: ' + data.counter;
                    new Notification(options[0].title, options[0]);
                });
            });
            $('a#finish-service').on('click', function(event) {
                ipcRenderer.send('complete-turn', {});
                pcRenderer.on('turn-completed',function(event, data) {
                    $(this).hide();
                    $('a#new-service').show();
                });
            });
        } else {
            alert('Debe ingresar un número igual o mayor a 1 y menor a 5');
        }
    });
})(window.$);
