const ESCAPE = "\x1B";

let uid = 0;

export function range(options: { from?: number; to: number }): number[] {
  const result: number[] = [];
  for (let i = options.from ?? 0; i < options.to; i++) {
    result.push(i);
  }
  return result;
}

export class CharSeq {
  readonly txt: string;
  readonly bin: Uint8Array;

  constructor(readonly seq: string, public readonly uid: number) {
    this.txt = seq;
    this.bin = new TextEncoder().encode(seq);
  }
}

export function charSeq(seq: string) {
  return new CharSeq(seq, uid++);
}

/**
 * Added Control Sequence Introducer (CSI) to the control sequence.
 */
export class AnsiEscControlSeq extends CharSeq {
  /**
   * Constructor.
   * @param seq Control sequence.
   */
  constructor(seq: string, uid: number) {
    super(`${ESCAPE}[${seq}`, uid);
  }
}

export function ansiEscControlSeq(seq: string): AnsiEscControlSeq {
  return new AnsiEscControlSeq(seq, uid++);
}

export interface AnsiEscSwitch {
  on: AnsiEscControlSeq;
  off: AnsiEscControlSeq;
}

export const CR = charSeq("\r");
export const LF = charSeq("\n");
