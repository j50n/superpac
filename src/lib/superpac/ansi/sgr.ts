/**
 * SGR (Select Graphic Rendition) parameters.
 *
 * [Ansi Escape Code Wiki: SGR](https://en.wikipedia.org/wiki/ANSI_escape_code#SGR_(Select_Graphic_Rendition)_parameters)
 */

import {
  AnsiEscControlSeq,
  ansiEscControlSeq,
  nextUid,
  range,
} from "./common.ts";

export interface AnsiEscSwitch {
  on: AnsiEscControlSeq;
  off: AnsiEscControlSeq;
}

export function pick(sw: number, aes: AnsiEscSwitch): AnsiEscControlSeq {
  if (sw !== 0) {
    return aes.on;
  } else {
    return aes.off;
  }
}

export const RESET = ansiEscControlSeq("0m");

export const BOLD: AnsiEscSwitch = {
  on: ansiEscControlSeq("1m"),
  off: ansiEscControlSeq("22m"), /* normal intensity. */
} as const;

export const FAINT: AnsiEscSwitch = {
  on: ansiEscControlSeq("2m"),
  off: ansiEscControlSeq("22m"), /* normal intensity. */
} as const;

export const ITALIC: AnsiEscSwitch = {
  on: ansiEscControlSeq("3m"),
  off: ansiEscControlSeq("23m"),
} as const;

export const UNDERLINE: AnsiEscSwitch = {
  on: ansiEscControlSeq("4m"),
  off: ansiEscControlSeq("24m"),
} as const;

export const SLOW_BLINK: AnsiEscSwitch = {
  on: ansiEscControlSeq("5m"),
  off: ansiEscControlSeq("25m"),
} as const;

export const RAPID_BLINK: AnsiEscSwitch = {
  on: ansiEscControlSeq("6m"),
  off: ansiEscControlSeq("25m"),
} as const;

/**
 * Invert. Also known as "Reverse Video."
 */
export const INVERT: AnsiEscSwitch = {
  on: ansiEscControlSeq("7m"),
  off: ansiEscControlSeq("27m"),
} as const;

export const CONCEAL: AnsiEscSwitch = {
  on: ansiEscControlSeq("8m"),
  off: ansiEscControlSeq("28m"),
} as const;

export const STRIKE: AnsiEscSwitch = {
  on: ansiEscControlSeq("9m"),
  off: ansiEscControlSeq("29m"),
} as const;

/**
 * Font indexed 0 is the standard font.
 */
export const FONT: readonly AnsiEscControlSeq[] = range({ to: 11 })
  .map((n) => ansiEscControlSeq(`${10 + n}m`));

export const FRAMED: AnsiEscSwitch = {
  on: ansiEscControlSeq("51m"),
  off: ansiEscControlSeq("54m"),
} as const;

export const ENCIRCLED: AnsiEscSwitch = {
  on: ansiEscControlSeq("52m"),
  off: ansiEscControlSeq("54m"),
} as const;

export const OVERLINED: AnsiEscSwitch = {
  on: ansiEscControlSeq("53m"),
  off: ansiEscControlSeq("55m"),
} as const;

export class BackColor extends AnsiEscControlSeq {}
export class ForeColor extends AnsiEscControlSeq {}

function foreColor(seq: string, uid?: number) {
  return new ForeColor(seq, uid || nextUid());
}

function backColor(seq: string, uid?: number) {
  return new BackColor(seq, uid || nextUid());
}

export type ColorDef = { fore: ForeColor; back: BackColor };

export const BLACK = 0;
export const RED = 1;
export const GREEN = 2;
export const YELLOW = 3;
export const BLUE = 4;
export const PURPLE = 5;
export const CYAN = 6;
export const WHITE = 7;

/**
 * 4-bit color.
 *
 * Note that these are not "true" colors, but are mapped by the
 * terminal to colors that approximate the named color and behave
 * well with mixed foreground and background colors.
 */
export const COLOR4 = {
  normal: range({ to: 8 }).map((n) => {
    return {
      fore: foreColor(`${30 + n}m`),
      back: backColor(`${40 + n}m`),
    };
  }),
  bright: range({ to: 8 }).map((n) => {
    return {
      fore: foreColor(`${90 + n}m`),
      back: backColor(`${100 + n}m`),
    };
  }),
  default: {
    fore: foreColor("39m"),
    back: backColor("49m"),
  },
} as const;

