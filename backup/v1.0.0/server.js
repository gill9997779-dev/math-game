// 简单的开发服务器
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 8788;
const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    // 解析URL，移除查询参数
    const url = new URL(req.url, `http://${req.headers.host}`);
    let filePath = url.pathname;
    
    // 处理根路径
    if (filePath === '/' || filePath === '') {
        filePath = '/index.html';
    }
    
    // 移除开头的斜杠，构建相对于项目根目录的路径
    filePath = path.join(__dirname, filePath.replace(/^\//, ''));
    
    // 安全检查：确保文件路径在项目目录内
    const resolvedPath = path.resolve(filePath);
    const rootPath = path.resolve(__dirname);
    if (!resolvedPath.startsWith(rootPath)) {
        res.writeHead(403, { 'Content-Type': 'text/html' });
        res.end('<h1>403 - Forbidden</h1>', 'utf-8');
        return;
    }
    
    // 如果路径是目录，尝试查找index.html
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
    }
    
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';

    // 添加日志
    console.log(`请求: ${req.url} -> ${filePath}`);

    fs.readFile(filePath, (error, content) => {
        if (error) {
            console.error(`错误: ${req.url} -> ${error.message}`);
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end(`<h1>404 - File Not Found</h1><p>路径: ${req.url}</p>`, 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`, 'utf-8');
            }
        } else {
            res.writeHead(200, { 
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*'
            });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});