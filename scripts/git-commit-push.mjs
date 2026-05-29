/**
 * One-off git commit/push when system git is unavailable.
 * Usage: node scripts/git-commit-push.mjs "commit message" <github_token>
 */
import fs from 'fs';
import path from 'path';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node/index.cjs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, '..');
const message = process.argv[2];
const token = process.argv[3];

if (!message || !token) {
  console.error('Usage: node scripts/git-commit-push.mjs "commit message" <token>');
  process.exit(1);
}

const author = {
  name: 'jmramon',
  email: 'jmramon@users.noreply.github.com',
};

async function main() {
  const matrix = await git.statusMatrix({ fs, dir });
  const changed = matrix.filter(([, head, workdir, stage]) => head !== workdir || head !== stage);
  if (changed.length === 0) {
    console.log('No changes to commit.');
    return;
  }

  console.log(`Staging ${changed.length} path(s)...`);
  for (const [filepath] of changed) {
    if (filepath === '.') continue;
    await git.add({ fs, dir, filepath });
  }

  const sha = await git.commit({ fs, dir, message, author });
  console.log(`Committed ${sha}`);

  const branch = (await fs.promises.readFile(path.join(dir, '.git/HEAD'), 'utf8'))
    .trim()
    .replace('ref: refs/heads/', '');

  const pushResult = await git.push({
    fs,
    http,
    dir,
    remote: 'origin',
    ref: branch,
    onAuth: () => ({ username: 'x-access-token', password: token }),
  });

  console.log('Push result:', pushResult);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