function cube<T extends "fore" | "back">(): readonly ColorDef[][][] {
  const rR: ColorDef[][][] = [];
  for (const r of range({ to: 6 })) {
    const rG: ColorDef[][] = [];
    rR.push(rG);
    for (const g of range({ to: 6 })) {
      const rB: ColorDef[] = [];
      rG.push(rB);
      for (const b of range({ to: 6 })) {
        const seq = (code: number) => `${code};5;(${16 + 36 * r + 6 * g + b})m`;
        rB.push({ fore: foreColor(seq(38)), back: backColor(seq(48)) });
      }
    }
  }
  return rR;
}

/**
 * 8-bit color.
 */
export const COLOR8 = {
  standard: range({ to: 8 }).map((n) => {
    return {
      fore: foreColor(`38;5;(${0 + n})m`),
      back: backColor(`48;5;(${0 + n})m`),
    };
  }),

  high: range({ to: 8 }).map((n) => {
    return {
      fore: foreColor(`38:5:(${8 + n})m`),
      back: backColor(`48:5:(${8 + n})m`),
    };
  }),

  /**
   * A 6x6x6 cube (216 colors) of color (indexed: `[red][green][blue]`, _0..5_ each);
   * `[0][0][0]` is black; `[5][5][5]` is white; `[5][0][0]` is fully-saturated red.
   */
  cube6: cube(),

  grayscale: range({ to: 24 }).map((n) => {
    return {
      fore: foreColor(`38;5;(${232 + n})m`),
      back: backColor(`48;5;(${232 + n})m`),
    };
  }),
};

const colorMap6 = Array(256).map((_, i) => Math.floor(i * (6 / 256)));

export function mapRGBToCube6(
  r: number,
  g: number,
  b: number,
): ColorDef {
  return COLOR8.cube6[colorMap6[r]][colorMap6[g]][colorMap6[b]];
}

/** NTSC grayscale formula, red. */
const gsRED = 0.299;

/** NTSC grayscale formula, green. */
const gsGREEN = 0.587;

/** NTSC grayscale formula, blue. */
const gsBLUE = 0.114;

export function mapRGBToGrayscale8(
  r: number,
  g: number,
  b: number,
): ColorDef {
  const sr = gsRED * r;
  const sg = gsGREEN * g;
  const sb = gsBLUE * b;

  return COLOR8.grayscale[Math.floor((24 / 256) * (sr + sg + sb))];
}

function checkRange8Bit(axis: number, label: string) {
  if (colorMap6[axis] === undefined) {
    throw new RangeError(
      `${label} must be an integer in range 0..255: ${axis}`,
    );
  }
}

/**
 * 24-bit color.
 *
 * Unlike other color types, this is generated on-demand rather than being
 * reused. This can result in a lot of small objects being created, which could
 * affect performance. Caller should take steps to reuse if possible.
 *
 * @param options Options.
 * @returns Foreground and background colors.
 */
export function COLOR24(options: {
  /** Red, 0..255. */
  r: number;
  /** Green, 0..255. */
  g: number;
  /** Blue, 0..255. */
  b: number;
}): ColorDef {
  checkRange8Bit(options.r, "RED");
  checkRange8Bit(options.g, "GREEN");
  checkRange8Bit(options.b, "BLUE");

  const partid = options.r * 65536 + options.g * 256 + options.b;
  const subcmd = `2;${options.r};${options.g};${options.b}m`;

  return {
    fore: foreColor(
      `38;${subcmd}`,
      0x01000000 + partid,
    ),
    back: backColor(
      `48;${subcmd}`,
      0x02000000 + partid,
    ),
  };
}

const grayscale24Colors = Array(256).map((_, i) =>
  COLOR24({ r: i, g: i, b: i })
);

/**
 * Grayscale with 256 levels in the 24-bit color space.
 * @param r Red, 0..255.
 * @param g Green, 0..255.
 * @param b Blue, 0..255.
 * @returns The equivalent grayscale with 256 levels.
 */
export function mapRGBToGrayscale24(
  r: number,
  g: number,
  b: number,
): ColorDef {
  const color = Math.floor(gsRED * r + gsGREEN * g + gsBLUE * b);
  return grayscale24Colors[color];
}
