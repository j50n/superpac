import { ImageData } from "https://deno.land/x/canvas@v1.4.1/mod.ts";
import { VirtTerm } from "../term/virtterm.ts";
import { ColorDef, mapRGBToCube6 } from "../ansi/sgr.ts";

/**
 * @param image The RGBA image.
 * @param term The virtual terminal.
 * @param options
 *        <ol>
 *          <li> `pos`: Upper left render position of image on term.</li>
 *          <li> `colorFn`: Convert RGB to ANSI Escape color. </li>
 *        </ol>
 * @returns
 */
export function blit(
  image: ImageData,
  term: VirtTerm,
  options?: {
    pos?: { x: number; y: number };
    colorFn?: (r: number, g: number, b: number) => ColorDef;
  },
) {
  const pos = options?.pos ?? { x: 0, y: 0 };
  const colorFn = options?.colorFn ?? mapRGBToCube6;

  if (pos.x + image.width < 1) {
    /* case 1: image is completely left of term. */
    return;
  } else if (pos.x >= term.size.columns) {
    /* case 2: image is completely right of term. */
    return;
  } else if (pos.y + image.height < 1) {
    /* case 3: image is completely above term. */
    return;
  } else if (pos.y >= term.size.rows * 2) {
    /* case 4: image is completely below term. */
    return;
  } else {
    /* case 5: X and Y are 0 or greater, in bounds of term. */

    const xBgn = Math.max(0, pos.x);
    const xEnd = Math.min(term.size.columns, pos.x + image.width);

    const yBgn = Math.max(0, pos.y);
    const yEnd = Math.min(term.size.rows * 2, pos.y + image.height);

    const xImgOffset = -pos.x;
    const yImgOffset = -pos.y;

    for (let y = yBgn; y < yEnd; y++) {
      const yImg = y + yImgOffset;
      const termBlock = y & 0x01;
      const rowOfTerm = y >> 1;

      for (let x = xBgn; x < xEnd; x++) {
        const xImg = x + xImgOffset;

        const iImage = xImg + yImg * image.width << 2;
        const alpha = image.data[iImage + 4];

        if (alpha > 0) {
          const r = image.data[iImage + 0];
          const g = image.data[iImage + 1];
          const b = image.data[iImage + 2];

          const iTerm = term.indexOf(rowOfTerm, x);

          const color = colorFn(r, g, b);
          if (termBlock === 0) {
            term.back[iTerm] = color.back;
          } else {
            term.fore[iTerm] = color.fore;
          }
        }
      }
    }
  }
}
