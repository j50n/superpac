import {
  BOLD,
  COLOR4,
  COLORS,
  CONCEAL,
  ENCIRCLED,
  FAINT,
  FONT,
  FRAMED,
  INVERT,
  ITALIC,
  OVERLINED,
  RAPID_BLINK,
  SLOW_BLINK,
  STRIKE,
  UNDERLINE,
} from "./sgr.ts";

if (import.meta.main) {
  console.log(`BOLD:        Hel${BOLD.on.txt}lo, Wo${BOLD.off.txt}rld.`);
  console.log(`FAINT:       Hel${FAINT.on.txt}lo, Wo${FAINT.off.txt}rld.`);
  console.log(`ITALIC:      Hel${ITALIC.on.txt}lo, Wo${ITALIC.off.txt}rld.`);
  console.log(
    `UNDERLINE:   Hel${UNDERLINE.on.txt}lo, Wo${UNDERLINE.off.txt}rld.`,
  );
  console.log(
    `SLOW_BLINK:  Hel${SLOW_BLINK.on.txt}lo, Wo${SLOW_BLINK.off.txt}rld.`,
  );
  console.log(
    `RAPID_BLINK: Hel${RAPID_BLINK.on.txt}lo, Wo${RAPID_BLINK.off.txt}rld.`,
  );
  console.log(`INVERT:      Hel${INVERT.on.txt}lo, Wo${INVERT.off.txt}rld.`);
  console.log(`CONCEAL:     Hel${CONCEAL.on.txt}lo, Wo${CONCEAL.off.txt}rld.`);
  console.log(`STRIKE:      Hel${STRIKE.on.txt}lo, Wo${STRIKE.off.txt}rld.`);

  for (const [n, font] of FONT.entries()) {
    console.log(
      `FONT ${n}:  ${font.txt}What does this do? No one knows.${FONT[0].txt}`,
    );
  }

  console.log(`FRAMED:      Hel${FRAMED.on.txt}lo, Wo${FRAMED.off.txt}rld.`);
  console.log(
    `ENCIRCLED:   Hel${ENCIRCLED.on.txt}lo, Wo${ENCIRCLED.off.txt}rld.`,
  );
  console.log(
    `OVERLINED:   Hel${OVERLINED.on.txt}lo, Wo${OVERLINED.off.txt}rld.`,
  );

  console.log(
    `COLOR:   ${COLOR4.fore.normal[COLORS.RED].txt}${
      COLOR4.back.bright[COLORS.BLUE].txt
    }Red-on-Blue${COLOR4.back.default.txt}${COLOR4.fore.default.txt}`,
  );
}
