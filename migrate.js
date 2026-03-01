const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Fix imports left behind by previous bad replacement
    if (content.includes('next/navigation')) {
        content = content.replace(/import\s*\{[^}]*\}\s*from\s*['"]next\/navigation['"]\s*;?/g, (match) => {
            if (match.includes('usePathname') && !content.includes('react-router-dom')) {
                return `import { useLocation } from "react-router-dom";`;
            } else if (match.includes('usePathname') && content.includes('react-router-dom') && !content.includes('useLocation')) {
                // we'll just remove the next/navigation import and add useLocation manually if needed, 
                // but let's just replace all next/navigation imports with empty because we already added react-router-dom if needed
                return '';
            }
            return '';
        });
        changed = true;
    }

    if (!content.includes('useLocation') && content.includes('useLocation()') && content.includes('react-router-dom')) {
        content = content.replace(/import\s*\{\s*(.*?)\s*\}\s*from\s*['"]react-router-dom['"]/, (full, inner) => {
            if (!inner.includes('useLocation')) {
                return `import { ${inner}, useLocation } from "react-router-dom"`;
            }
            return full;
        });
        changed = true;
    }

    // Replace <Link href="..."> with <Link to="...">
    const linkHrefRegex = /<Link\s+([^>]*?)href=(['"][^'"]*['"]|\{.*?\})/g;
    if (linkHrefRegex.test(content)) {
        content = content.replace(linkHrefRegex, '<Link $1to=$2');
        changed = true;
    }

    // Next.js Image
    if (content.includes('next/image')) {
        content = content.replace(/import Image from ['"]next\/image['"]\s*;?/g, '');
        content = content.replace(/<Image([^>]*?)\/?>/g, '<img$1 />'); // Fallback to normal img
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log("Updated:", filePath);
    }
}

function walkDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            walkDir(fullPath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            processFile(fullPath);
        }
    }
}

walkDir(path.join(__dirname, 'app'));
walkDir(path.join(__dirname, 'components'));
walkDir(path.join(__dirname, 'context'));
walkDir(path.join(__dirname, 'hooks'));
walkDir(path.join(__dirname, 'lib'));
