import { photos } from "./nasa.json";
import avatars from "./avatars.json";

export const urlToBase64 = (url, imageType = "image/png") => {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      img.setAttribute("crossOrigin", "anonymous");
      img.onload = function () {
        const imgCtx = this as any;
        const canvas = document.createElement("CANVAS") as HTMLCanvasElement;
        const ctx = canvas.getContext("2d");
        canvas.height = imgCtx.naturalHeight;
        canvas.width = imgCtx.naturalWidth;
        ctx.drawImage(imgCtx, 0, 0);
        const dataURL = canvas.toDataURL(imageType);
        resolve(dataURL);
      };

      img.src = url;
    } catch (err) {
      reject(err);
    }
  });
};

export function encodeImageFileAsURL(element) {
  return new Promise((resolve, reject) => {
    const file = element.files[0];
    const reader = new FileReader();
    reader.onloadend = function () {
      resolve(reader.result);
    };
    reader.onerror = function (err) {
      reject(err);
    };
    reader.readAsDataURL(file);
  });
}

export const randomRoomImageGenerator = () => {
  const limit = photos.length;
  const idx = Math.floor(Math.random() * limit);
  return photos[idx].img_src;
};

export const randomAvatarGenerator = () => {
  const list = avatars as Array<any>;
  const limit = list.length;
  const idx = Math.floor(Math.random() * limit);
  const { image } = list[idx];
  return `data:${image.mime};base64,${image.data}`;
};
