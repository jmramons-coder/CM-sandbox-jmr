import fs from 'node:fs/promises';
import path from 'node:path';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';

const ROOT = path.resolve(import.meta.dirname, '..');
const REMOTE_URL = process.env.GITHUB_REMOTE_URL ?? 'https://github.com/jmramon-coder/CM-Multicase_SANDBOX-EQ-JMR.git';
const TOKEN = process.env.GITHUB_TOKEN;
const COMMIT_MESSAGE = process.env.GITHUB_COMMIT_MESSAGE ?? 'Initial commit: CM multicase sandbox';

const IGNORE = new Set([
  '.git',
  'node_modules',
  'dist',
  '.env',
  '.DS_Store',
  '.github',
  'scripts/push-initial-to-github.mjs',
]);

function shouldIgnore(relativePath) {
  const parts = relativePath.split(path.sep);
  return parts.some((part) => IGNORE.has(part) || part.startsWith('.env'));
}

async function walkFiles(dir, base = dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const abs = path.join(dir, entry.name);
    const rel = path.relative(base, abs);
    if (shouldIgnore(rel)) continue;
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(abs, base)));
    } else if (entry.isFile()) {
      files.push(rel);
    }
  }
  return files;
}

async function main() {
  if (!TOKEN) {
    console.error('GITHUB_TOKEN is required');
    process.exit(1);
  }

  const gitDir = path.join(ROOT, '.git');
  try {
    await fs.access(gitDir);
  } catch {
    await git.init({ fs, dir: ROOT, defaultBranch: 'main' });
  }

  const files = await walkFiles(ROOT);
  console.log(`Staging ${files.length} files…`);
  for (const filepath of files) {
    await git.add({ fs, dir: ROOT, filepath });
  }

  const head = await git.resolveRef({ fs, dir: ROOT, ref: 'HEAD' }).catch(() => null);
  if (!head) {
    await git.commit({
      fs,
      dir: ROOT,
      message: COMMIT_MESSAGE,
      author: { name: 'CM Sandbox', email: 'sandbox@local.dev' },
    });
  } else {
    const status = await git.statusMatrix({ fs, dir: ROOT });
    const dirty = status.some(([, headStatus, workdirStatus]) => headStatus !== workdirStatus);
    if (dirty) {
      await git.commit({
        fs,
        dir: ROOT,
        message: COMMIT_MESSAGE,
        author: { name: 'CM Sandbox', email: 'sandbox@local.dev' },
      });
    }
  }

  const remotes = await git.listRemotes({ fs, dir: ROOT });
  if (!remotes.some((remote) => remote.remote === 'origin')) {
    await git.addRemote({ fs, dir: ROOT, remote: 'origin', url: REMOTE_URL });
  } else {
    await git.setConfig({ fs, dir: ROOT, path: 'remote.origin.url', value: REMOTE_URL });
  }

  console.log('Pushing to origin/main…');
  const pushResult = await git.push({
    fs,
    http,
    dir: ROOT,
    remote: 'origin',
    ref: 'main',
    onAuth: () => ({ username: 'x-access-token', password: TOKEN }),
  });

  console.log('Push complete.', pushResult);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
