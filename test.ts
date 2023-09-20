import { createCanvas } from "https://deno.land/x/canvas@v1.4.1/mod.ts";
import { COLOR24, RESET } from "./src/lib/superpac/ansi/sgr.ts";

const canvas = createCanvas(20, 10);
const ctx = canvas.getContext("2d");
ctx.fillStyle = "blue"; //"rgb(255,0,0)";
ctx.fillRect(2, 1, 8, 4);
ctx.fillStyle = "red"; //"rgba(0,0,255,0.5)";
ctx.fillRect(4, 2, 8, 4);
ctx.fillStyle = "green"; //"rgba(0,0,255,0.5)";
ctx.fillRect(6, 3, 8, 4);



const data = ctx.getImageData(0, 0, 20, 10).data;
// const data = canvas.getRawBuffer(0,0,20,10)

// for(const d of data){
//   console.log(d)
// }

for (let y = 0; y < 10; y++) {
  const row = [];
  for (let x = 0; x < 20; x++) {
    const base = 4 * (x + y * 20);
    const r = data[base];
    const g = data[base + 1];
    const b = data[base + 2];

    row.push(COLOR24({ r, g, b }).fore.txt);
    row.push("@");
  }
  row.push(RESET.txt);
  console.log(row.join(""));
}
