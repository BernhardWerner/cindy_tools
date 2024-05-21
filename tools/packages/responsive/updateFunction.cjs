updateLayout() := (
    canvasPoly = apply(screenbounds(), #.xy); //LO, RO, RU, LU
    canvasCorners = {
        "tl": canvasPoly_1,
        "tr": canvasPoly_2,
        "br": canvasPoly_3,
        "bl": canvasPoly_4
    };
    canvasCenter  = 0.5 * canvasCorners.tl + 0.5 * canvasCorners.br;
    canvasWidth   = dist(canvasCorners.tl, canvasCorners.tr);
    canvasHeight  = dist(canvasCorners.tl, canvasCorners.bl);
    [canvasLeft, canvasTop] = canvasCorners.tl;
    [canvasRight, canvasBottom] = canvasCorners.br;
  
    customLayout();
  );
  
  customLayout() := ();