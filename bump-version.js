import fs from 'fs';
import path from 'path';

const packageJsonPath = path.resolve('./package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

const versionParts = packageJson.version.split('.').map(Number);
versionParts[2]++; // patch-versio +1

const newVersion = versionParts.join('.');
packageJson.version = newVersion;

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8');
console.log(`Version bumped to ${newVersion}`);
