const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const baseDir = 'C:\\Users\\LENOVO\\websocket';

if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', ws => {
  console.log('🔌 Client connected');

  ws.on('message', async message => {
    let data;
    try {
      data = JSON.parse(message);
    } catch {
      return ws.send(JSON.stringify({ error: 'Invalid JSON' }));
    }

    const fullPath = p => path.join(baseDir, p.replace(/^\\.?\\?/, '').replace(/^\\/, ''));

    try {
      if (data.action === 'list') {
        const dirPath = fullPath(data.path);
        const items = fs.readdirSync(dirPath).map(name => {
          const isDir = fs.statSync(path.join(dirPath, name)).isDirectory();
          return { name, type: isDir ? 'folder' : 'file' };
        });
        ws.send(JSON.stringify(items));

      } else if (data.action === 'create') {
        fs.writeFileSync(fullPath(data.path), '');
        ws.send(JSON.stringify({ success: '📄 File berhasil dibuat' }));

      } else if (data.action === 'mkdir') {
        fs.mkdirSync(fullPath(data.path), { recursive: true });
        ws.send(JSON.stringify({ success: '📁 Folder berhasil dibuat' }));

      } else if (data.action === 'move') {
        const from = fullPath(data.path);
        const to = fullPath(data.target + '/' + path.basename(data.path));
        fs.renameSync(from, to);
        ws.send(JSON.stringify({ success: '📂 Berhasil dipindahkan' }));

      } else if (data.action === 'list-folders') {
        const current = fullPath(data.path || '.');
        const folders = fs.readdirSync(current)
          .filter(name => fs.statSync(path.join(current, name)).isDirectory())
          .map(name => path.relative(baseDir, path.join(current, name)).replace(/\\/g, '/'));
        ws.send(JSON.stringify({ folders }));

      } else if (data.action === 'open') {
        const content = fs.readFileSync(fullPath(data.file), 'utf-8');
        ws.send(JSON.stringify({ action: 'open', file: data.file, content }));

      } else if (data.action === 'edit') {
        fs.writeFileSync(fullPath(data.file), data.content || '');
        ws.send(JSON.stringify({ success: '💾 File berhasil disimpan' }));

      } else if (data.action === 'delete') {
        const target = fullPath(data.path);
        if (fs.statSync(target).isDirectory()) {
          fs.rmSync(target, { recursive: true, force: true });
        } else {
          fs.unlinkSync(target);
        }
        ws.send(JSON.stringify({ success: '🗑️ Berhasil dihapus' }));

      } else if (data.action === 'rename') {
        const from = fullPath(data.path);
        const to = path.join(path.dirname(from), data.newName);
        fs.renameSync(from, to);
        ws.send(JSON.stringify({ success: '✏️ Nama berhasil diubah' }));

      } else if (data.action === 'upload') {
        const filePath = fullPath(data.filename);
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        // Decode base64 content
        const buffer = Buffer.from(data.content, 'base64');
        fs.writeFileSync(filePath, buffer);

        ws.send(JSON.stringify({ success: `✅ Berhasil upload: ${data.filename}` }));
      }

    } catch (e) {
      ws.send(JSON.stringify({ error: `Gagal memproses: ${e.message}` }));
    }
  });
});
