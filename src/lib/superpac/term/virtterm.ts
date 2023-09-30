import { assert } from "https://deno.land/std@0.201.0/assert/assert.ts";
import { concat } from "https://deno.land/x/proc@0.20.43/mod3.ts";
import { CharSeq, CR, SPACE } from "../ansi/common.ts";
import { BackColor, COLOR4, ForeColor, pick } from "../ansi/sgr.ts";
import * as sgr from "../ansi/sgr.ts";

export const BOLD = 0x0001;
export const FAINT = 0x0002;
export const ITALIC = 0x0004;
export const UNDERLINE = 0x0008;
export const BLINK = 0x0010;
export const INVERT = 0x0020;
export const CONCEAL = 0x0040;
export const STRIKE = 0x0080;

/** Set if the character is double width. */
export const DOUBLE_WIDTH = 0x8000;

export class VirtTerm {
  /**
   * Each character is stored as UTF-8 bytes, allowing unlimited diacriticals.
   * Also, if the character is a double-wide, this must be flagged in the style.
   */
  readonly char: Uint8Array[];
  /** Background color. */
  readonly back: BackColor[];
  /** Foreground color. */
  readonly fore: ForeColor[];
  /** Bit-wise styles. */
  readonly style: Uint16Array;

  readonly size: Readonly<ReturnType<typeof Deno.consoleSize>>;

  constructor(
    size: ReturnType<typeof Deno.consoleSize>,
    options?: { char?: CharSeq; fore?: ForeColor; back: BackColor },
  ) {
    this.size = size;

    assert(Number.isInteger(size.columns));
    assert(Number.isInteger(size.rows));

    const totalSize = size.rows * size.columns;

    this.char = Array(totalSize).fill((options?.char ?? SPACE).bin);
    this.back = Array(totalSize).fill(options?.fore ?? COLOR4.default.back);
    this.fore = Array(totalSize).fill(options?.back ?? COLOR4.default.fore);
    this.style = new Uint16Array(totalSize);
  }

  indexOf(row: number, column: number): number {
    function err(message: string): never {
      throw new RangeError(message);
    }

    if (!Number.isInteger(row)) {
      err(`row is not an integer: ${row}`);
    } else if (!Number.isInteger(column)) {
      err(`column is not an integer: ${column}`);
    } else if (row < 0 || row >= this.size.rows) {
      err(`invalid row [0..${this.size.rows - 1}]: ${row}`);
    } else if (column < 0 || column >= this.size.columns) {
      err(`invalid column [0..${this.size.columns - 1}]: ${column}`);
    } else {
      return row * this.size.columns + column;
    }
  }

  render() {
    let lastBackColor = -1;
    let lastForeColor = -1;
    let lastStyle = 0;

    const result: Uint8Array[] = new Array(
      4 * this.size.rows * this.size.columns,
    );

    result[0] = sgr.RESET.bin;
    let iResult = 1;

    let row = 0;

    while (row < this.size.rows) {
      if (row !== 0) {
        result[iResult] = CR.bin;
        iResult += 1;
      }

      let col = 0;
      while (col < this.size.columns) {
        const iTerm = row * this.size.columns + col;

        const backColor = this.back[iTerm];
        if (backColor.uid !== lastBackColor) {
          lastBackColor = backColor.uid;
          result[iResult] = backColor.bin;
          iResult += 1;
        }

        const foreColor = this.fore[iTerm];
        if (foreColor.uid !== lastForeColor) {
          lastForeColor = foreColor.uid;
          result[iResult] = foreColor.bin;
          iResult += 1;
        }

        const style = this.style[iTerm] & 0x7FFF;
        if (lastStyle !== style) {
          if (
            (style & BOLD) !== (lastStyle & BOLD) ||
            (style & FAINT) !== (lastStyle & FAINT)
          ) {
            /*
             * Bold or faint. Pick one. Can't be both per spec.
             */
            if (style & BOLD) {
              result[iResult] = sgr.BOLD.on.bin;
            } else if (style & FAINT) {
              result[iResult] = sgr.FAINT.on.bin;
            } else {
              result[iResult] = sgr.BOLD.off.bin;
            }

            iResult += 1;
          }

          if ((style & ITALIC) !== (lastStyle & ITALIC)) {
            result[iResult] = pick(style & ITALIC, sgr.ITALIC).bin;
            iResult += 1;
          }

          if ((style & UNDERLINE) !== (lastStyle & UNDERLINE)) {
            result[iResult] = pick(style & UNDERLINE, sgr.UNDERLINE).bin;
            iResult += 1;
          }

          if ((style & INVERT) !== (lastStyle & INVERT)) {
            result[iResult] = pick(style & INVERT, sgr.INVERT).bin;
            iResult += 1;
          }

          if ((style & BLINK) !== (lastStyle & BLINK)) {
            result[iResult] = pick(style & BLINK, sgr.SLOW_BLINK).bin;
            iResult += 1;
          }

          if ((style & CONCEAL) !== (lastStyle & CONCEAL)) {
            result[iResult] = pick(style & CONCEAL, sgr.CONCEAL).bin;
            iResult += 1;
          }

          if ((style & STRIKE) !== (lastStyle & STRIKE)) {
            result[iResult] = pick(style & STRIKE, sgr.STRIKE).bin;
            iResult += 1;
          }

          lastStyle = style;
        }

        if ((this.style[iTerm] & DOUBLE_WIDTH) === 0) {
          /* Single width character. */
          result[iResult] = this.char[iTerm];
          col += 1;
        } else {
          if (col === this.size.columns - 1) {
            /* Attempt to put a double width char in last column, so swap in a space. Error. */
            result[iResult] = SPACE.bin;
            col += 1;
          } else {
            /* Normal logic to insert a double-wide character. */
            result[iResult] = this.char[iTerm];
            col += 2;
          }
        }
        iResult += 1;
      }

      row += 1;
    }

    return concat(result.slice(0, iResult));
  }
}

if (import.meta.main) {
  console.dir(Deno.consoleSize());
}
