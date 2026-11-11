import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';

const child = spawn(process.execPath, ['./bin/buyusbcables-mcp.mjs'], {
  stdio: ['pipe', 'pipe', 'inherit'],
});

const lines = [];
let buf = '';
child.stdout.on('data', (chunk) => {
  buf += chunk.toString('utf8');
  let nl;
  while ((nl = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, nl).trim();
    buf = buf.slice(nl + 1);
    if (line) lines.push(JSON.parse(line));
  }
});

function waitCount(n) {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + 15000;
    const iv = setInterval(() => {
      if (lines.length >= n) {
        clearInterval(iv);
        resolve();
      } else if (Date.now() > deadline) {
        clearInterval(iv);
        reject(new Error(`Timed out waiting for ${n} stdio responses (got ${lines.length})`));
      }
    }, 50);
  });
}

child.stdin.write(
  JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2024-11-05' } }) + '\n'
);
child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} }) + '\n');
child.stdin.write(
  JSON.stringify({
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'search_catalog',
      arguments: { category: 'motors', filters: { motor_type: 'bldc', torque_nm: { min: 1 } }, limit: 2 },
    },
  }) + '\n'
);
child.stdin.end();

await waitCount(3);
child.kill('SIGTERM');

assert.equal(lines[0].id, 1);
assert.equal(lines[0].result.serverInfo.name, 'buyusbcables-parametric-index');
assert.equal(lines[1].id, 2);
assert.ok(lines[1].result.tools.some((t) => t.name === 'search_catalog'));
assert.equal(lines[2].id, 3);
const payload = JSON.parse(lines[2].result.content[0].text);
assert.ok(payload.matching_count > 0);
assert.ok(payload.results[0].amazon_affiliate_url.includes('tag=buyusbcable07-20'));

console.log(`PASS: stdio MCP bridge verified (${lines[1].result.tools.length} tools, ${payload.matching_count} matching BLDC motors)`);
