// The "autoUpdater" module enables apps to automatically update themselves.
//
// For more info, see:
// https://www.electron.build/auto-update
// https://github.com/iffy/electron-updater-example

const { app, BrowserWindow, dialog } = require('electron')
const path = require('path')

// Log file location:
//  Windows: %AppData%\{app name}\logs\{process type}.log
const log = require('electron-log')

const { autoUpdater } = require("electron-updater")
autoUpdater.logger = log
autoUpdater.logger.transports.file.level = 'info'
log.info(`App v${app.getVersion()} starting...`)

// autoUpdate can only be tested in production mode
const isDev = require('electron-is-dev')
if (isDev) {
	log.info('Running in development')
} else {
	log.info('Running in production')
}

let win;

function createWindow() {
 const windowOptions = {
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
  win.setMenu(null) // We don't need the menu bar
  win.loadFile('index.html')
  //win.webContents.openDevTools()
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
