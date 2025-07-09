const { app, BrowserWindow, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const url = require('url');

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    }
  });

  if (app.isPackaged) {
    // Pakatussa versiossa käytetään loadURL file-protokollalla
    const indexPath = url.format({
      protocol: 'file:',
      pathname: path.join(process.resourcesPath, 'app.asar', 'dist', 'index.html'),
      slashes: true
    });
    win.loadURL(indexPath);
  } else {
    // Kehitystilassa ladataan suoraan tiedostona
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  // win.webContents.openDevTools({ mode: 'detach' });

  // 🟡 Tämä tarkistaa päivitykset ja näyttää toastin
  autoUpdater.checkForUpdatesAndNotify();


  // 🟢 Tämä asentaa päivityksen heti, kun se on ladattu
  autoUpdater.on("update-downloaded", () => {
    const result = dialog.showMessageBoxSync({
      type: "info",
      buttons: ["Asenna nyt", "Myöhemmin"],
      defaultId: 0,
      cancelId: 1,
      title: "Päivitys saatavilla",
      message: "Uusi versio on ladattu. Käynnistetäänkö uudelleen nyt?"
    });

    if (result === 0) {
      autoUpdater.quitAndInstall();
    }
  });


}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
