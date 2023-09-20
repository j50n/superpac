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
  /** Background color. */
  readonly back: BackColor[];
  /** Foreground color. */
  readonly fore: ForeColor[];
  /** Bit-wise styles. */
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
}

if (import.meta.main) {
  console.dir(Deno.consoleSize());
}
