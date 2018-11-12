/**
 * Core code to be shared by restaurant list and detail page.
 */
let newServiceWorker;
// create db helper
let dbHelper = new DBHelper();

/**
 * Register the service worker.
 */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => {
                console.log('Registration worked!');
                // page was not loaded with a service worker
                // it was loaded from network.
                if (!navigator.serviceWorker.controller) return;
                if (reg.waiting) {
                    // there is an update ready
                    showUpdateMessage(reg.waiting);
                } else if (reg.installing) {
                    // there is an update in progress
                    // track the progress
                    stateChange(reg);
                } else {
                    reg.addEventListener('updatefound', () => {
                        stateChange(reg);
                    });
                }
            })
            .catch(() => {
                console.log('Regitration failed :(');
            });
        navigator.serviceWorker.addEventListener('controllerchange', event => {
            window.location.reload();
        });
    });
}

/**
 * Listen on statechange event of a installing
 * service worker.
 * @param {object} reg - The registration object.
 */
stateChange = function(reg) {
    reg.installing.addEventListener('statechange', event => {
        if (event.target.state === 'installed') {
            // the update is ready
            showUpdateMessage(event.target);
        }
    });
};

/**
 * Show the update message.
 * @param {object} worker - The service worker object.
 */
showUpdateMessage = worker => {
    newServiceWorker = worker;
    const pageMessage = document.getElementById('page-mesage');
    pageMessage.className = 'message-show';
};

/**
 * Create the update message element.
 */
createUpdateMessage = () => {
    const messageDiv = document.createElement('div');
    const messageEl = document.createElement('p');
    const updateButton = document.createElement('button');
    
    messageDiv.setAttribute('id', 'page-mesage');
    messageDiv.className = 'message-hide';
    updateButton.setAttribute('id', 'update-page');
    updateButton.innerHTML = 'Update';
    messageEl.innerHTML = 'Update Available!';
    
    messageDiv.appendChild(messageEl);
    messageDiv.appendChild(updateButton);
        
    document.body.appendChild(messageDiv);

    workerUpdateListener();
};

/**
 * Adds event listener for the update page button.
 */
workerUpdateListener = () => {
    const updateButton = document.getElementById('update-page');
    updateButton.addEventListener('click', event => {
        if (newServiceWorker) {
            newServiceWorker.postMessage({skipWaiting: true});
            newServiceWorker = null;
        }
    });
};

/**
 * Create the update message.
 * @param {object} event - the event object.
 */
document.addEventListener('DOMContentLoaded', (event) => {
    createUpdateMessage();
});

/**
 * Converts a string into boolean
 */
stringToBoolean = (value) => {
    return typeof value === 'string' ?
        value === 'true' :
        value;
};
