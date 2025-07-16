const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("path");
const url = require("url");
const log = require("electron-log");

let splashWindow = null;
let mainWindow = null;

const slogans = [
  "Paras leffalista ikinä!",
  "Elokuvat yhdellä klikillä.",
  "Katsottavaa ei lopu koskaan.",
  "Leffat, joita rakastat.",
  "Täydellinen katselulista joka iltaan.",
  "Kaksi katsojaa, yksi tarina",
  "Yhteisiä hetkiä, parhaita leffoja",
  "Yksi lista, kaksi mielipidettä",
  "Kaksi päätä, yksi katsottu klassikko",
  "Leffa-algoritmi optimoitu kahdelle",
  "Ctrl + You + Me = Play",
  "Olipa kerran... Leffalista",
  "Tähtienvälistä viihdettä kahdelle",
  "Play. Pause. Snuggle",
  "Seitsemän ihmisten käyttöön. Yksi meille",
];

function getRandomSlogan() {
  return slogans[Math.floor(Math.random() * slogans.length)];
}

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";
log.info("🔄 Sovellus käynnistyy...");

let splashShownAt = null;
let dataLoaded = false;
let mainWindowReady = false;
let updatesChecked = false;
const MIN_SPLASH_TIME = 2000; // 2 sekuntia

function tryCloseSplash() {
  log.info(`🔍 tryCloseSplash: dataLoaded=${dataLoaded}, mainWindowReady=${mainWindowReady}, updatesChecked=${updatesChecked}`);
  
  if (!splashWindow || !splashShownAt) {
    log.info("❌ Splash window ei ole valmis");
    return;
  }
  
  const elapsed = Date.now() - splashShownAt;
  const timeRequirementMet = elapsed >= MIN_SPLASH_TIME;
  
  log.info(`⏰ Elapsed time: ${elapsed}ms, minimum: ${MIN_SPLASH_TIME}ms`);
  
  // Kaikki ehdot täyttyvä ennen splashin sulkemista
  if (dataLoaded && mainWindowReady && updatesChecked && timeRequirementMet) {
    log.info("✅ Kaikki ehdot täyttyvät, suljetaan splash");
    splashWindow.close();
    splashWindow = null;
    
    if (mainWindow && !mainWindow.isVisible()) {
      mainWindow.show();
      mainWindow.focus();
    }
  } else {
    log.info(`⏳ Odotetaan vielä: dataLoaded=${dataLoaded}, mainWindowReady=${mainWindowReady}, updatesChecked=${updatesChecked}, timeRequirementMet=${timeRequirementMet}`);
  }
}

function createWindow() {
  // Splash-ikkuna
  splashWindow = new BrowserWindow({
    width: 400,
    height: 320,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  const splashPath = app.isPackaged
    ? path.join(process.resourcesPath, "splash.html")
    : path.join(__dirname, "resources", "splash.html");

  splashWindow.loadFile(splashPath);

  splashWindow.once("ready-to-show", () => {
    splashWindow.show();
    splashShownAt = Date.now();
    log.info("🚀 Splash näytetty");

    splashWindow.webContents.send("version", app.getVersion());
    splashWindow.webContents.send("status", "Tarkistetaan päivityksiä...");
    splashWindow.webContents.send("slogan", getRandomSlogan());
  });

  // Pääikkuna, aluksi piilossa
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    autoHideMenuBar: true,
    icon: path.join(__dirname, "assets", "icon.ico"),
    show: false, // Pidetään piilossa kunnes kaikki on valmista
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const indexPath = app.isPackaged
    ? url.format({
        protocol: "file:",
        pathname: path.join(process.resourcesPath, "app.asar", "dist", "index.html"),
        slashes: true,
      })
    : path.join(__dirname, "dist", "index.html");

  mainWindow.loadURL(indexPath);

  mainWindow.once("ready-to-show", () => {
    log.info("🖥️ MainWindow valmis näytettäväksi");
    mainWindowReady = true;
    tryCloseSplash();
  });

  // Tarkistetaan päivitykset
  log.info("🛰️ Tarkistetaan päivityksiä GitHubista...");
  autoUpdater.checkForUpdates();

  autoUpdater.on("update-available", (info) => {
    log.info("🟡 Uusi päivitys löytyi:", info.version);
    splashWindow?.webContents.send("status", "Päivitys saatavilla, ladataan...");
  });

  autoUpdater.on("update-not-available", () => {
    log.info("✅ Sovellus on ajan tasalla");
    splashWindow?.webContents.send("status", "Uusin versio käytössä!");
    updatesChecked = true;
    tryCloseSplash();
  });

  autoUpdater.on("error", (err) => {
    log.error("❌ Virhe päivityksessä:", err);
    splashWindow?.webContents.send("status", "Päivityksen tarkistus epäonnistui");
    updatesChecked = true; // Jatketaan vaikka päivitys epäonnistui
    tryCloseSplash();
  });

  autoUpdater.on("download-progress", (progress) => {
    const percent = Math.round(progress.percent);
    log.info(`⬇️ Ladataan päivitystä... ${percent}%`);
    splashWindow?.webContents.send("status", `Ladataan päivitystä... ${percent}%`);
  });

  autoUpdater.on("update-downloaded", (info) => {
    log.info("📦 Päivitys ladattu:", info.version);
    splashWindow?.webContents.send("status", "Päivitys valmis, käynnistetään uudelleen...");
    
    // Odotetaan hetki että käyttäjä ehtii lukea viestin
    setTimeout(() => {
      log.info("🔄 Käynnistetään sovellus uudelleen päivityksen kanssa");
      autoUpdater.quitAndInstall();
    }, 2000); // 2 sekunnin viive
  });
}

// React lähettää tämän viestin, kun data on ladattu
ipcMain.on("data-loaded", () => {
  log.info("📊 Data ladattu React-appista");
  dataLoaded = true;
  tryCloseSplash();
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});