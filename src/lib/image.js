// Phone ki badi photo ko chhota (JPEG) karta hai taake upload/data kam lage
export async function compressImage(file, max = 1280, quality = 0.8) {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale);
  const h = Math.round(bmp.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d").drawImage(bmp, 0, 0, w, h);
  return new Promise((res, rej) =>
    canvas.toBlob(b => (b ? res(b) : rej(new Error("Image convert failed"))), "image/jpeg", quality)
  );
}
