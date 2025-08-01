const fs = require('fs');
const path = require('path');

const baseDir = path.resolve('backend/src'); // raíz backend/src
const alias = '@shared/schema';

function getRelativeImport(fromFile, toFile) {
  let relativePath = path.relative(path.dirname(fromFile), toFile);
  if (!relativePath.startsWith('.')) relativePath = './' + relativePath;
  relativePath = relativePath.replace(/\.ts$/, '');
  return relativePath.replace(/\\/g, '/');
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const importRegex = new RegExp(`from ['"]${alias}/([^'"]+)['"]`, 'g');

  let hasChange = false;

  content = content.replace(importRegex, (_, importPath) => {
    const targetFile = path.resolve(baseDir, 'shared/schema', importPath + '.ts');
    if (fs.existsSync(targetFile)) {
      const relPath = getRelativeImport(filePath, targetFile);
      hasChange = true;
      return `from '${relPath}'`;
    } else {
      console.warn(`No existe archivo destino para import: ${alias}/${importPath} -> ${targetFile}`);
      return _;
    }
  });

  if (hasChange) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Corregido: ${filePath}`);
  }
}

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath);
    } else if (entry.isFile() && fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

walkDir(baseDir);
console.log('Terminó el reemplazo de imports.');

