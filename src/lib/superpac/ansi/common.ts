const ESCAPE = "\x1B";

interface WindowExt extends Window {
  superpac?: {
    uid: number;
  };
}
export function nextUid() {
  const w = window as WindowExt;
  if (w.superpac == null) {
    w.superpac = { uid: 0 };
  }

  return w.superpac.uid++;
}

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

  /**
   * Constructor.
   * @param seq The character sequence.
   * @param uid The identifier. This is guaranteed to be unique for
   *     character sequences that are exactly equivalent, so it is
   *     useful for a fast equality check. Nothing else should be
   *     inferred from the value.
   */
  constructor(readonly seq: string, public readonly uid: number) {
    this.txt = seq;
    this.bin = new TextEncoder().encode(seq);
  }
}

/**
 * Initialize a {@link CharSeq}. Sequences created this way are
 * assumed to be interned.
 *
 * @param seq The character sequence.
 * @returns The {@link CharSeq} instance.
 */
export function charSeq(seq: string, uid?: number) {
  return new CharSeq(seq, uid || nextUid());
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

/**
 * Initialize a {@link AnsiEscControlSeq}. Sequences created this way are
 * assumed to be interned.
 *
 * @param seq The control sequence.
 * @returns The {@link AnsiEscControlSeq} instance.
 */
export function ansiEscControlSeq(
  seq: string,
  uid?: number,
): AnsiEscControlSeq {
  return new AnsiEscControlSeq(seq, uid || nextUid());
}

export const CR = charSeq("\r");
export const LF = charSeq("\n");

export const SPACE = charSeq(" ");
export const LOW_HALFBLOCK = charSeq("▄")
