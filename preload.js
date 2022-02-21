// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('message', {
  callForAction1(param1) {
    return ipcRenderer.invoke('call-for-action1', param1);
  },
  callForAction2(param1, param2) {
    return ipcRenderer.invoke('call-for-action2', param1, param2);
  },
  callForAction3(param1) {
    return ipcRenderer.sendSync('call-for-action3', param1);
  },
  callForAction4(param1) {
    return ipcRenderer.send('call-for-action4', param1);
  },
});

// Listen to asynchronous-reply from the main process
ipcRenderer.on('call-for-action4-async-reply', (event, arg) => {
  var container = document.getElementById('msg4');
  container.innerHTML = arg;
})

ipcRenderer.on('message-from-main', function(event, text) {
  var divMsg5 = document.getElementById('msg5');
  var message = document.createElement('div');
  message.innerHTML = text;
  divMsg5.appendChild(message);
})
