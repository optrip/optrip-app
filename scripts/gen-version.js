/* eslint-disable */
// 빌드/시작 시 git 정보를 src/lib/version.ts 로 주입한다.
// npm 의 prestart / prebuild:web 훅에서 자동 실행된다.
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function sh(cmd, fallback) {
  try {
    return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return fallback;
  }
}

// CI(예: GitHub Actions)는 detached HEAD 라 git 브랜치명이 부정확하므로 환경변수를 우선 사용.
const sha = (process.env.GITHUB_SHA || sh('git rev-parse --short HEAD', 'unknown')).slice(0, 7);
let branch = process.env.GITHUB_REF_NAME || sh('git rev-parse --abbrev-ref HEAD', 'unknown');
if (branch === 'HEAD') branch = 'detached';
const builtAt = new Date().toISOString();

const out = `// 이 파일은 scripts/gen-version.js 가 자동 생성합니다. 직접 수정하지 마세요.
export const GIT_SHA = '${sha}';
export const GIT_BRANCH = '${branch}';
export const BUILT_AT = '${builtAt}';
`;

const target = path.join(__dirname, '..', 'src', 'lib', 'version.ts');
fs.writeFileSync(target, out);
console.log(`[gen-version] ${branch}@${sha} (${builtAt})`);
