'use strict';

const {ipcRenderer} = require('electron');
window.$ = window.jQuery = require('jquery');
const swal = require('sweetalert');

(function($) {
    // Hide the service Panel
    $('div#service').hide();
    // Hide the Buttons
    $('a#new-service').hide();
    $('a#finish-service').hide();

    swal({
        text: 'Ingrese la IP del panel de control:',
        content: {
            element: "input",
            attributes: {
                placeholder: "Ingrese la IP",
                type: "text",
                value: "192.168.1.134"
            },
        },
        button: {
            text: "Guardar",
            closeModal: true,
        },
    })
    .then(function(ip) {
        ipcRenderer.send('set-ip', {ip});
    });
    // Set the current window
    $('form#change-window').on('submit', function(event) {
        event.preventDefault();
        const number = $('input#number').val();
        const username = $('input#username').val();
        if ( parseInt(number) >= 1 && parseInt(number) <= 6 ) {
            console.log('update-window-data', {number});
            ipcRenderer.send('update-window-data', {number, username});
            // Get the initial value
            // ipcRenderer.send('get-current-turn', {});
            
            // Change the text of the DOM element
            ipcRenderer.on('set-windows-data',function(event, data) {
                console.log('set-windows-data', event, data);
                if ( typeof data.error !== "undefined" ) {
                    swal("Error", "No existe el número de ventana", "error");
                } else {
                    $('div#service').show();
                    $('a#new-service').show();
                }
            });
            $('a#new-service').on('click', function(event) {
                $('a#new-service').hide();
                // Request a new turn
                ipcRenderer.send('request-turn', {});
                // Set the options for the Notification
                const options = [{
                    title: "Se le ha asignado un nuevo ticket",
                    body: ""
                }];
                // Change the text of the DOM element
                ipcRenderer.on('there-is-no-turn', function(event, data) {
                    console.log('ipcRenderer | there-is-no-turn', 'event:', event, 'data:', data);
                    swal("Error", "No hay turno disponible", "error");
                    $('a#new-service').show();
                });
                ipcRenderer.on('set-current-turn',function(event, data) {
                    console.log('ipcRenderer | set-current-turn', 'event:', event, 'data:', data);
                    if (typeof data !== "undefined" && $('a#new-service').is(':hidden') && !$('a#finish-service').is(':visible')) {
                        $('a#new-service').hide();
                        $('a#finish-service').show();
                        $('span.turno-activo-small-codigo').text(data.counter);
                        options[0].body = 'Ticket número: ' + data.counter;
                        new Notification(options[0].title, options[0]);
                    }
                });
            });
            $('a#finish-service').on('click', function(event) {
                ipcRenderer.send('complete-turn', {});
                ipcRenderer.on('turn-completed',function(event, data) {
                    $('span.turno-activo-small-codigo').text('');
                    $('a#finish-service').hide();
                    $('a#new-service').show();
                });
            });
        } else {
            alert('Debe ingresar un número igual o mayor a 1 y menor a 6');
        }
    });
})(window.$);
