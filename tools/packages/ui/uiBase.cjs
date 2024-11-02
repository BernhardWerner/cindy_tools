 
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




rotation(alpha) := [[cos(alpha), -sin(alpha)], [sin(alpha), cos(alpha)]];


rotate(point, alpha, center) := rotation(alpha) * (point - center) + center;
rotate(vector, alpha) := rotate(vector, alpha, [0,0]);






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
  res.calculateShapes := [
    roundedrectangle(self().position + 0.5 * (-self().size.x, self().size.y), self().size.x, self().size.y, self().corner),
    roundedrectangle(self().position + 0.5 * (-self().size.x, self().size.y) + (0, -0.2), self().size.x, self().size.y, self().corner);
  ];
  
  res.draw := (
    regional(shapes);
    if(self().visible,
      shapes = self().calculateShapes;
      if(self().pressed,
        fill(shapes_2, color -> (self().colors)_1);
        drawtext(self().position + (0, -0.5 * self().labelSize / 35) + (0, -0.2), self().label, align->"mid", size->self().labelSize, color->self().labelColor, bold->true, family->self().fontFamily);
      , // else //
        fill(shapes_2, color -> (self().colors)_3);
        fill(shapes_1, color -> (self().colors)_2);
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
  res.animateValue = res.value;
  
  res.endPoints := [self().position, self().position + if(self().vertical, [0, self().length], [self().length, 0])];
  
  
  res.draw := (
    regional(handlePos, handleShape, endPoints);
    if(self().visible,
      endPoints = self().endPoints;
      draw(endPoints, size -> self().size * screenresolution(), color -> self().color);
      handlePos = lerp(endPoints_1, endPoints_2, self().animateValue);
      handleShape = if(length(self().handleSize) == 2,
        roundedrectangle(handlePos + 0.5 * (-self().handleSize_1, self().handleSize_2), self().handleSize_1, self().handleSize_2, self().handleCorner);
      , // else //
        circle(handlePos, self().handleSize);
      );
      fill(handleShape, color -> self().handleColor);
      draw(handleShape, size -> self().handleOutlineSize, color -> self().color);
    );
  );

  res.animate := (
    self().animateValue = lerp(self().animateValue, self().value, exp(-48 * uiDelta));
  );  

  res.onDown := ();
  res.onDrag := ();
  res.onUp := ();
  res.onValueChange := ();
  res.updateValue := (
    regional(endPoints);
    if(self().dragging,
      endPoints = self().endPoints;
      self().value = if(self().vertical,
        clamp(inverseLerp((endPoints_1).y, (endPoints_2).y, mouse().y), 0, 1);
      , // else //
        clamp(inverseLerp((endPoints_1).x, (endPoints_2).x, mouse().x), 0, 1);
      );
      self().onValueChange;
    );    
  );
  res.handleInput := (
    regional(dist, endPoints);
    if(self().active,
      if(mouseScriptIndicator == "Down",
        dist = if(length(self().handleSize) == 2, 
          0.5 * if(self().vertical, self().handleSize_1, self().handleSize_2);
          , // else //
            self().handleSize;
        );
        endPoints = self().endPoints;
        if(capsuleSDF(mouse(), endPoints_1, endPoints_2, dist) <= 0,
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

newOptionSlider(dict) := (
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
  res.animateIndex = res.index;

  res.endPoints := [self().position, self().position + if(self().vertical, [0, self().gapSize * (length(self().options) - 1 + 2 * self().endGap)], [self().gapSize * (length(self().options) - 1 + 2 * self().endGap), 0])];

  res.draw := (
    if(self().visible,
      regional(handlePos, handleShape, endPoints);
      endPoints = self().endPoints;
      draw(endPoints, size -> self().size * screenresolution(), color -> self().color);
      handlePos = lerp(endPoints_1, endPoints_2, self().animateIndex, 1 - self().endGap, length(self().options) + self().endGap);
      handleShape = if(length(self().handleSize) == 2,
        roundedrectangle(handlePos + 0.5 * (-self().handleSize_1, self().handleSize_2), self().handleSize_1, self().handleSize_2, self().handleCorner);
      , // else //
        circle(handlePos, self().handleSize);
      );
      fill(handleShape, color -> self().handleColor);
      draw(handleShape, size -> self().handleOutlineSize, color -> self().color);
      
      forall(1..length(self().options),
        drawtext(lerp(endPoints_1, endPoints_2, #, 1 - self().endGap, length(self().options) + self().endGap) + (0, -0.013 * self().textSize), self().options_#, size -> self().textSize, align -> "mid", color -> self().textColor, family -> self().fontFamily, outlinewidth -> 7, outlinecolor -> self().handleColor);
      );

    );
  );
  res.animate := (
    self().animateIndex = lerp(self().animateIndex, self().index, exp(-48 * uiDelta));
  );


  res.onDown := ();
  res.onDrag := ();
  res.onUp := ();
  res.onIndexChange := ();
  res.updateIndex := (
    regional(endPoints);
    if(self().dragging,
      endPoints = self().endPoints;
      self().index = sort(1..length(self().options),
        dist(mouse(), lerp(endPoints_1, endPoints_2, #, 1, length(self().options)));
      )_1;
      self().onIndexChange;
    );
  );
  res.handleInput := (
    regional(dist, endPoints);
    if(self().active,
      if(mouseScriptIndicator == "Down",
        dist = if(length(self().handleSize) == 2,
          0.5 * if(self().vertical, self().handleSize_1, self().handleSize_2);
          , // else //
            self().handleSize;
        );
        endPoints = self().endPoints;
        if(capsuleSDF(mouse(), endPoints_1, endPoints_2, dist) <= 0,
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

newSelector(dict) := (
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
  res.shape := if(length(self().size) == 2,
      roundedrectangle(self().position + 0.5 * (-self().size_1, self().size_2), self().size_1, self().size_2, self().corner);
    , // else //
      circle(self().position, self().size);
  );
  

  res.draw := (
    regional(shape);
    if(self().visible,
      shape = self().shape;
      fill(shape, color -> self().fillColor);
      draw(shape, size -> self().outlineSizes_(if(self().pressed, 2, 1)), color -> self().outlineColors_(if(self().pressed, 2, 1)));
      drawtext(self().position + [0, -0.013 * self().labelSize], self().label, size -> self().labelSize, color -> self().labelColor, family -> self().fontFamily, align -> "mid");
    );
  );
  
  res.onDown := ();
  
  res.handleInput := (
    if(self().active,
      if(mouseScriptIndicator == "Down" & if(length(self().size) == 2, pointInRect(mouse(), expandRect(self().position, self().size_1, self().size_2, 5)), dist(mouse(), self().position) < self().size),
        self().pressed = !self().pressed;
        self().onDown;
      );
    );
  );

  uiCollection = uiCollection :> res;

  res;
);




newCheckbox(dict) := (
  regional(res, keys);
  keys = keys(dict);
  res = {
    "position":       if(contains(keys, "position"), dict.position, [0,0]),
    "size":           if(contains(keys, "size"), dict.size, 1.3),
    "outlineSize":    if(contains(keys, "outlineSizes"), dict.size, 3),
    "label":          if(contains(keys, "label"), dict.label, "Checkbox"),
    "labelSize":      if(contains(keys, "labelSize"), dict.labelSize, 20),
    "labelSide":      if(contains(keys, "labelSide"), dict.labelSide, "right"),
    "fillColor":      if(contains(keys, "fillColor"), dict.fillColor, 0.3 * (1,1,1)),
    "outlineColor":   if(contains(keys, "outlineColor"), dict.outlineColor, (0,0,0)),
    "labelColor":     if(contains(keys, "labelColor"), dict.labelColor, (0,0,0)),
    "labelGap":       if(contains(keys, "labelGap"), dict.labelGap, 0.5),
    "pressed":        if(contains(keys, "pressed"), dict.pressed, false),
    "fontFamily":     if(contains(keys, "fontFamily"), dict.fontFamily, 0),
    "active":         if(contains(keys, "active"), dict.active, true),
    "visible":        if(contains(keys, "visible"), dict.visible, true),
    "corner":         if(contains(keys, "corner"), dict.corner, 0.3),
    "includeLabel":   if(contains(keys, "includeLabel"), dict.includeLabel, true),
    "symbol":         if(contains(keys, "symbol"), dict.symbol, "x")
  };
  res.labelSign := if(self().labelSide == "left", -1, 1);
  res.box := roundedrectangle(self().position + 0.5 * (-self().size, self().size), self().size, self().size, self().corner);
  res.aabb := (
    regional(labelExtends, center, width, height);
    if(self().includeLabel,
      labelExtends = pixelsize(self().label, size -> self().labelSize, family -> self().fontFamily) / screenresolution();
      center = self().position + 0.5 * self().labelSign * [self().labelGap + labelExtends_1, 0];
      width = self().labelGap + labelExtends_1 + self().size;
      height = max(self().size, labelExtends_2 + labelExtends_3);
      expandRect(center, width, height, 5);
    , // else //
      expandRect(self().position, self().size, self().size, 5);
    );
  );

  res.draw := (
    if(self().visible,
      if(self().pressed,
        if(self().symbol == "check",
          connect([self().position + (-0.3 * self().size, -0.05 * self().size), self().position + (-0.05 * self().size, -0.3 * self().size), self().position + 0.3 * (self().size, self().size), ], size -> 7, color -> self().fillColor);
        , // else //
          draw(self().position + 0.3 * [-self().size, self().size], self().position + 0.3 * [self().size, -self().size], size -> 7, color -> self().fillColor);
          draw(self().position + 0.3 * [-self().size, -self().size], self().position + 0.3 * [self().size, self().size], size -> 7, color -> self().fillColor);
        );
      );
      draw(self().box, size -> self().outlineSize, color -> self().outlineColor);
      drawtext(self().position + [self().labelSign * (0.5 * self().size + self().labelGap), -0.013 * self().labelSize], self().label, size -> self().labelSize, align -> if(self().labelSide == "left", "right", "left"), color -> self().labelColor, family -> self().fontFamily);

    );
  );

  res.onDown := ();
  res.handleInput := (
    if(self().active,
      if(mouseScriptIndicator == "Down" & pointInRect(mouse(), self().aabb),
        self().pressed = !self().pressed;
        self().onDown;
      );
    );
  );

  uiCollection = uiCollection :> res;

  res;
);



newDropdown(dict) := (
  regional(res, keys);
  keys = keys(dict);
  res = {
    "position":        if(contains(keys, "position"), dict.position, [0,0]),
    "width":           if(contains(keys, "width"), dict.width, 10),
    "lineHeight":      if(contains(keys, "lineHeight"), dict.lineHeight, 1.5),
    "options":         if(contains(keys, "options"), dict.options, ["A", "B", "C"]),
    "index":           if(contains(keys, "index"), dict.index, 1),
    "backColor":       if(contains(keys, "backColor"), dict.backColor, 0.8 * (1,1,1)),
    "frontColor":      if(contains(keys, "frontColor"), dict.frontColor, 0.5 * (1,1,1)),
    "textColor":       if(contains(keys, "textColor"), dict.textColor, 0 * (1,1,1)),
    "textSize":        if(contains(keys, "textSize"), dict.textSize, 20),
    "open":            if(contains(keys, "open"), dict.open, 0),
    "corner":          if(contains(keys, "corner"), dict.corner, 0.3),
    "gutter":          if(contains(keys, "gutter"), dict.gutter, 0.3),
    "active":          if(contains(keys, "active"), dict.active, true),
    "visible":         if(contains(keys, "visible"), dict.visible, true),
    "closeOnSelect":   if(contains(keys, "closeOnSelect"), dict.closeOnSelect, false)
  };
  res.animateOpen = res.open;
  res.animateIndex = res.index;
  res.moveHighlightIndex = res.index;
  //res.animateMoveHighlightIndex = res.index;

  res.optionRect := expandRect(self().position + [0, -self().lineHeight - self().gutter], self().width, self().lineHeight * length(self().options) + self().gutter * (length(self().options) - 1), 7);

  res.draw := (
    regional(height, n, shape, angle, chevron);
    if(self().visible,
      n = length(self().options);
      height = self().lineHeight * (1 + n * self().animateOpen) + self().gutter * n * self().animateOpen;
      shape = roundedrectangle(self().position + 0.5 * self().gutter * [-1,1], self().width + self().gutter, height + self().gutter, self().corner);
      fill(shape, color -> self().backColor);
      //fill(roundedrectangle(self().position, self().width, self().lineHeight, self().corner), color -> self().frontColor, alpha -> 1);
      drawtext(self().position + [1, -0.5 * self().lineHeight - 0.0125 * self().textSize], self().options_(self().index), size -> self().textSize, color -> self().textColor);
      angle = lerp(1.5 * pi, 0.5 * pi, self().animateOpen);
      chevron = apply(-1..1, [cos(2 * pi * # / 3), sin(2 * pi * # / 3)]) :> [-0.1, 0];
      chevron = apply(chevron, 0.2 * self().lineHeight * rotate(#, angle) + self().position + [0.87 * self().width, - 0.5 * self().lineHeight]);
      fillpoly(chevron, color -> self().frontColor);
      drawpoly(chevron, color -> self().frontColor, size -> 3);
      gsave();
      clip(shape);
      /*
      forall(1..n,
        draw(roundedrectangle(self().position + [0, -# * (self().lineHeight) - # * self().gutter], self().width, self().lineHeight, self().corner), color -> self().frontColor, size -> if(# == self().index, 3, 0.5));
      );
      */
      draw(roundedrectangle(self().position + [0, -self().animateIndex * (self().lineHeight) - self().animateIndex * self().gutter], self().width, self().lineHeight, self().corner), color -> self().frontColor, size -> 5);
      if(pointInRect(mouse(), self().optionRect) & self().moveHighlightIndex != self().index,
        draw(roundedrectangle(self().position + [0, -self().moveHighlightIndex * (self().lineHeight) - self().moveHighlightIndex * self().gutter], self().width, self().lineHeight, self().corner), color -> self().frontColor, size -> 3, alpha -> 0.7);
      );
      forall(1..n,
        drawtext(self().position + [1, -(# + 0.5) * self().lineHeight  - # * self().gutter - 0.0125 * self().textSize], self().options_#, size -> self().textSize, color -> self().textColor, alpha -> 0.7);
      );
      grestore();
    );
  );

  res.animate := (
    self().animateOpen = lerp(self().animateOpen, self().open, exp(-96 * uiDelta));
    self().animateIndex = lerp(self().animateIndex, self().index, exp(-96 * uiDelta));
    //self().animateMoveHighlightIndex = lerp(self().animateMoveHighlightIndex, self().moveHighlightIndex, exp(-32 * uiDelta));
  );
  res.onDown := ();
  res.OnIndexChange := ();
  res.handleInput := (
    regional(oldIndex);
    if(self().active,
      if(mouseScriptIndicator == "Down",
        if(pointInRect(mouse(), expandRect(self().position, self().width, self().lineHeight, 7)),
          self().open = 1 - self().open;
        , // else //
          if(self().open == 1,
            forall(1..length(self().options),
              if(pointInRect(mouse(), expandRect(self().position + [0, -# * (self().lineHeight) - # * self().gutter], self().width, self().lineHeight, 7)),
                oldIndex = self().index;
                self().index = #;
                if(oldIndex != self().index, self().OnIndexChange);
                if(self().closeOnSelect, self().open = 0);
              );
            );
          );
        );
      );
      if(mouseScriptIndicator == "Move",
        if((self().open >= 1) & pointInRect(mouse(), self().optionRect),
          self().moveHighlightIndex = sort(1..n, dist(mouse().y, self().position.y - (# + 0.5) * (self().lineHeight) - # * self().gutter))_1;
        );
      );
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
    "outlineSize":    if(contains(keys, "outlineSize"), dict.outlineSize, 3),
    "state":          if(contains(keys, "state"), dict.state, 0),
    "backColor":      if(contains(keys, "backColor"), dict.backColor, 0.7 * (1,1,1)),
    "frontColor":     if(contains(keys, "frontColor"), dict.frontColor, 0.3 * (1,1,1)),
    "active":         if(contains(keys, "active"), dict.active, true),
    "visible":        if(contains(keys, "visible"), dict.visible, true)
  };
  res.animateState = res.state;

  res.draw := (
    regional(pill);
    if(self().visible,
      pill = roundedrectangle(self().position + (-0.5 * self().size, 0.25 * self().size), self().size, 0.5 * self().size, 0.5 * self().size);
      fill(pill, color -> self().backColor);
      fillcircle(self().position + [lerp(-0.25, 0.25, self().animateState) * self().size, 0], 0.25 * self().size, color -> self().frontColor);
      draw(pill, size -> self().outlineSize, color -> self().frontColor);
    );
  );
  res.animate := (
    self().animateState = lerp(self().animateState, self().state, exp(-48 * uiDelta));
  );

  res.onDown := ();
  res.handleInput := (
    if(self().active,
      if(mouseScriptIndicator == "Down" & capsuleSDF(mouse(), self().position + (-0.5 * self().size, 0), self().position + (0.5 * self().size, 0), 0.25 * self().size) <= 0,
        self().state = 1 - self().state;
        self().onDown;
      );
    );
  );


  uiCollection = uiCollection :> res;

  res;
);









/*



drawToggle(obj) := (
  //fillpoly(expandrect(obj.position, obj.size.x, obj.size.y, 5), color -> (0,0,0), alpha -> 0.4);
  drawtext(obj.position + [-2, -0.015 * obj.textSize], obj.labels_1, size -> obj.textSize, color -> (1,1,1), align -> "right");
  drawtext(obj.position + [ 2, -0.015 * obj.textSize], obj.labels_2, size -> obj.textSize, color -> (1,1,1), align -> "left");
  backPill = roundedrectangle(obj.position + [-1, 0.5], 2, 1, 1);
  fill(backPill, color -> sapColor.grey1);
  fillcircle(obj.position + [lerp(-0.5, 0.5, obj.animationState), 0], 0.5, color -> sapColor.white);
  draw(backPill, color -> sapColor.white, size -> 3);
);

catchToggle(obj) := (
  if(pointInPolygon(mouse(), expandrect(obj.position, obj.size.x, obj.size.y, 5)),
    obj.state = 1 - obj.state;
  , // else //
    if(obj.state == 0,
      cameraActive = true;
      currentMousePos = mouse();
      handleCamera();
    );
    if(obj.state == 1,
      pointActive = true;
      handlePoint();
    );
  );
);

*/