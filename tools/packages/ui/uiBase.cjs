 
// ************************************************************************************************
// Draws a rectangle with rounded corners.
// ************************************************************************************************
roundedrectangle(tl, w, h, r) := roundedrectangle(tl, tl + [w,-h], r);
roundedrectangle(tl, br, r) := (
    regional(tr, bl);
    tr = [br.x, tl.y];
    bl = [tl.x, br.y];
    r = min([r, |tl.x-br.x|/2, |tl.y-br.y|/2]);
    //rounded corners
    circle(tl.xy + [r,-r], r)
        ++ circle(bl.xy + [r,r], r)
        ++ circle(br.xy + [-r,r], r)
        ++ circle(tr.xy + [-r,-r], r)
    //rectangle
        ++ polygon([tl.xy + [r,0], tr.xy + [-r,0], br.xy + [-r,0], bl.xy + [r,0]])
        ++ polygon([tl.xy + [0,-r], tr.xy + [0,-r], br.xy + [0,r], bl.xy + [0,r]]);
);



// *************************************************************************************************
// Linear interpolation between x and y.
// *************************************************************************************************
lerp(x, y, t) := t * y + (1 - t) * x;
inverseLerp(x, y, p) := if(dist(y, x) != 0, (p - x) / (y - x), 0.5);
// Lerp relative to t in interval [a, b].
lerp(x, y, t, a, b) := lerp(x, y, inverseLerp(a, b, t));



/*
    // CONVEX POLYGONS ONLY!!!
    
    pointInPolygon(point, poly) := (
        regional(resultForwards, resultBackwards);

        resultForwards = true;
        resultBackwards = true;
        forall(cycle(poly),
            resultForwards  = and(resultForwards , det([#_1 :> 1, #_2 :> 1, point :> 1]) >= 0);
            resultBackwards = and(resultBackwards, det([#_1 :> 1, #_2 :> 1, point :> 1]) <= 0);
        );

        or(resultForwards, resultBackwards);
    );
    */      
pointInPolygon(point, polygon) := (
    regional(x,y, inside, i, j, xi, yi, xj, yj, intersect);
    
    if(polygon_1 ~= polygon_(-1),
        pointInPolygon(point, pop(polygon));
    , // else //
        x = point_1;
        y = point_2;
        
        inside = false;

        j = length(polygon);
        forall(1..length(polygon), i,
            xi = polygon_i_1;
            yi = polygon_i_2;
            xj = polygon_j_1;
            yj = polygon_j_2;
            
            intersect = ((yi > y) != (yj > y)) & (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect, inside = !inside);
            j = i;
        );
        
        inside;
    );
);





