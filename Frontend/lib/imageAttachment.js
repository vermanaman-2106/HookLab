/**
 * Resize image in-browser for chat preview + persistence (keeps JSONB smaller).
 * @param {File} file
 * @param {number} [maxEdge=1280]
 * @param {number} [jpegQuality=0.82]
 * @returns {Promise<string>} data URL
 */
export function fileToResizedDataUrl(file, maxEdge = 1280, jpegQuality = 0.82) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { naturalWidth: w, naturalHeight: h } = img;
      if (!w || !h) {
        reject(new Error("Invalid image"));
        return;
      }
      if (w > maxEdge || h > maxEdge) {
        if (w >= h) {
          h = Math.round((h * maxEdge) / w);
          w = maxEdge;
        } else {
          w = Math.round((w * maxEdge) / h);
          h = maxEdge;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas not supported"));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      const usePng = /^image\/png/i.test(file.type);
      const mime = usePng ? "image/png" : "image/jpeg";
      try {
        const out = usePng
          ? canvas.toDataURL(mime)
          : canvas.toDataURL(mime, jpegQuality);
        resolve(out);
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    img.src = url;
  });
}

/** @param {File} file */
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      if (typeof r.result === "string") resolve(r.result);
      else reject(new Error("Read failed"));
    };
    r.onerror = () => reject(r.error || new Error("Read failed"));
    r.readAsDataURL(file);
  });
}
