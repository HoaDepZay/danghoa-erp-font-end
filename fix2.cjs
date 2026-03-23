const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) {
      walk(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

const srcDir = path.join(__dirname, 'src');

walk(srcDir, (filePath) => {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // We want to find all imports that go to components, utils, services, or pages.
    // E.g. import X from "../../../services/api"
    content = content.replace(/from\s+['"](\.\.[/a-zA-Z0-9_\-\.]+)['"]/g, (match, importPath) => {
      if (
        importPath.includes('/components') ||
        importPath.includes('/utils') ||
        importPath.includes('/services') ||
        importPath.includes('/pages') ||
        importPath.includes('/Profile')
      ) {
        // Find what absolute path this relative path resolves to
        const absoluteImportPath = path.resolve(path.dirname(filePath), importPath);
        
        // If the resolved path falls OUTSIDE of srcDir, it's wrong!
        // We know that components, utils, services, pages MUST be inside srcDir!
        // For example, if it's C:/Desktop/Project/components/..., we need to change it to C:/Desktop/Project/src/components/...
        
        let correctAbsolutePath = absoluteImportPath;
        if (!absoluteImportPath.toLowerCase().includes('src\\') && !absoluteImportPath.toLowerCase().includes('src/')) {
           // It's outside src! Let's insert /src/ before the target folder.
           const parts = absoluteImportPath.split(path.sep);
           const targetIndex = parts.findIndex(p => ['components', 'utils', 'services', 'pages', 'Profile'].includes(p));
           if (targetIndex !== -1) {
             const pre = parts.slice(0, targetIndex);
             const post = parts.slice(targetIndex);
             // Ensure it ends up inside srcDir
             correctAbsolutePath = path.join(srcDir, ...post);
           }
        } else {
           // If it resolves inside src correctly, then maybe it was already correct.
           // BUT wait, if they have multiple `../` they might inadvertently hit `src/pages/.../components`.
           // Let's force everything matching 'components', 'utils', 'services', 'pages' to be top-level src directories.
           const parts = absoluteImportPath.split(path.sep);
           // Take the target folder and everything after it
           // example: [... 'src', 'pages', 'Dashboard', 'components', 'UI'] -> this is wrong unless components is inside Dashboard
           // The top level folders are definitely components, utils, services.
           const target = ['components', 'utils', 'services', 'pages'].find(t => parts.includes(t));
           if (target) {
               const targetIndex = parts.indexOf(target);
               const post = parts.slice(targetIndex);
               correctAbsolutePath = path.join(srcDir, ...post);
           }
        }
        
        // Now calculate the correct relative path from filePath to correctAbsolutePath
        let newRelative = path.relative(path.dirname(filePath), correctAbsolutePath).replace(/\\/g, '/');
        if (!newRelative.startsWith('.')) {
          newRelative = './' + newRelative;
        }
        return `from "${newRelative}"`;
      }
      return match;
    });

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed path relative:', filePath);
    }
  }
});
