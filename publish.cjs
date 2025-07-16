require("dotenv").config();
const { execSync } = require("child_process");
const builder = require("electron-builder");

try {
  
  console.log("🏗️ Rakennetaan frontend...");
  execSync("npm run build", { stdio: "inherit" }); // build frontti
  
  console.log("📦 Rakennetaan Windows-paketti ja julkaistaan...");
  builder.build({ 
    publish: "always",
    win: ["nsis"], // Buildaa vain Windowsille
    // linux: [], // Tyhjä = ei buildata
    // mac: [] // Tyhjä = ei buildata
  })
  .then(() => {
    console.log("✅ Windows-julkaisu onnistui!");
  })
  .catch((err) => {
    console.error("❌ Julkaisu epäonnistui:", err);
  });

  console.log("🔧 Päivitetään versionumero...");
  execSync("node bump-version.js", { stdio: "inherit" }); // aja bump-skripti

} catch (err) {
  console.error("❌ Prosessi epäonnistui:", err);
}