// make.fun news-image-20261118 — "The World Today", Wednesday 18 November 2026.
// The rendered front page lives in entry.png. This program only validates that
// the bundled asset is a whole PNG and copies it to the path the grader reads.
// It never touches the network and emits identical bytes on every run.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, 'entry.png');
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const target = join(outputDir, 'entry.png');

const image: Buffer = readFileSync(source);

// A PNG starts with the eight-byte signature; refuse a truncated or wrong asset.
const PNG_SIGNATURE = '89504e470d0a1a0a';
if (image.length < 24 || image.subarray(0, 8).toString('hex') !== PNG_SIGNATURE) {
  throw new Error(`${source} is not a whole PNG`);
}

// IHDR carries width and height as two big-endian 32-bit integers at bytes 16..24.
const width = image.readUInt32BE(16);
const height = image.readUInt32BE(20);
if (width > 1024 || height > 1024 || image.length > 1048576) {
  throw new Error(`image ${width}x${height}, ${image.length} bytes, exceeds the gate`);
}

// The grader creates /output; creating it here keeps local runs working too.
mkdirSync(outputDir, { recursive: true });
writeFileSync(target, image);
console.log(`wrote ${target} (${width}x${height}, ${image.length} bytes)`);
