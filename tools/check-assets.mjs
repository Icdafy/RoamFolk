import { inspectAsset } from './asset-validation.mjs';
console.log(JSON.stringify(await inspectAsset(new URL('../', import.meta.url)), null, 2));
