import { readFile } from 'node:fs/promises';
export function parseGlb(buffer) {
  if (buffer.length < 20 || buffer.toString('ascii', 0, 4) !== 'glTF') throw new Error('Not a GLB; possible LFS pointer or corrupt file');
  if (buffer.readUInt32LE(4) !== 2 || buffer.readUInt32LE(8) !== buffer.length) throw new Error('Invalid GLB version or length');
  const size = buffer.readUInt32LE(12);
  if (buffer.toString('ascii', 16, 20) !== 'JSON' || size % 4 || size + 20 > buffer.length) throw new Error('Invalid GLB JSON chunk');
  const json = JSON.parse(buffer.toString('utf8', 20, 20 + size));
  if (json.asset?.version !== '2.0') throw new Error('Expected glTF 2.0');
  let offset = 20 + size;
  let binaryBytes = 0;
  while (offset < buffer.length) {
    if (offset + 8 > buffer.length) throw new Error('Truncated GLB chunk header');
    const chunkLength = buffer.readUInt32LE(offset);
    if (chunkLength % 4 || offset + 8 + chunkLength > buffer.length) throw new Error('Truncated GLB chunk');
    if (buffer.toString('ascii', offset + 4, offset + 7) === 'BIN') binaryBytes += chunkLength;
    offset += 8 + chunkLength;
  }
  for (const item of json.buffers ?? []) {
    if (item.uri) throw new Error('External buffers are not allowed for this fixture');
    if (item.byteLength > binaryBytes) throw new Error('Missing binary data');
  }
  for (const image of json.images ?? []) if (image.uri) throw new Error('External textures are not allowed for this fixture');
  return json;
}
export function validateAnchors(json, required) {
  const ids = (json.nodes ?? []).flatMap(node => node.extras?.roamfolk_id ? [node.extras.roamfolk_id] : []);
  if (new Set(ids).size !== ids.length) throw new Error('Duplicate anchor ID');
  for (const id of required) if (!ids.includes(id)) throw new Error('Missing anchor: ' + id);
  return ids;
}
export async function inspectAsset(root) {
  const manifest = JSON.parse(await readFile(new URL('public/assets/manifest.json', root), 'utf8'));
  const data = await readFile(new URL(manifest.model, root));
  if (data.length > manifest.budgetBytes) throw new Error('Asset exceeds budget');
  const json = parseGlb(data);
  const anchors = validateAnchors(json, manifest.requiredAnchors);
  const triangles = (json.meshes ?? []).reduce((total, mesh) => total + mesh.primitives.reduce((sum, p) => {
    if (p.mode !== undefined && p.mode !== 4) throw new Error('Non-triangle primitive');
    return sum + (json.accessors[p.indices ?? p.attributes.POSITION].count / 3);
  }, 0), 0);
  if (triangles > 100000) throw new Error('Fixture exceeds 100k triangle budget');
  return { bytes: data.length, triangles, meshes: json.meshes?.length, anchors, generator: manifest.generator };
}