newButton(dict) := (
  regional(res, keys);
  keys = keys(dict);
  res = {
    "position":   if(contains(keys, "position"), dict.position, [0,0]),
    "size":       if(contains(keys, "size"), dict.size, [5, 2]),
    "label":      if(contains(keys, "label"), dict.label, "Button"),
    "labelSize":  if(contains(keys, "labelSize"), dict.labelSize,  25),
    "colors":     if(contains(keys, "colors"), dict.colors, [(1,1,1) * 0.7, (1,1,1) * 0.5, (1,1,1) * 0.3]),
    "labelColor": if(contains(keys, "labelColor"), dict.labelColor, (1,1,1)),
    "corner":     if(contains(keys, "corner"), dict.corner, 0.7),
    "isToggle":   if(contains(keys, "isToggle"), dict.isToggle, false),
    "pressed":    if(contains(keys, "pressed"), dict.pressed, false),
    "fontFamily": if(contains(keys, "fontFamily"), dict.fontFamily, 0),
    "active":     if(contains(keys, "active"), dict.active, true),
    "visible":    if(contains(keys, "visible"), dict.visible, true)
  };
  res.draw := (
    if(self().visible,
      if(self().pressed,
          fill(roundedrectangle(self().position + 0.5 * (-self().size.x, self().size.y) + (0, -0.2), self().size.x, self().size.y, self().corner), color -> (self().colors)_1);
          drawtext(self().position + (0, -0.5 * self().labelSize / 35) + (0, -0.2), self().label, align->"mid", size->self().labelSize, color->self().labelColor, bold->true, family->self().fontFamily);
      , // else //
          fill(roundedrectangle(self().position + 0.5 * (-self().size.x, self().size.y) + (0, -0.2), self().size.x, self().size.y, self().corner), color -> (self().colors)_3);
          fill(roundedrectangle(self().position + 0.5 * (-self().size.x, self().size.y), self().size_1, self().size_2, self().corner), color -> (self().colors)_2);
          drawtext(self().position + (0, -0.5 * self().labelSize / 35), self().label, align->"mid", size->self().labelSize, color->self().labelColor, bold->true, family->self().fontFamily);
      );
    );
  );
  res.onDown := ();
  res.onDrag := ();
  res.onUp := ();
  res.handleInput := (
    if(self().active & mouseInButton(self()), 
      if(mouseScriptIndicator == "Down",
        self().pressed = if(self().isToggle, !self().pressed, true);
        self().onDown;
      );

      if(mouseScriptIndicator == "Up", 
        self().onUp;
        if(!self().isToggle, self().pressed = false);
      );
    );
  );


  uiCollection = uiCollection :> res;

  res;
);
newButton() := newButton({});



    /* ************************************************************************************************
     Draws and handles buttons. They have to be a JSON with the following keys and value-types:
     button = {
       "position":   (2D vector),
       "size":       (2D vector),
       "label":      (String),
       "textSize":   (float),
       "colors":     (array with 3 colour vectors),
       "corner":     (float),
       "pressed":    (bool),
       "fontFamily": (String)
     };
     ************************************************************************************************ */


    // Boilerplate code for button functionality. Call via
    // if(mouseInButton(button),
    // 	SOME CODE
    // );
    // in the mousedownscript and mouseupscript. The property button.pressed has to be set/updated manually; allowing for both switch- and toggle-buttons.
mouseInButton(button) := (
  dist(mouse().x, button.position.x) < 0.5 * button.size.x
& dist(mouse().y, button.position.y) < 0.5 * button.size.y;
);




    // ************************************************************************************************
    // Draws and handles toggles. They have to be a JSON with the following keys and value-types:
    // toggle = {
    //   "position":   (2D vector),
    //   "radius":     (float),
    //   "lineSize":   (float),
    //   "label":      (String),
    //   "textSize":   (float),
    //   "color":      (3D Vector),
    //   "pressed":    (bool),
    //   "fontFamily": (String)
    // };
    // ************************************************************************************************
drawToggle(toggle) := (
    fillcircle(toggle.position, toggle.radius, size->toggle.lineSize, color -> toggle.innerColor);
    if(toggle.pressed,
        drawcircle(toggle.position, toggle.radius, size->toggle.lineSize, color->toggle.borderColor);
    , // else //
        drawcircle(toggle.position, toggle.radius, size->1, color->(0,0,0));
    );
    drawtext(toggle.position + [0, -0.015 * toggle.textSize], toggle.label, size->toggle.textSize, align->"mid", family->toggle.fontFamily, color -> toggle.labelColor);
);

catchToggle(toggle) := if(dist(mouse().xy, toggle.position) < toggle.radius, toggle.pressed = !toggle.pressed);








/*****
Dropdown menus must be JSON object of the form
dropDown = {
  "position": [3, -3],
  "width": 10,
  "lineHeight": 2,
  "entries": ["This", "is", "just", "a", "test", "$\sum_{i=0}^n i^2$"],
  "index": 1,
  "color": toolColor.grey,
  "textColor": (1,1,1),
  "textSize": 20,
  "open": 0,
  "animationTarget": 0,
  "animationProgress": 1,
  "corner": 0.5,
  "gutter": 0.2
};

*****/

