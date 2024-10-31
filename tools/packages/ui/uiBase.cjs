 
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



capsuleSDF(p, start, end, radius) := (
  regional(pa, ba, h);

  pa = p - start;
  ba = end - start;

  h = clamp((pa * ba) / (ba * ba), 0, 1);

  abs(pa - ba * h) - radius;
);

mouseInButton(button) := (
  dist(mouse().x, button.position.x) < 0.5 * button.size.x
& dist(mouse().y, button.position.y) < 0.5 * button.size.y;
);

pointInRect(point, poly) := (
  regional(a,b);
  a = min(poly);
  b = max(poly);
  (a_1 <= point_1) & (point_1 <= b_1) & (a_2 <= point_2) & (point_2 <= b_2);
);

pointInRect(point, poly) := (
  regional(a,b);
  a = min(poly);
  b = max(poly);
  (a_1 <= point_1) & (point_1 <= b_1) & (a_2 <= point_2) & (point_2 <= b_2);
);



expandRect(pos, w, h, c) := (
  regional(d, e, shift);

  d     = 0.5 * [w, h];
  e     = (d_1, -d_2);
  shift = -compass(c);
  shift = (0.5 * w * shift.x, 0.5 * h * shift.y);
  apply([-d, e, d, -e], pos + # + shift); //LU, RU, RO, LO
);
expandRect(pos, w, h) := expandRect(pos, w, h, 1);
expandRect(rect) := expandRect(rect.position, rect.width, rect.height, rect.anchor);

compass(index) := apply(directproduct(-1..1, -1..1), reverse(#))_index;









clamp(x, a, b) := min(max(x, a), b);









newButton(dict) := (
  regional(res, keys);
  keys = keys(dict);
  res = {
    "position":   if(contains(keys, "position"), dict.position, [0, 0]),
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
  res.updateShapes :=(
    res.shape1 = roundedrectangle(res.position + 0.5 * (-res.size.x, res.size.y), res.size.x, res.size.y, res.corner);
    res.shape2 = roundedrectangle(res.position + 0.5 * (-res.size.x, res.size.y) + (0, -0.2), res.size.x, res.size.y, res.corner);
  );
  res.updateShapes;
  res.draw := (
    if(self().visible,
      if(self().pressed,
          fill(self().shape2, color -> (self().colors)_1);
          drawtext(self().position + (0, -0.5 * self().labelSize / 35) + (0, -0.2), self().label, align->"mid", size->self().labelSize, color->self().labelColor, bold->true, family->self().fontFamily);
      , // else //
          fill(self().shape2, color -> (self().colors)_3);
          fill(self().shape1, color -> (self().colors)_2);
          drawtext(self().position + (0, -0.5 * self().labelSize / 35), self().label, align->"mid", size->self().labelSize, color->self().labelColor, bold->true, family->self().fontFamily);
      );
    );
  );
  res.onDown := ();
  res.onDrag := ();
  res.onUp := ();
  res.handleInput := (
    if(self().active, 
      if(mouseScriptIndicator == "Down" & mouseInButton(self()),
        self().pressed = if(self().isToggle, !self().pressed, true);
        self().onDown;
      );

      if(mouseScriptIndicator == "Up", 
        if(mouseInButton(self()), self().onUp);
        if(!self().isToggle, self().pressed = false);
      );
    );
  );


  uiCollection = uiCollection :> res;

  res;
);


newSlider(dict) := (
  regional(res, keys);
  keys = keys(dict);
  res = {
    "position":          if(contains(keys, "position"), dict.position, [0,0]),
    "length":            if(contains(keys, "length"), dict.length, 10),
    "size":              if(contains(keys, "size"), dict.size, 0.8),
    "vertical":          if(contains(keys, "vertical"), dict.vertical, false),
    "color":             if(contains(keys, "color"), dict.color, 0.5 * (1,1,1)),
    "value":             if(contains(keys, "value"), dict.value, 0.5),
    "handleSize":        if(contains(keys, "handleSize"), dict.handleSize, 0.7),
    "handleOutlineSize": if(contains(keys, "handleOutlineSize"), dict.handleOutlineSize, 5),
    "handleCorner":      if(contains(keys, "handleCorner"), dict.handleCorner, 0.3),
    "handleColor":       if(contains(keys, "handleColor"), dict.handleColor, (1,1,1)),
    "dragging":          if(contains(keys, "dragging"), dict.dragging, false),
    "fontFamily":        if(contains(keys, "fontFamily"), dict.fontFamily, 0),
    "active":            if(contains(keys, "active"), dict.active, true),
    "visible":           if(contains(keys, "visible"), dict.visible, true)
  };
  res.updateShapes := (
    res.endPoints = [res.position, res.position + if(res.vertical, [0, res.length], [res.length, 0])];
  );
  res.updateShapes;
    
  res.draw := (
    regional(handlePos, handleShape);
    if(self().visible,
      draw(self().endPoints, size -> self().size * screenresolution(), color -> self().color);
      handlePos = lerp(self().endPoints_1, self().endPoints_2, self().value);
      handleShape = if(length(self().handleSize) == 2,
        roundedrectangle(handlePos + 0.5 * (-self().handleSize_1, self().handleSize_2), self().handleSize_1, self().handleSize_2, self().handleCorner);
      , // else //
        circle(handlePos, self().handleSize);
      );
      fill(handleShape, color -> self().handleColor);
      draw(handleShape, size -> self().handleOutlineSize, color -> self().color);
    );
  );

  res.onDown := ();
  res.onDrag := ();
  res.onUp := ();
  res.onValueChange := ();
  res.updateValue := (
    if(self().dragging,
      self().value = if(self().vertical,
        clamp(inverseLerp((self().endPoints_1).y, (self().endPoints_2).y, mouse().y), 0, 1);
      , // else //
        clamp(inverseLerp((self().endPoints_1).x, (self().endPoints_2).x, mouse().x), 0, 1);
      );
      self().onValueChange;
    );    
  );
  res.handleInput := (
    regional(dist);
    if(self().active,
      if(mouseScriptIndicator == "Down",
        dist = if(length(self().handleSize) == 2, 
          0.5 * if(self().vertical, self().handleSize_1, self().handleSize_2);
          , // else //
            self().handleSize;
        );
        if(capsuleSDF(mouse().xy, self().endPoints_1, self().endPoints_2, dist) <= 0,
          self().dragging = true;
          self().updateValue;
          self().onDown;
        );
      ,if(mouseScriptIndicator == "Drag",
        self().updateValue;
        self().onDrag;
      ,if(mouseScriptIndicator == "Up",
        self().updateValue;
        self().onUp;
        self().dragging = false;
      )))
    );
  );

  uiCollection = uiCollection :> res;

  res;
);

newSelector(dict) := (
  regional(res, keys);
  keys = keys(dict);
  res = {
    "position":          if(contains(keys, "position"), dict.position, [0,0]),
    "gapSize":           if(contains(keys, "gapSize"), dict.gapSize, 2),
    "vertical":          if(contains(keys, "vertical"), dict.vertical, false),
    "options":           if(contains(keys, "options"), dict.options, ["A", "B", "C"]),
    "index":             if(contains(keys, "index"), dict.index, 1),
    "size":              if(contains(keys, "size"), dict.size, 0.9),
    "color":             if(contains(keys, "color"), dict.color, 0.5 * (1,1,1)),
    "handleColor":       if(contains(keys, "handleColor"), dict.handleColor, (1,1,1)),
    "textColor":         if(contains(keys, "textColor"), dict.textColor, (0,0,0)),
    "textSize":          if(contains(keys, "textSize"), dict.textSize, 20),
    "handleSize":        if(contains(keys, "handleSize"), dict.handleSize, 0.7),
    "handleOutlineSize": if(contains(keys, "handleOutlineSize"), dict.handleOutlineSize, 5),
    "handleCorner":      if(contains(keys, "handleCorner"), dict.handleCorner, 0.3),
    "fontFamily":        if(contains(keys, "fontFamily"), dict.fontFamily, 0),
    "dragging":          if(contains(keys, "dragging"), dict.dragging, false),
    "active":            if(contains(keys, "active"), dict.active, true),
    "visible":           if(contains(keys, "visible"), dict.visible, true),
    "endGap":            if(contains(keys, "endGap"), dict.endGap, 0.3)
  };
  res.updateShapes := (
    res.endPoints = [res.position, res.position + if(res.vertical, [0, res.gapSize * (length(res.options) - 1 + 2 * res.endGap)], [res.gapSize * (length(res.options) - 1 + 2 * res.endGap), 0])];
  );
  res.updateShapes;


  res.draw := (
    if(self().visible,
      regional(handlePos, handleShape);
      draw(self().endPoints, size -> self().size * screenresolution(), color -> self().color);
      handlePos = lerp(self().endPoints_1, self().endPoints_2, self().index, 1 - self().endGap, length(self().options) + self().endGap);
      handleShape = if(length(self().handleSize) == 2,
        roundedrectangle(handlePos + 0.5 * (-self().handleSize_1, self().handleSize_2), self().handleSize_1, self().handleSize_2, self().handleCorner);
      , // else //
        circle(handlePos, self().handleSize);
      );
      fill(handleShape, color -> self().handleColor);
      draw(handleShape, size -> self().handleOutlineSize, color -> self().color);
      
      forall(1..length(self().options),
        drawtext(lerp(self().endPoints_1, self().endPoints_2, #, 1 - self().endGap, length(self().options) + self().endGap) + (0, -0.013 * self().textSize), self().options_#, size -> self().textSize, align -> "mid", color -> self().textColor, family -> self().fontFamily, outlinewidth -> 0.3 * self().textSize, outlinecolor -> self().handleColor);
      );

    );
  );

  res.onDown := ();
  res.onDrag := ();
  res.onUp := ();
  res.onIndexChange := ();
  res.updateIndex := (
    if(self().dragging,
      self().index = sort(1..length(self().options),
        dist(mouse().xy, lerp(self().endPoints_1, self().endPoints_2, #, 1, length(self().options)));
      )_1;
      self().onIndexChange;
    );
  );
  res.handleInput := (
    regional(dist);
    if(self().active,
      if(mouseScriptIndicator == "Down",
        dist = if(length(self().handleSize) == 2,
          0.5 * if(self().vertical, self().handleSize_1, self().handleSize_2);
          , // else //
            self().handleSize;
        );
        if(capsuleSDF(mouse().xy, self().endPoints_1, self().endPoints_2, dist) <= 0,
          self().dragging = true;
          self().updateIndex;
          self().onDown;
        );
      ,if(mouseScriptIndicator == "Drag",
        self().updateIndex;
        self().onDrag;
      ,if(mouseScriptIndicator == "Up",
        self().updateIndex;
        self().onUp;
        self().dragging = false;
      )));
    );
  );


  

  uiCollection = uiCollection :> res;

  res;
);

newToggle(dict) := (
  regional(res, keys);
  keys = keys(dict);
  res = {
    "position":       if(contains(keys, "position"), dict.position, [0,0]),
    "size":           if(contains(keys, "size"), dict.size, 2),
    "outlineSizes":   if(contains(keys, "outlineSizes"), dict.size, [1.5, 10]),
    "label":          if(contains(keys, "label"), dict.label, "Toggle"),
    "labelSize":      if(contains(keys, "labelSize"), dict.labelSize, 20),
    "fillColor":      if(contains(keys, "fillColor"), dict.fillColor, (1,1,1)),
    "outlineColors":  if(contains(keys, "outlineColors"), dict.outlineColors, [(0,0,0), (0,1,0)]),
    "labelColor":     if(contains(keys, "labelColor"), dict.labelColor, (0,0,0)),
    "pressed":        if(contains(keys, "pressed"), dict.pressed, false),
    "fontFamily":     if(contains(keys, "fontFamily"), dict.fontFamily, 0),
    "active":         if(contains(keys, "active"), dict.active, true),
    "visible":        if(contains(keys, "visible"), dict.visible, true),
    "corner":         if(contains(keys, "corner"), dict.corner, 0.5)
  };
  res.updateShapes := (
    res.shape = if(length(res.size) == 2,
      roundedrectangle(res.position + 0.5 * (-res.size_1, res.size_2), res.size_1, res.size_2, res.corner);
    , // else //
      circle(res.position, res.size);
    );
  );
  res.updateShapes;

  res.draw := (
    if(self().visible,
      fill(self().shape, color -> self().fillColor);
      draw(self().shape, size -> self().outlineSizes_(if(self().pressed, 2, 1)), color -> self().outlineColors_(if(self().pressed, 2, 1)));
      drawtext(self().position + [0, -0.013 * self().labelSize], self().label, size -> self().labelSize, color -> self().labelColor, family -> self().fontFamily, align -> "mid");
    );
  );
  
  res.onDown := ();
  
  res.handleInput := (
    if(self().active,
      if(mouseScriptIndicator == "Down" & if(length(self().size) == 2, pointInRect(mouse().xy, expandRect(self().position, self().size_1, self().size_2, 5)), dist(mouse().xy, self().position) < self().size),
        self().pressed = !self().pressed;
        self().onDown;
      );
    );
  );

  uiCollection = uiCollection :> res;

  res;
);
















// OLD STUFF BELOW


/*




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
testButtonA.label = "Button";
testButtonA.corner = 0.3;
testButtonA.position = screenbounds()_1.xy + [3, -2];

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


*/