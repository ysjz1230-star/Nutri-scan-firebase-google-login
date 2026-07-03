import { readFileSync } from 'fs';
import sharp from 'sharp';

const svgBuffer = readFileSync('./public/og-image.svg');

sharp(svgBuffer)
  .resize(1200, 630)
  .png()
  .toFile('./public/og-image.png')
  .then(() => console.log('✅ og-image.png 생성 완료!'))
  .catch((err) => console.error('❌ 오류:', err));
