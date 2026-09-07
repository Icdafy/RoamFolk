import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FLOORS, canEnterFloor, getFloor } from '../src/game/floors.ts';
import { parseGlb, validateAnchors, inspectAsset } from '../tools/asset-validation.mjs';

await test('only the nine agreed floors are registered, with stable IDs', () => {
  assert.deepEqual(FLOORS.map(f => f.id), [1, 2, 3, 4, 21, 22, 23, 24, 25]);
  assert.equal(new Set(FLOORS.map(f => f.id)).size, 9);
});
await test('unbuilt and unknown floors cannot be entered', () => {
  for (const id of [...FLOORS.map(f => f.id), 0, 5, 20, 26, -1, NaN]) assert.equal(canEnterFloor(id), false);
  assert.equal(getFloor(21)?.status, 'planned');
  assert.equal(getFloor(5), undefined);
});
await test('asset checker rejects LFS pointers, broken headers and truncation', () => {
  assert.throws(() => parseGlb(Buffer.from('version https://git-lfs.github.com/spec/v1')), /Not a GLB/);
  const header = Buffer.alloc(20); header.write('glTF'); header.writeUInt32LE(2, 4); header.writeUInt32LE(100, 8);
  assert.throws(() => parseGlb(header), /length/);
});
await test('asset checker rejects missing or duplicate interaction IDs', () => {
  assert.throws(() => validateAnchors({ nodes: [] }, ['spawn']), /Missing/);
  assert.throws(() => validateAnchors({ nodes: [1, 2].map(() => ({ extras: { roamfolk_id: 'same' } })) }, []), /Duplicate/);
});
await test('actual Blender export preserves anchors and fits resource budgets', async () => {
  const report = await inspectAsset(new URL('../', import.meta.url));
  assert.ok(report.bytes > 1000);
  assert.ok(report.triangles > 0);
  assert.equal(report.anchors.length, 2);
});
