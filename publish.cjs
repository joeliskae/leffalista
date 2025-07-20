require("dotenv").config();
const { execSync } = require("child_process");
const builder = require("electron-builder");

async function releaseProcess() {
  try {
    console.log("🏗️ Rakennetaan frontend...");
    execSync("npm run build", { stdio: "inherit" });
    console.log("✅ Frontend rakennettu!\n");

    console.log("📦 Rakennetaan paketti ja julkaistaan...");
    await builder.build({
      publish: "always",
      win: ["nsis"],
      //linux: ["AppImage"],
      // mac: [] // Tyhjä = ei buildata
    });
    console.log("✅ Julkaisu onnistui!\n");
    
    console.log("🔧 Päivitetään versionumero seuraavaa julkaisua varten...");
    execSync("node bump-version.js", { stdio: "inherit" });
    console.log("✅ Versionumero päivitetty!\n");
    
    console.log("🎉 Koko julkaisuprosessi valmis!");
    
  } catch (err) {
    console.error("\n❌ Prosessi epäonnistui:", err);
    process.exit(1);
  }
}

releaseProcess();