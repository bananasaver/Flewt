import sharp from 'sharp';

// Shrinks an image's file size by re-encoding it, optionally resizing down to a max
// dimension. Keeps the original format where practical (falls back to jpeg for very
// large PNGs, since photographic PNGs rarely compress as well as re-encoded jpeg).
export async function shrinkImage(buffer, { maxWidth = 1600, quality = 75 } = {}) {
  const image = sharp(buffer);
  const meta = await image.metadata();

  let pipeline = image.resize({ width: Math.min(maxWidth, meta.width || maxWidth), withoutEnlargement: true });

  if (meta.format === 'png') {
    pipeline = pipeline.png({ quality, compressionLevel: 9 });
  } else {
    pipeline = pipeline.jpeg({ quality, mozjpeg: true });
  }

  return pipeline.toBuffer();
}

// Crops an image to a given box, and applies a light contrast/brightness lift —
// a practical "clean up a photographed document" pass without full deskew/perspective
// correction (which needs a heavier computer-vision dependency; flagged as a later upgrade).
export async function cropAndCleanImage(buffer, { left, top, width, height } = {}) {
  let pipeline = sharp(buffer);
  if (left != null && top != null && width && height) {
    pipeline = pipeline.extract({ left, top, width, height });
  }
  return pipeline.normalize().modulate({ brightness: 1.05 }).jpeg({ quality: 90 }).toBuffer();
}
