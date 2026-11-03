const { spawn } = require('node:child_process');

const args = process.argv.slice(2);
let port = 7100;
let playPort = 7101;
const forwarded = [];
for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (arg === '--port') {
    port = Number(args[++index]);
  } else if (arg.startsWith('--port=')) {
    port = Number(arg.slice(7));
  } else if (arg === '--play-port') {
    playPort = Number(args[++index]);
  } else if (arg.startsWith('--play-port=')) {
    playPort = Number(arg.slice(12));
  } else if (arg === '--host') {
    index += 1; // The portal deliberately keeps its safe loopback binding.
  } else if (arg.startsWith('--host=')) {
    // Accepted for preview CLI compatibility; no public listener is opened.
  } else {
    forwarded.push(arg);
  }
}
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid --port');
if (!Number.isInteger(playPort) || playPort < 1 || playPort > 65535) throw new Error('Invalid --play-port');

const child = spawn(process.env.PYTHON || 'python', [
  'server.py',
  '--port', String(port),
  '--play-port', String(playPort),
  '--no-executor',
  '--no-discovery',
  ...forwarded,
], { stdio: 'inherit' });
const stop = () => { if (!child.killed) child.kill(); };
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
child.on('exit', code => { process.exitCode = code ?? 0; });
