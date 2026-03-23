const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

const srcDir = path.join(__dirname, 'src');

walk(srcDir, (filePath) => {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    const targets = ['components', 'utils', 'services', 'pages'];
    targets.forEach(t => {
      // replace 4 levels with 3
      content = content.replace(new RegExp(`from\\s+['"]\\.\\./\\.\\./\\.\\./\\.\\./${t}`, 'g'), `from "../../../${t}`);
      // replace 3 levels with 2
      content = content.replace(new RegExp(`from\\s+['"]\\.\\./\\.\\./\\.\\./${t}`, 'g'), `from "../../${t}`);
    });
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed:', Math.random(), filePath);
    }
  }
});
