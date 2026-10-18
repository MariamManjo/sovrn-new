// Logo mark, 32×32 native; A pulse · B ring · C light · D white · E dark · F rim · G base · H shade · I deep · J core
const PAL: Record<string, string> = {
  A: "#dee6e2", B: "#8b9c98", C: "#c3d0cb", D: "#eff5f1", E: "#364543",
  F: "#b7c6bf", G: "#7f938a", H: "#6a7b77", I: "#273a35", J: "#b4f0d7",
};

const ROWS = [
  "................................",
  "................A...............",
  "............BBB.BBB.B...........",
  ".........B...........BB.........",
  "........B...............B.......",
  "......B.................BB......",
  ".....B....................B.....",
  "....BB..........................",
  "...............CCD.........B....",
  "...B.........CCDDDD.........B...",
  "...B........CEEFFDGC............",
  "..B.......CCEEHFFGGECC..........",
  "........CCEEDHHFFGGHEECC.....B..",
  "..B....CEEHFDGGGFGGGIIEEC....B..",
  "..B..CCEEHGFGGGGIGDDIHHHECC..B..",
  ".BB.HCCEEGGFGGGGGFDDGEEHHCCE....",
  ".A..HHHCEEGGCGIIJFFGICHHCEEE.BA.",
  "..B.HHHHCCEEGGGGIIFGHHCCEEEE.B..",
  "..B...HHHHCCEHHHGGIICCEEEE...B..",
  "..B.....HHHHCEEHHHHCEEEE........",
  ".........HHHHCCEHCCEEEE......B..",
  "...........HHHHCCEEEE.......B...",
  "...B.........HHHEEE.........B...",
  "....B.........HHEE..............",
  "..........................BB....",
  ".....B....................B.....",
  "......BB.................B......",
  ".......B...............B........",
  ".........BB...........B.........",
  "...........B.BBB.BBB............",
  "...............BA...............",
  "................................",
];

const RUNS = ROWS.flatMap((row, y) => {
  const runs: [x: number, y: number, w: number, color: string][] = [];
  for (let x = 0; x < row.length; ) {
    const c = PAL[row[x]!];
    let w = 1;
    while (c && row[x + w] === row[x]) w++;
    if (c) runs.push([x, y, w, c]);
    x += w;
  }
  return runs;
});

export function SovrnMark({ scale = 1 }: { scale?: 1 | 2 | 3 }) {
  return (
    <svg width={32 * scale} height={32 * scale} viewBox="0 0 32 32" shapeRendering="crispEdges" aria-hidden className="block shrink-0">
      {RUNS.map(([x, y, w, c]) => <rect key={`${x}-${y}`} x={x} y={y} width={w} height={1} fill={c} />)}
    </svg>
  );
}
