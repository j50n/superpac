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

export const BLACK = 0;
export const RED = 1;
export const GREEN = 2;
export const YELLOW = 3;
export const BLUE = 4;
export const PURPLE = 5;
export const VIOLET = PURPLE;
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

function cube<T extends "fore" | "back">(
  kind: T,
): readonly (typeof kind extends "fore" ? ForeColor : BackColor)[][][] {
  const code = kind === "fore" ? "38" : "48";

  const rR: AnsiEscControlSeq[][][] = [];
  for (const r of range({ to: 6 })) {
    const rG: AnsiEscControlSeq[][] = [];
    rR.push(rG);
    for (const g of range({ to: 6 })) {
      const rB: AnsiEscControlSeq[] = [];
      rG.push(rB);
      for (const b of range({ to: 6 })) {
        const seq = `${code};5;(${16 + 36 * r + 6 * g + b})m`;
        rB.push(kind === "fore" ? foreColor(seq) : backColor(seq));
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
  cube6: {
    fore: cube("fore"),
    back: cube("back"),
  },

  grayscale: range({ to: 24 }).map((n) => {
    return {
      fore: foreColor(`38;5;(${232 + n})m`),
      back: backColor(`48;5;(${232 + n})m`),
    };
  }),
};

function check(axis: number, label: string) {
  if (!Number.isInteger(axis)) {
    throw new RangeError(`${label} must be an integer: ${axis}`);
  } else if (axis < 0) {
    throw new RangeError(`${label} must be 0 or greater: ${axis}`);
  } else if (axis > 255) {
    throw new RangeError(`${label} must be 255 or less: ${axis}`);
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
}) {
  check(options.r, "RED");
  check(options.g, "GREEN");
  check(options.b, "BLUE");

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