drawDropDownMenu(obj) := (
    regional(height, noe, shape, angle, chevron);
  
    noe = length(obj.entries);
    height = obj.lineHeight * (1 + noe * obj.open) + obj.gutter * noe * obj.open;
  
    shape = roundedrectangle(obj.position + 0.5 * obj.gutter * [-1,1], obj.width + obj.gutter, height + obj.gutter, obj.corner);
    fill(shape, color -> obj.color, alpha -> 0.5);
    
    fill(roundedrectangle(obj.position, obj.width, obj.lineHeight, obj.corner), color -> obj.color, alpha -> 1);
    drawtext(obj.position + [1, -0.5 * obj.lineHeight - 0.0125 * obj.textSize], (obj.entries)_(obj.index), size -> obj.textSize, color -> obj.textColor);
  
    angle = lerp(1.5 * pi, 0.5 * pi, obj.open);
    chevron = apply(-1..1, [cos(2 * pi * # / 3), sin(2 * pi * # / 3)]) :> [0.1, 0];
    chevron = apply(chevron, 0.2 * obj.lineHeight * rotate(#, angle) + obj.position + [0.87 * obj.width, - 0.5 * obj.lineHeight]);
  
    fillpoly(chevron, color -> obj.textColor);
    drawpoly(chevron, color -> obj.textColor, size -> 3);
  
    gsave();
    clip(shape);
  
    forall(1..noe,
      fill(roundedrectangle(obj.position + [0, -# * (obj.lineHeight) - # * obj.gutter], obj.width, obj.lineHeight, obj.corner), color -> obj.color, alpha -> if(# == obj.index, 1, 0.5));
    );
    forall(1..noe,
      drawtext(obj.position + [1, -(# + 0.5) * obj.lineHeight  - # * obj.gutter - 0.0125 * obj.textSize], obj.entries_#, size -> obj.textSize, color -> obj.textColor);
    );
    grestore();
);

animateDropDownMenu(obj, delta) := (
    obj.animationProgress = clamp(obj.animationProgress + 2 * delta, 0, 1);
    obj.open = lerp(1 - obj.animationTarget, obj.animationTarget, easeInOutCubic(obj.animationProgress));
);

switchDropDownMenu(obj) := (
    if(obj.animationProgress >= 1 & pointInPolygon(mouse().xy, expandrect(obj.position, 7, obj.width, obj.lineHeight)), 
        obj.animationTarget = 1 - obj.animationTarget;
        obj.animationProgress = 0;
    );
);

catchDropDownMenu(obj) := (
    if(obj.animationProgress >= 1,
        forall(1..length(obj.entries),
        if(pointInPolygon(mouse().xy, expandrect(obj.position + [0, -# * (obj.lineHeight) - # * obj.gutter], 7, obj.width, obj.lineHeight)),
            obj.index = #;
        );
        );
    );
);





      


    /* *************************************************************************************************
    Creates and handles slider UI element. Has to be a JSON object with the following keys and value-types.
    slider = {
      "position":    (2D vector),
      "length":      (float),
      "size":        (float),
      "vertical":    (bool),
      "color":       (color vector),
      "startLabel":  (string),
      "endLabel":    (string),
      "labelSize":   (float),
      "value":       (float),
      "bulbSize":    (float),
      "dragging":    (bool),
      "fontFamily":  (string)
    };
    ************************************************************************************************* */
    
sliderEnds(slider) := [slider.position, slider.position + if(slider.vertical, [0, -slider.length], [slider.length, 0])];

drawSlider(slider) := (
  regional(endPoints, startOffset, endOffset);

  endPoints = sliderEnds(slider);

  draw(endPoints, size -> slider.size, color -> slider.outerColor);
  fillcircle(lerp(endPoints_1, endPoints_2, slider.value), slider.bulbSize, color -> slider.outerColor);
  fillcircle(lerp(endPoints_1, endPoints_2, slider.value), 0.7 * slider.bulbSize, color -> slider.innerColor);

  startOffset = if(slider.vertical,
    [0, 1.2 * slider.bulbSize + 0.2];
  , // else //
    [-1.2 * slider.bulbSize, -0.015 * slider.labelSize];
  );
  endOffset = if(slider.vertical,
    [0, -1.2 * slider.bulbSize - 0.05 * slider.labelSize];
  , // else //
    [1.2 * slider.bulbSize, -0.015 * slider.labelSize];
  );
  drawtext(endPoints_1 + startOffset, slider.startLabel, align -> if(slider.vertical, "mid", "right"),  color -> slider.labelColor, size -> slider.labelSize, family->slider.fontfamily);
  drawtext(endPoints_2 + endOffset,   slider.endLabel,   align -> if(slider.vertical, "mid", "left"),   color -> slider.labelColor, size -> slider.labelSize, family->slider.fontfamily);
);

catchSliderRaw(slider) := (
    regional(endPoints);

    endPoints = sliderEnds(slider);

    if(capsuleSDF(mouse().xy, endPoints_1, endPoints_2, slider.bulbSize + 0.02 * slider.size) <= 0,
      slider.value = if(slider.vertical,
        clamp(inverseLerp((endPoints_1).y, (endPoints_2).y, mouse().y), 0, 1);
      , // else //
        clamp(inverseLerp((endPoints_1).x, (endPoints_2).x, mouse().x), 0, 1);
      );
    );
);

  catchSliderDown(slider) := (
    regional(endPoints);

    endPoints = sliderEnds(slider);

    if(capsuleSDF(mouse().xy, endPoints_1, endPoints_2, slider.bulbSize + 0.02 * slider.size) <= 0,
      slider.dragging = true;
    );
    catchSliderDrag(slider);
  );

  catchSliderDrag(slider) := (
    regional(endPoints);

    endPoints = sliderEnds(slider);

    if(slider.dragging,
      slider.value = if(slider.vertical,
        clamp(inverseLerp((endPoints_1).y, (endPoints_2).y, mouse().y), 0, 1);
      , // else //
        clamp(inverseLerp((endPoints_1).x, (endPoints_2).x, mouse().x), 0, 1);
      );
    );
  );

  catchSliderUp(slider) := (
    catchSliderDrag(slider);
    slider.dragging = false;
  );


// MAJOR BACKWARDS COMPTATBILITY BREAK IN SELECTORS !!!!!
/*************************************************************************************************
    Creates and handles selector UI element. Has to be a JSON object with the following keys and value-types.
    selector = {
      "position":    (2D vector),
      "gapSize":     (float),
      "size":        (float),
      "vertical":    (bool),
      "outerColor":       (color vector),
      "innerColor":       (color vector),
      "textColor":       (color vector),
      "textSize":    (float),
      "content":	 (array),
      "index":       (int),
      "bulbSize":    (float),
      "dragging":    (bool),
      "fontFamily":  (String)
    };
*************************************************************************************************/
selectorEnds(selector) := [selector.position, selector.position + if(selector.vertical, [0, -selector.gapSize * (length(selector.content) - 1)], [selector.gapSize * (length(selector.content) - 1), 0])];

drawSelector(selector) := (
    regional(endPoints);

endPoints = selectorEnds(selector);

draw(endPoints, size -> selector.size, color -> selector.outerColor);
fillcircle(lerp(endPoints_1, endPoints_2, selector.index, 1, length(selector.content)), selector.bulbSize, color -> selector.outerColor);
fillcircle(lerp(endPoints_1, endPoints_2, selector.index, 1, length(selector.content)), 0.7 * selector.bulbSize, color -> selector.innerColor);

drawimage(canvasCorners.bl, canvasCorners.br, selector.outlineTexture);
forall(1..length(selector.content),
    drawtext(lerp(endPoints_1, endPoints_2, #, 1, length(selector.content)) + (0, -0.015 * selector.textSize), selector.content_#, size -> selector.textSize, align -> "mid", color -> selector.textColor, family -> selector.fontFamily);
);


);

catchSelectorRaw(selector) := (
    regional(endPoints, closeEntries);

    endPoints = selectorEnds(selector);

    if(capsuleSDF(mouse().xy, endPoints_1, endPoints_2, selector.bulbSize + 0.02 * selector.size) <= 0,
    closeEntries = select(1..length(selector.content),
        dist(mouse().xy, lerp(endPoints_1, endPoints_2, #, 1, length(selector.content))) < selector.bulbSize + 0.02 * selector.size
    );


    if(closeEntries != [],
        selector.index = sort(closeEntries, 
            dist(mouse().xy, lerp(endPoints_1, endPoints_2, #, 1, length(selector.content)));	
        )_1;
    );

  );
);

catchSelectorDown(selector) := (
    regional(endPoints, closeEntries);

    endPoints = selectorEnds(selector);

    if(capsuleSDF(mouse().xy, endPoints_1, endPoints_2, selector.bulbSize + 0.02 * selector.size) <= 0,
        selector.dragging = true;
    );
    catchSelectorDrag(selector);
);


catchSelectorDrag(selector) := (
    regional(endPoints, closeEntries);

    endPoints = selectorEnds(selector);

    if(selector.dragging,
        selector.index = sort(1..length(selector.content), 
            dist(mouse().xy, lerp(endPoints_1, endPoints_2, #, 1, length(selector.content)));	
        )_1;
    );
);

catchSelectorUp(selector) := (
    catchSelectorDrag(selector);
    selector.dragging = false;	
);




    
pointInRect(point, poly) := (
    regional(a,b);
    a = min(poly);
    b = max(poly);
    (a_1 <= point_1) & (point_1 <= b_1) & (a_2 <= point_2) & (point_2 <= b_2);
  );
  
  
  drawCheckbox(checkbox) := (
    regional(border, labelSize);
  
    border = roundedrectangle(checkbox.position + 0.5 * [-checkbox.size, checkbox.size], checkbox.size, checkbox.size, checkbox.size * 0.2);
    if(checkbox.pressed,
      draw([checkbox.position + 0.3 * [-checkbox.size, checkbox.size], checkbox.position + 0.3 * [checkbox.size, -checkbox.size]], color -> checkbox.color, size -> 7);
      draw([checkbox.position + 0.3 * [-checkbox.size, -checkbox.size], checkbox.position + 0.3 * [checkbox.size, checkbox.size]], color -> checkbox.color, size -> 7);
    );
    draw(border, color -> (0,0,0), size -> 2);
  
    labelHeight = pixelsize(checkbox.label, size -> checkbox.labelSize)_2 / screenresolution();
    
    vOffset = 0.35 * labelHeight;
    drawtext(checkbox.position + [-checkbox.size - checkboxLabelGap, -vOffset], checkbox.label, size -> checkbox.labelSize, color -> (0,0,0), align -> "right");
  );
  
  
  handleCheckbox(checkbox) := (
    regional(labelAABB, w, h, poly);
  
    labelAABB = pixelsize(checkbox.label, size -> checkbox.labelSize) / screenresolution();
    w = labelAABB_1;
    h = labelAABB_2 + labelAABB_3;
    poly = expandrect(checkbox.position + [-0.5 * checkbox.size, 0], checkbox.size + checkboxLabelGap + w, max(checkbox.size, h), 4);
    
    if(pointInRect(mouse(), poly),
      checkbox.pressed = !checkbox.pressed;
    );
  );

  capsuleSDF(p, start, end, radius) := (
    regional(pa, ba, h);

    pa = p - start;
    ba = end - start;

    h = clamp((pa * ba) / (ba * ba), 0, 1);

    abs(pa - ba * h) - radius;
);