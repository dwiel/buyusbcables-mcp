#!/usr/bin/env node
/**
 * Zero-dependency MCP stdio proxy for https://www.buyusbcables.com/api/mcp.
 *
 * Clients that support Streamable HTTP can connect directly to
 * `https://www.buyusbcables.com/api/mcp` without installing anything.
 * For stdio-only MCP hosts (or containerized directory scanners), this script
 * bridges standard MCP newline-delimited JSON-RPC over stdin/stdout to the
 * hosted endpoint.
 */
import readline from 'node:readline';

const ENDPOINT =
  process.env.BUYUSBCABLES_MCP_URL || 'https://www.buyusbcables.com/api/mcp';

async function forwardJsonRpc(line) {
  const trimmed = line.trim();
  if (!trimmed) return;

  let parsed;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    process.stdout.write(
      JSON.stringify({
        jsonrpc: '2.0',
        id: null,
        error: { code: -32700, message: 'Parse error' },
      }) + '\n'
    );
    return;
  }

  // Notifications require no response frame over stdio
  if (
    parsed &&
    !Array.isArray(parsed) &&
    parsed.id === undefined &&
    typeof parsed.method === 'string'
  ) {
    return;
  }

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(parsed),
    });
    const text = await res.text();
    if (text && text.trim() && text.trim() !== 'null') {
      // Ensure single-line framing per MCP stdio spec
      const compact = JSON.stringify(JSON.parse(text));
      process.stdout.write(compact + '\n');
    }
  } catch (err) {
    const id = parsed && !Array.isArray(parsed) ? parsed.id ?? null : null;
    process.stdout.write(
      JSON.stringify({
        jsonrpc: '2.0',
        id,
        error: {
          code: -32603,
          message: `Upstream MCP request failed: ${
            err instanceof Error ? err.message : String(err)
          }`,
        },
      }) + '\n'
    );
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  crlfDelay: Infinity,
});

for await (const line of rl) {
  await forwardJsonRpc(line);
}
