updateLayout() := (
    canvasPoly = apply(screenbounds(), #.xy); //LO, RO, RU, LU

    canvasAnchors = [
        canvasPoly_4,
        0.5 * canvasPoly_4 + 0.5 * canvasPoly_3,
        canvasPoly_3,
    
        0.5 * canvasPoly_4 + 0.5 * canvasPoly_1,
        0.5 * canvasPoly_4 + 0.5 * canvasPoly_2,
        0.5 * canvasPoly_3 + 0.5 * canvasPoly_2,
    
        canvasPoly_1,
        0.5 * canvasPoly_1 + 0.5 * canvasPoly_2,
        canvasPoly_2
    ];
    
    
    canvasCenter  = canvasAnchors_5;
    canvasWidth   = dist(canvasAnchors_1, canvasAnchors_3);
    canvasHeight  = dist(canvasAnchors_1, canvasAnchors_7);
    [canvasLeft, canvasTop] = canvasAnchors_7;
    [canvasRight, canvasBottom] = canvasAnchors_3;
    
    customLayout();
);

customLayout() := ();