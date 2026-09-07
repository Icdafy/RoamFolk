import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);
const blender = process.env.BLENDER_PATH || fileURLToPath(new URL('tools/blender/blender-4.5.13-windows-x64/blender.exe', root));
function command(exe, args) { try { return execFileSync(exe, args, { encoding: 'utf8', timeout: 30000, windowsHide: true }).split(/\r?\n/)[0]; } catch { return 'unavailable'; } }
const report = {
  node: process.version, nodeSupported: Number(process.versions.node.split('.')[0]) >= 22,
  git: command('git', ['--version']), gitLfs: command('git', ['lfs', 'version']),
  blender: existsSync(blender) ? command(blender, ['--version']) : 'missing; set BLENDER_PATH for model authoring',
  manifest: existsSync(new URL('public/assets/manifest.json', root)),
  version: JSON.parse(readFileSync(new URL('package.json', root), 'utf8')).version,
};
console.log(JSON.stringify(report, null, 2));
if (!report.nodeSupported || !report.manifest || report.git === 'unavailable') process.exitCode = 1;
