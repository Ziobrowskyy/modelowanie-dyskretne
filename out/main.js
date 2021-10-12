import { map } from "./map.js";
const height = map.length;
const width = map[0].length;
document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.querySelector("#canvas");
    canvas.style.height = 2 * height + "px";
    canvas.style.width = width + "px";
    canvas.height = 2 * height;
    canvas.width = width;
    const ctx = canvas.getContext("2d");
    const originalBitmap = createBitmap(ctx, (index) => {
        const i = Math.floor(index / 4);
        const x = i % width;
        const y = Math.floor(i / width);
        const value = map[y][x];
        return [value, value, value, 255];
    });
    ctx.putImageData(originalBitmap, 0, 0);
    const setTransformedBitmap = (brightness = 0) => {
        const newBitmap = createBitmap(ctx, (index) => {
            const valuesMapped = originalBitmap.data.slice(index, index + 3).map((it) => L(it, brightness));
            return [...valuesMapped, 255];
        });
        ctx.putImageData(newBitmap, 0, height);
    };
    setTransformedBitmap();
    const brightnessInput = document.querySelector("#brightness-input");
    const brightnessSpan = document.querySelector("#brightness-span");
    brightnessInput.addEventListener("change", (e) => {
        const value = e.target.value;
        brightnessSpan.innerText = value;
        setTransformedBitmap(Number(value));
    });
});
const L = (v, b) => {
    const value = v + b;
    if (value < 0)
        return 0;
    if (value > 255)
        return 255;
    return value;
};
const createBitmap = (ctx, colorGetter) => {
    const bitmap = ctx.createImageData(width, height);
    for (let i = 0; i < bitmap.data.length; i += 4) {
        const [r, g, b, a] = colorGetter(i);
        bitmap.data[i] = r;
        bitmap.data[i + 1] = g;
        bitmap.data[i + 2] = b;
        bitmap.data[i + 3] = a;
    }
    return bitmap;
};
