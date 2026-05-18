import fs from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';

const ROOT = path.resolve(import.meta.dirname, '..');
const REMOTE_URL =
  process.env.GITHUB_REMOTE_URL ?? 'https://github.com/jmramon-coder/CM-Multicase_SANDBOX-EQ-JMR.git';
function readGitCredentialsToken() {
  try {
    const creds = readFileSync(path.join(process.env.HOME ?? '', '.git-credentials'), 'utf8');
    for (const line of creds.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed.includes('github.com')) continue;
      const url = new URL(trimmed);
      if (url.password) return decodeURIComponent(url.password);
    }
  } catch {
    /* ignore */
  }
  return undefined;
}

const TOKEN = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN ?? readGitCredentialsToken();
const COMMIT_MESSAGE = process.env.GITHUB_COMMIT_MESSAGE ?? 'Update CM multicase sandbox';
const COMMIT_AUTHOR = {
  name: process.env.GITHUB_AUTHOR_NAME ?? 'J Manuel Ramon',
  email: process.env.GITHUB_AUTHOR_EMAIL ?? '',
};

const IGNORE = new Set(['.git', 'node_modules', 'dist', '.env', '.DS_Store']);

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
    if (entry.isDirectory()) files.push(...(await walkFiles(abs, base)));
    else if (entry.isFile()) files.push(rel);
  }
  return files;
}

async function main() {
  if (!TOKEN) {
    console.error(
      'No valid GitHub token. Set GITHUB_TOKEN, or update ~/.git-credentials with a classic PAT (repo scope).',
    );
    process.exit(1);
  }
  if (!COMMIT_AUTHOR.email) {
    console.error('Set GITHUB_AUTHOR_EMAIL to a GitHub-verified email (Vercel requires a linked author).');
    process.exit(1);
  }

  const files = await walkFiles(ROOT);
  for (const filepath of files) {
    await git.add({ fs, dir: ROOT, filepath });
  }

  const status = await git.statusMatrix({ fs, dir: ROOT });
  const dirty = status.some(([, headStatus, workdirStatus, stageStatus]) =>
    [headStatus, workdirStatus, stageStatus].some((s) => s !== 1),
  );
  if (dirty) {
    const sha = await git.commit({
      fs,
      dir: ROOT,
      message: COMMIT_MESSAGE,
      author: COMMIT_AUTHOR,
      committer: COMMIT_AUTHOR,
    });
    console.log(`Committed ${sha.slice(0, 7)}`);
  } else {
    console.log('No staged changes; pushing existing commits.');
  }

  const remotes = await git.listRemotes({ fs, dir: ROOT });
  if (!remotes.some((remote) => remote.remote === 'origin')) {
    await git.addRemote({ fs, dir: ROOT, remote: 'origin', url: REMOTE_URL });
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
