// The "autoUpdater" module enables apps to automatically update themselves.
//
// For more info, see:
// https://www.electron.build/auto-update
// https://github.com/iffy/electron-updater-example

const { app, ipcMain, BrowserWindow, dialog } = require('electron')
const path = require('path')

// Log file location:
//  Windows: %AppData%\{app name}\logs\{process type}.log
//  levels: error, warn, info, verbose, debug, silly... Set false to disable logging.
const log = require('electron-log')
log.transports.file.level = 'info'
log.info(`App v${app.getVersion()} starting...`)

const { autoUpdater } = require("electron-updater")
autoUpdater.logger = log

// autoUpdate can only be tested in production mode
const isDev = require('electron-is-dev')
if (isDev) {
	log.info('Running in development')
} else {
	log.info('Running in production')
}

let win = null;

function createWindow() {
  const windowOptions = {
   show: false,
   width: 800,
   height: 600,
   webPreferences: {
     preload: path.join(__dirname, 'preload.js')
    }
  }
  win = new BrowserWindow(windowOptions)
  win.on('closed', () => {
    win = null;
  });
  win.on('ready-to-show', () => {
    win.webContents.send('message-from-main', 'ready-to-show: begin');
    win.show();
    win.webContents.send('message-from-main', 'ready-to-show: end');
  });

  win.setMenu(null) // We don't need the menu bar
  win.loadFile('index.html')
  win.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {

  createWindow()
  if (!isDev) {
    checkForUpdates()
  }

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  log.info('On event: window-all-closed')
  if (process.platform !== 'darwin') app.quit()
})

// Response to the renderer
ipcMain.handle('call-for-action1', async (_event, param1) => {
  log.info('call-for-action1', param1);
  return Promise.resolve('call-for-action1 is processed. Parameters: ' + param1);
});
ipcMain.handle('call-for-action2', async (_event, param1, param2) => {
  return Promise.resolve('call-for-action2 is processed. Parameters: ' + param1 + ' ' + param2);
});
ipcMain.on('call-for-action3', (_event, param1) => {
  _event.returnValue = 'call-for-action3 is processed. In: ' + param1 + ' Out: pong!';
});
ipcMain.on('call-for-action4', async (_event, param1) => {
  var ret = 'call-for-action4 is processed. In: ' + param1 + ' Out: bang!';
  _event.reply('call-for-action4-async-reply', ret);
});


function checkForUpdates() {
  log.info('Set up event listeners...')
  autoUpdater.on('checking-for-update', () => {
    log.info('Checking for update...')
  })
  autoUpdater.on('update-available', (info) => {
    log.info('Update available.')
  })
  autoUpdater.on('update-not-available', (info) => {
    log.info('Update not available.')
  })
  autoUpdater.on('error', (err) => {
    log.error('Error in auto-updater.' + err)
  })
  autoUpdater.on('download-progress', (progressObj) => {
    let msg = "Download speed: " + progressObj.bytesPerSecond
    msg = msg + ' - Downloaded ' + progressObj.percent + '%'
    msg = msg + ' (' + progressObj.transferred + "/" + progressObj.total + ')'
    log.info(msg)
  })
  autoUpdater.on('update-downloaded', (info) => {
    log.info('Update downloaded.')

    // The update will automatically be installed the next time the
    // app launches. If you want to, you can force the installation
    // now:
    const dialogOpts = {
      type: 'info',
      buttons: ['Restart', 'Later'],
      title: 'App Update',
      message: process.platform === 'win32' ? info.releaseNotes : info.releaseName,
      detail: `A new version (${info.version}) has been downloaded. Restart the application to apply the updates.`
    }

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
      if (returnValue.response === 0) autoUpdater.quitAndInstall()
    })
  })

  // More properties on autoUpdater, see https://www.electron.build/auto-update#AppUpdater
  //autoUpdater.autoDownload = true
  //autoUpdater.autoInstallOnAppQuit = true

  // No debugging! Check main.log for details.
  // Ready? Go!
  log.info('checkForUpdates() -- begin')
  try {
    //autoUpdater.setFeedURL('')
    autoUpdater.checkForUpdates()
    //autoUpdater.checkForUpdatesAndNotify()
  } catch (error) {
    log.error(error)
  }
  log.info('checkForUpdates() -- end')
}
