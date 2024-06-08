renderMode = RENDERMODES.STEPS;
showDebugInfo = false;



startDelay = 0.5;

trackData = [
    1, 1,
    2, 1,
    1, 1,
    1, 1,
    1, 1,
    1, 1
];

title = parseText("Abstract projective planes");
definition = stitch([
    parseText("A projective plane is a triple "),
    parseTex("$@(/@\mathcal{P}/@,/ @\mathcal{L}/@,/ @\mathcal{I}/@)/$"),
    parseText(" of points, lines, and an incidence relation
between them such that:"),
]);

axiomA = parseText("For every two distinct points there is
exactly one line incident with both of them.");
axiomB = parseText("For every two distinct lines there is
exactly one point incident with both of them.");
axiomC = parseText("There exist four points, no three of
which are collinear.");


createpoint("A1", canvasCenter + [4 + 5, 5]);
createpoint("A2", canvasCenter + [4 + 10, 7]);
createpoint("B1", canvasCenter + [4 + 2, 0]);
createpoint("B2", canvasCenter + [4 + 15, 0]);
createpoint("B3", canvasCenter + [4 + 15, 2]);
createpoint("B4", canvasCenter + [4 + 3, 2]);
createpoint("C1", canvasCenter + [4 + 1, -5]);
createpoint("C2", canvasCenter + [4 + 3, -7]);
createpoint("C3", canvasCenter + [4 + 8, -5]);
createpoint("C4", canvasCenter + [4 + 10, -8]);

forall(allpoints(),
    #.narrow = 50;
    #.alpha = 0;
);

pointRadius = 0.5;


objectSetup() := (

);

calculation() := (

);

rendering() := (
    drawtext([canvasLeft + 1, canvasTop + 20], typeParsedText(definition, 1), size -> 0, color -> (1,1,1));
    
    drawtext([canvasCenter.x, canvasTop - 2], typeParsedText(title, t1), size -> 30, align -> "mid", family -> "KG Second Chances Solid", alpha -> easeInCirc(1 - t6));
    drawtext([canvasLeft + 1, canvasTop - 4], typeParsedText(definition, t2), size -> 25, alpha -> easeInCirc(1 - t6));
    
    drawtext([canvasLeft + 1, canvasTop - 10], typeParsedText(axiomA, t3), size -> 25, alpha -> easeInCirc(1 - t6));
    drawtext([canvasLeft + 1, canvasTop - 16], typeParsedText(axiomB, t4), size -> 25, alpha -> easeInCirc(1 - t6));
    drawtext([canvasLeft + 1, canvasTop - 22], typeParsedText(axiomC, t5), size -> 25, alpha -> easeInCirc(1 - t6));

    p = lerp(A1, A2, -0.3);
    q = lerp(A1, A2, 1.3);
    draw(p, lerp(p, q, easeInOutCubic(t3)), color -> (0.2, 0.3, 0.8), size -> 8 * easeOutCirc(t3), alpha -> easeInCirc(1 - t6));
    fillcircle(A1, pointRadius * easeOutBack(t3), color -> (0.8, 0.2, 0.3), alpha -> easeInCirc(1 - t6));
    fillcircle(A2, pointRadius * easeOutBack(t3), color -> (0.8, 0.2, 0.3), alpha -> easeInCirc(1 - t6));
    
    draw(B1, lerp(B1, B3, easeInOutCubic(t4)), color -> (0.2, 0.3, 0.8), size -> 8 * easeOutCirc(t4), alpha -> easeInCirc(1 - t6));
    draw(B4, lerp(B4, B2, easeInOutCubic(t4)), color -> (0.2, 0.3, 0.8), size -> 8 * easeOutCirc(t4), alpha -> easeInCirc(1 - t6));
    r = meet(join(B1, B3), join(B4, B2));
    fillcircle(r, pointRadius * easeOutBack(t4), color -> (0.8, 0.2, 0.3), alpha -> easeInCirc(1 - t6));
    
    fillcircle(C1, pointRadius * easeOutBack(t5), color -> (0.8, 0.2, 0.3), alpha -> easeInCirc(1 - t6));
    fillcircle(C2, pointRadius * easeOutBack(t5), color -> (0.8, 0.2, 0.3), alpha -> easeInCirc(1 - t6));
    fillcircle(C3, pointRadius * easeOutBack(t5), color -> (0.8, 0.2, 0.3), alpha -> easeInCirc(1 - t6));
    fillcircle(C4, pointRadius * easeOutBack(t5), color -> (0.8, 0.2, 0.3), alpha -> easeInCirc(1 - t6));
    
);

