const { exec } = require('child_process');
const { send } = require('process');

exec('messages', (error, stdout, stderr) => {
  if (error) {
    console.error(`Terjadi kesalahan: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }
  console.log(`Output:\n${stdout}`);
  wss.on('connection', socket => {
    socket.send(`Output:n${stdout}`);
  })
});
