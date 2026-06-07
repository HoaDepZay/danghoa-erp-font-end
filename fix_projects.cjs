const fs = require('fs');
let c = fs.readFileSync('src/pages/Projects/Projects.tsx', 'utf-8');

const fStr = `
const getF = (obj: any, key: string) => {
  if (!obj) return undefined;
  const target = key.toLowerCase().replace(/_/g, "");
  const found = Object.keys(obj).find(k => k.toLowerCase().replace(/_/g, "") === target);
  return found ? obj[found] : undefined;
};
`;

if (!c.includes('const getF')) {
  c = c.replace('import { ProjectCard } from "./ProjectCard";', 'import { ProjectCard } from "./ProjectCard";' + fStr);
}

// Replace pattern like: project.MA_DA ?? project.mada -> getF(project, "mada")
c = c.replace(/(\w+)\.([A-Z_]+)\s*\?\?\s*\1\.([a-z]+)/g, 'getF($1, "$3")');

fs.writeFileSync('src/pages/Projects/Projects.tsx', c);
console.log("Done");
