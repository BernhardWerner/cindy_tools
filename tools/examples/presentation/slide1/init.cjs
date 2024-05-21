renderMode = RENDERMODES.STEPS;
showDebugInfo = false;



startDelay = 0.5;

trackData = [
    1, 1,
    1, 1
];

title = parseText("This is a presentation");

objectSetup() := (

);

calculation() := (

);

rendering() := (
    drawtext(canvasCenter, typeParsedText(title, t1), size -> 60, align -> "mid", family -> "KG Second Chances Solid", alpha -> easeInCirc(1 - t2));
);

