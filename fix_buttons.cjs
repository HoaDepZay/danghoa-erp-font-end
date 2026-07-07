const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'Chat', 'Chat.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace all `<Btn type="button" className="input-action-btn"` with `<button type="button" className="input-action-btn"`
content = content.replace(/<Btn([^>]*className="input-action-btn"[^>]*)>(.*?)<\/Btn>/gs, '<button$1>$2</button>');

// Replace the Send button
content = content.replace(
  /<Btn\s+type="submit"/g,
  '<button type="submit"'
).replace(
  /<\/Btn>\s*<\/form>/g,
  '</button>\n              </form>'
);

// Specifically replace the one with the X icon in attachedFile
content = content.replace(
  /<Btn type="button" onClick=\{\(\) => setAttachedFile\(null\)\}(.*?)>(.*?)<\/Btn>/s,
  '<button type="button" onClick={() => setAttachedFile(null)}$1>$2</button>'
);

fs.writeFileSync(filePath, content);
console.log('Fixed buttons inside the form!');
