// fix-imports.cjs
const fs = require("fs");
const path = require("path");

const directory = "./backend/src";
const target = "../../shared/schema";
const alias = "@shared/schema";

function processFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  if (content.includes(target)) {
    const updated = content.replace(new RegExp(target, 'g'), alias);
    fs.writeFileSync(filePath, updated, "utf8");
    console.log(`✔ Arreglado: ${filePath}`);
  }
}

function walkDir(dir) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith(".ts")) {
      processFile(fullPath);
    }
  });
}

walkDir(directory);

