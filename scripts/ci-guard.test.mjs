// Tests for the Workers Builds branch guard (node --test).
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { checkBuild } from './ci-guard.mjs'

const ci = (branch) => ({ WORKERS_CI: '1', WORKERS_CI_BRANCH: branch })

test('local builds are never blocked', () => {
  assert.equal(checkBuild('production', {}).ok, true)
  assert.equal(checkBuild('preview', {}).ok, true)
})

test('production builds only on main in Workers Builds', () => {
  assert.equal(checkBuild('production', ci('main')).ok, true)
  assert.equal(checkBuild('production', ci('feature/premium-website')).ok, false)
})

test('preview builds never on main in Workers Builds', () => {
  assert.equal(checkBuild('preview', ci('feature/premium-website')).ok, true)
  assert.equal(checkBuild('preview', ci('main')).ok, false)
})

test('an unknown branch in CI is treated as unsafe', () => {
  assert.equal(checkBuild('production', { WORKERS_CI: '1' }).ok, false)
  assert.equal(checkBuild('preview', { WORKERS_CI: '1' }).ok, false)
})

test('the CLI exits non-zero when blocked', () => {
  const script = fileURLToPath(new URL('./ci-guard.mjs', import.meta.url))
  assert.throws(() => execFileSync(process.execPath, [script, 'preview'], { env: { ...process.env, ...ci('main') }, stdio: 'pipe' }))
  assert.doesNotThrow(() => execFileSync(process.execPath, [script, 'preview'], { env: { ...process.env, ...ci('feature/x') }, stdio: 'pipe' }))
})
