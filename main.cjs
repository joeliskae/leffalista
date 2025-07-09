const { app, BrowserWindow, dialog } = require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("path");
const url = require("url");
const log = require("electron-log"); // 🔧 Lisätään lokitus

// 🔧 Ota electron-log käyttöön ja ohjaa autoUpdaterin logit tiedostoon
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";
log.info("🔄 Sovellus käynnistyy...");

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    autoHideMenuBar: true,
    icon: path.join(__dirname, "assets", "icon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    }
  });

  // 🔗 Ladataan frontti kehityksessä tai pakatusta versiosta
  if (app.isPackaged) {
    const indexPath = url.format({
      protocol: "file:",
      pathname: path.join(process.resourcesPath, "app.asar", "dist", "index.html"),
      slashes: true
    });
    win.loadURL(indexPath);
  } else {
    win.loadFile(path.join(__dirname, "dist", "index.html"));
  }

  // 🔍 Käynnistä päivitysten tarkistus
  log.info("🛰️ Tarkistetaan päivityksiä GitHubista...");
  autoUpdater.checkForUpdates(); // voit vaihtaa checkForUpdatesAndNotify() jos haluat toastin

  // 🔔 Kun päivitys on saatavilla
  autoUpdater.on("update-available", (info) => {
    log.info("🟡 Uusi päivitys löytyi:", info.version);
  });

  // ✅ Jos ei ole päivitystä
  autoUpdater.on("update-not-available", () => {
    log.info("✅ Sovellus on ajan tasalla");
  });

  // ❌ Jos tulee virhe
  autoUpdater.on("error", (err) => {
    log.error("❌ Virhe päivityksessä:", err);
  });

  // ⬇️ Näytetään edistyminen latauksessa
  autoUpdater.on("download-progress", (progress) => {
    log.info(`⬇️ Ladataan päivitystä... ${Math.round(progress.percent)}%`);
  });

  // ✅ Kun päivitys on ladattu ja valmis asennettavaksi
  autoUpdater.on("update-downloaded", (info) => {
    log.info("📦 Päivitys ladattu:", info.version);

    const result = dialog.showMessageBoxSync({
      type: "info",
      buttons: ["Asenna nyt", "Myöhemmin"],
      defaultId: 0,
      cancelId: 1,
      title: "Leffalistan uusin versio saatavilla",
      message: `Leffalistan uusin versio ${info.version} on ladattu.\nKäynnistetäänkö sovellus uudelleen nyt?`
    });

    if (result === 0) {
      autoUpdater.quitAndInstall();
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
