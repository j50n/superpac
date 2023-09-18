/**
 * SGR (Select Graphic Rendition) parameters.
 * 
 * [Ansi Escape Code Wiki: SGR](https://en.wikipedia.org/wiki/ANSI_escape_code#SGR_(Select_Graphic_Rendition)_parameters)
 */

import {
  AnsiEscControlSeq,
  ansiEscControlSeq,
  AnsiEscSwitch,
  range,
} from "./common.ts";

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

export const COLORS = {
  BLACK: 0,
  RED: 1,
  GREEN: 2,
  YELLOW: 3,
  BLUE: 4,
  PURPLE: 5,
  CYAN: 6,
  WHITE: 7,
} as const;

export const COLOR4 = {
  fore: {
    normal: range({ to: 8 }).map((n) => ansiEscControlSeq(`${30 + n}m`)),
    bright: range({ to: 8 }).map((n) => ansiEscControlSeq(`${90 + n}m`)),
    default: ansiEscControlSeq("39m"),
  } as const,

  back: {
    normal: range({ to: 8 }).map((n) => ansiEscControlSeq(`${40 + n}m`)),
    bright: range({ to: 8 }).map((n) => ansiEscControlSeq(`${100 + n}m`)),
    default: ansiEscControlSeq("49m"),
  } as const,
} as const;

function cube(kind: "fore" | "back"): readonly AnsiEscControlSeq[][][] {
  const code = kind === "fore" ? "38" : "48";

  const rR: AnsiEscControlSeq[][][] = [];
  for (const r of range({ to: 6 })) {
    const rG: AnsiEscControlSeq[][] = [];
    rR.push(rG);
    for (const g of range({ to: 6 })) {
      const rB: AnsiEscControlSeq[] = [];
      rG.push(rB);
      for (const b of range({ to: 6 })) {
        rB.push(ansiEscControlSeq(`${code};5;(${16 + 36 * r + 6 * g + b})m`));
      }
    }
  }
  return rR;
}

export const COLOR8 = {
  fore: {
    standard: range({ to: 8 }).map((n) =>
      ansiEscControlSeq(`38;5;(${0 + n})m`)
    ),
    high: range({ to: 8 }).map((n) => ansiEscControlSeq(`38:5:(${8 + n})m`)),
    cube6: cube("fore"),
    grayscale: range({ to: 24 }).map((n) =>
      ansiEscControlSeq(`38;5;(${232 + n})m`)
    ),
  } as const,

  back: {
    standard: range({ to: 8 }).map((n) =>
      ansiEscControlSeq(`48;5;(${0 + n})m`)
    ),
    high: range({ to: 8 }).map((n) => ansiEscControlSeq(`48:5:(${8 + n})m`)),
    cube6: cube("back"),
    grayscale: range({ to: 24 }).map((n) =>
      ansiEscControlSeq(`48;5;(${232 + n})m`)
    ),
  } as const,
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

function color24fore(options: { r: number; g: number; b: number }) {
  check(options.r, "RED");
  check(options.g, "GREEN");
  check(options.b, "BLUE");

  return new AnsiEscControlSeq(
    `38;2;(${options.r});(${options.g});(${options.b})m`,
    0x01000000 + options.r * 65536 + options.g * 256 + options.b,
  );
}

function color24back(options: { r: number; g: number; b: number }) {
  check(options.r, "RED");
  check(options.g, "GREEN");
  check(options.b, "BLUE");

  return new AnsiEscControlSeq(
    `48;2;(${options.r});(${options.g});(${options.b})m`,
    0x02000000 + options.r * 65536 + options.g * 256 + options.b,
  );
}

export const COLOR24 = {
  fore: color24fore,
  back: color24back,
} as const;
