#!/usr/bin/env node
/**
 * SessionStart hook for token-saver plugin.
 * Outputs a status reminder so Claude knows token-saver is active this session.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

// Claude Code stores MCP servers in ~/.claude.json (and project-level .claude.json),
// not in settings.json — check both locations.
const candidatePaths = [
  join(homedir(), '.claude.json'),
  join(process.cwd(), '.claude.json'),
];

let enabled = false;
for (const p of candidatePaths) {
  try {
    const config = JSON.parse(readFileSync(p, 'utf8'));
    const projects = config?.projects ?? {};
    const mcpServers = config?.mcpServers ?? {};
    const inGlobal = Object.keys(mcpServers).some((k) => k.includes('token-saver'));
    const inProject = Object.values(projects).some((proj) =>
      Object.keys(proj?.mcpServers ?? {}).some((k) => k.includes('token-saver'))
    );
    if (inGlobal || inProject) { enabled = true; break; }
  } catch {
    // file missing or unreadable — skip
  }
}

// Fallback: hook is running, so the plugin is installed — assume enabled
if (!enabled) enabled = true;

if (enabled) {
  process.stdout.write(
    [
      'token-saver is active (mode: off by default — call set_mode to enable).',
      'Tools: check_output · analyze_history · get_session_stats · set_mode · set_thresholds',
    ].join('\n') + '\n'
  );
}
