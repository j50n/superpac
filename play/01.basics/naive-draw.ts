import { createCanvas } from "https://deno.land/x/canvas@v1.4.1/mod.ts";
import { BLACK, COLOR24, COLOR4, RESET, WHITE } from "./src/lib/superpac/ansi/sgr.ts";

const canvas = createCanvas(20, 10);
const ctx = canvas.getContext("2d");
ctx.fillStyle = "blue"; //"rgb(255,0,0)";
ctx.fillRect(2, 1, 8, 4);
ctx.fillStyle = "red"; //"rgba(0,0,255,0.5)";
ctx.fillRect(4, 2, 8, 4);
ctx.fillStyle = "green"; //"rgba(0,0,255,0.5)";
ctx.fillRect(6, 3, 8, 4);

ctx.fillStyle = "violet";
ctx.fillRect(8, 4, 8, 4);

ctx.fillStyle = "yellow";
ctx.fillRect(10, 5, 8, 4);



const data = ctx.getImageData(0, 0, 20, 10).data;
// const data = canvas.getRawBuffer(0,0,20,10)

// for(const d of data){
//   console.log(d)
// }

console.log("Colors:")
for (let y = 0; y < 10; y++) {
  const row = [];
  for (let x = 0; x < 20; x++) {
    const base = 4 * (x + y * 20);
    const r = data[base];
    const g = data[base + 1];
    const b = data[base + 2];
    const alpha = data[base+3];

    if(alpha === 0){
      row.push(" ")
    } else {
      row.push(COLOR24({ r, g, b }).fore.txt);
      row.push("█");
    }
    
  }
  row.push(RESET.txt);
  console.log(`  ${row.join("")}`);
}

console.log();
console.log("Alpha Mask:")
for (let y = 0; y < 10; y++) {
  const row = [];
  for (let x = 0; x < 20; x++) {
    const base = 4 * (x + y * 20);
    // const r = data[base];
    // const g = data[base + 1];
    // const b = data[base + 2];
    const alpha = data[base+3]

    row.push(COLOR24({r: alpha, g: alpha, b: alpha}).fore.txt);
    row.push(COLOR24({r: 0, g: 128, b: 0}).back.txt)
    row.push("▒");
  }
  row.push(RESET.txt);
  console.log(`  ${row.join("")}`);
}
