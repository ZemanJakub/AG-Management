
import sharp from "sharp";

export async function resizeImage(base64Image: string, width: number, height: number): Promise<string> {
  const buffer = Buffer.from(base64Image, 'base64');
  const resizedBuffer = await sharp(buffer)
    .resize(width, height)
    .toBuffer();

  return resizedBuffer.toString('base64');
}

const img = `data:image/png;base64,${resizeImage}`
export {img};
