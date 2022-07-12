#!/usr/bin/env -S deno --unstable run 

import {
  keypress,
  KeyPressEvent,
} from "https://deno.land/x/cliffy@v0.24.2/keypress/mod.ts";

keypress().addEventListener("keydown", (event: KeyPressEvent) => {
    console.log(
        "type: %s, key: %s, ctrl: %s, meta: %s, shift: %s, alt: %s, repeat: %s",
        event.type,
        event.key,
        event.ctrlKey,
        event.metaKey,
        event.shiftKey,
        event.altKey,
        event.repeat,
      );

  if (event.ctrlKey && event.key == "c") {
    keypress().dispose();
  }
});
