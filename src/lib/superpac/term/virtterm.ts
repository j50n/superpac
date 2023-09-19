import { assert } from "https://deno.land/std@0.201.0/assert/assert.ts";
import { SPACE } from "../ansi/common.ts";
import { BackColor, COLOR4, ForeColor } from "../ansi/sgr.ts";

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
  readonly back: BackColor[];
  readonly fore: ForeColor[];
  readonly style: Uint16Array;

  constructor(public readonly size: { columns: number; rows: number }) {
    assert(Number.isInteger(size.columns));
    assert(Number.isInteger(size.rows));

    const totalSize = size.rows * size.columns;

    this.char = Array(totalSize).fill(SPACE.bin);
    this.back = Array(totalSize).fill(COLOR4.default.back);
    this.fore = Array(totalSize).fill(COLOR4.default.fore);
    this.style = new Uint16Array(totalSize);
  }

  indexOf(row: number, column: number): number {
    /* Quick-force integer since we are using multiplication for the index. */
    const r = row << 0;
    const c = column << 0;

    if (r < 0 || r >= this.size.rows) {
      throw new RangeError(`invalid row [0..${this.size.rows - 1}]: ${r}`);
    }

    if (c < 0 || c >= this.size.columns) {
      throw new RangeError(
        `invalid column [0..${this.size.columns - 1}]: ${c}`,
      );
    }

    return r * this.size.columns + c;
  }
}

if (import.meta.main) {
  console.dir(Deno.consoleSize());
}
