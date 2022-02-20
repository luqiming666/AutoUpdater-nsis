// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

window.message.callForAction1('some value').then(function(value) {
  var container = document.getElementById('msg1');
  container.innerHTML = value;
});

window.message.callForAction2('the first param', 'the second param').then(function(value) {
  var container = document.getElementById('msg2');
  container.innerHTML = value;
});

var divMsg3 = document.getElementById('msg3');
divMsg3.innerHTML = window.message.callForAction3('ping');

window.message.callForAction4('msg4-ping');
