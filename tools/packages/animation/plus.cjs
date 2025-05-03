defaultBackgroundColor = [1,1,1];
defaultPointColor = [1,0,0];
defaultLineColor = [0,0,1];
defaultStrokeColor = [0,0,1];
defaultTextColor = [0,0,0];
defaultPointSize = 1;
defaultLineSize = 10;
defaultOutlineSizePixel = 10;
defaultArrowSize = 5;
defaultTextSize = 120;



/**********************************************************************************************************************************************************
CAUTION!
Doesn't work for code variables, i.e. methods.
**********************************************************************************************************************************************************/
copy(dict) := (
    regional(result);

    result = {};
    forall(keys(dict),
        result_# = dict_#;
    );
    result;
);





newPoint(pos, modifs) := (
    regional(res, keys);
    keys = keys(modifs);
    res = {
        "type":              "point",
        "position":          pos,
        "size":              if(contains(keys, "size"), modifs.size, defaultPointSize),
        "color":             if(contains(keys, "color"), modifs.color, defaultPointColor),
        "outlineSize":       if(contains(keys, "outlineSize"), modifs.outlineSize, outlineSizeCindy),
        "outlineColor":      if(contains(keys, "outlineColor"), modifs.outlineColor, defaultBackgroundColor),
        "bounceGrow":        if(contains(keys, "bounceGrow"), modifs.bounceGrow, 0),
        "bounceShrink":      if(contains(keys, "bounceShrink"), modifs.bounceShrink, 0),
        "linearGrow":        if(contains(keys, "linearGrow"), modifs.linearGrow, 0),
        "linearShrink":      if(contains(keys, "linearShrink"), modifs.linearShrink, 0),
        "fadeIn":            if(contains(keys, "fadeIn"), modifs.fadeIn, 1),
        "fadeOut":           if(contains(keys, "fadeOut"), modifs.fadeOut, 0)
    };  

    res.grow := self().linearGrow + easeOutBack(self().bounceGrow) - easeInBack(self().bounceShrink) - self().linearShrink;
    res.alpha := easeOutCirc(self().fadeIn) - easeOutCirc(self().fadeOut);
    res.draw  := (
        if(self().alpha > 0,
            if(self().outlineSize > 0, fillcircle(self().position, (self().size + self().outlineSize) * self().grow, color -> self().outlineColor, alpha -> self().alpha));
            fillcircle(self().position, self().size * self().grow, color -> self().color, alpha -> self().alpha);
        );
    );

    res;
);
newPoint(pos) := newPoint(pos, {});



/**********************************************************************************************************************************************************
arrow types: empty, full, line, jet
**********************************************************************************************************************************************************/


newLine(pointA, pointB, modifs) := (
    regional(res, keys);
    keys = keys(modifs);
    res = {
        "type":              "line",
        "endPoints":         [if(contains(keys(pointA), "position"), pointA.position, pointA), if(contains(keys(pointB), "position"), pointB.position, pointB)],
        "size":              if(contains(keys, "size"), modifs.size, defaultLineSize),
        "color":             if(contains(keys, "color"), modifs.color, defaultLineColor),
        "outlineSize":       if(contains(keys, "outlineSize"), modifs.outlineSize, defaultOutlineSizePixel),
        "outlineColor":      if(contains(keys, "outlineColor"), modifs.outlineColor, defaultBackgroundColor),
        "overshoot":         if(contains(keys, "overshoot"), modifs.overshoot, 0),
        "dashType":          if(contains(keys, "dashType"), modifs.dashType, 0),
        "arrow":             if(contains(keys, "arrow"), modifs.arrow, [false, false]),
        "arrowSize":         if(contains(keys, "arrowSize"), modifs.arrowSize, defaultArrowSize),
        "arrowShape":        if(contains(keys, "arrowShape"), modifs.arrowShape, "line"),
        "fadeIn":            if(contains(keys, "fadeIn"), modifs.fadeIn, 1),
        "fadeOut":           if(contains(keys, "fadeOut"), modifs.fadeOut, 0),
        "ink":               if(contains(keys, "ink"), modifs.ink, 0),
        "erase":             if(contains(keys, "erase"), modifs.erase, 0),
        "reverseInk":        if(contains(keys, "reverseInk"), modifs.ink, 1),
        "reverseErase":      if(contains(keys, "reverseErase"), modifs.erase, 0)
    };  

    res.grow := easeInOutCubic(self().ink) - easeInOutCubic(self().erase);
    res.reverseGrow := easeInOutCubic(self().reverseInk) - easeInOutCubic(self().reverseErase);
    res.scale := (easeOutCirc(self().ink) - easeInCirc(self().erase)) * (easeOutCirc(self().reverseInk) - easeInCirc(self().reverseErase));
    res.alpha := easeOutCirc(self().fadeIn) - easeOutCirc(self().fadeOut);
    res.dist := dist(self().endPoints_1, self().endPoints_2);
    res.draw := (
        if(self().alpha > 0,
            dir = [0, 0];
            if(self().dist > 0, dir = (self().endPoints_2 - self().endPoints_1) / self().dist);
            if(self().outlineSize > 0, 
                if(self().arrow_1 % self().arrow_2,
                    draw(lerp(self().endPoints_2 + self().overshoot * dir, self().endPoints_1 - self().overshoot * dir, self().reverseGrow), lerp(self().endPoints_1 - self().overshoot * dir, self().endPoints_2 + self().overshoot * dir, self().grow), size -> (self().size + 2 * self().outlineSize) * self().scale, color -> self().outlineColor, dashtype -> self().dashType, arrow -> true, arrowshape -> self().arrowShape, arrowsides -> if(self().arrow_1, "<", "") + "==" + if(self().arrow_2, ">", ""), arrowsize -> self().arrowSize * self().grow^2 * self().reverseGrow^2, alpha -> self().alpha);
                , // else //
                    draw(lerp(self().endPoints_2 + self().overshoot * dir, self().endPoints_1 - self().overshoot * dir, self().reverseGrow), lerp(self().endPoints_1 - self().overshoot * dir, self().endPoints_2 + self().overshoot * dir, self().grow), size -> (self().size + 2 * self().outlineSize) * self().scale, color -> self().outlineColor, dashtype -> self().dashType, alpha -> self().alpha);
                );
            );
            if(self().arrow_1 % self().arrow_2,
                draw(lerp(self().endPoints_2 + self().overshoot * dir, self().endPoints_1 - self().overshoot * dir, self().reverseGrow), lerp(self().endPoints_1 - self().overshoot * dir, self().endPoints_2 + self().overshoot * dir, self().grow), size -> self().size * self().scale, color -> self().color, dashtype -> self().dashType, arrow -> true, arrowshape -> self().arrowShape, arrowsides -> if(self().arrow_1, "<", "") + "==" + if(self().arrow_2, ">", ""), arrowsize -> self().arrowSize * self().grow^2 * self().reverseGrow^2, alpha -> self().alpha, arrowposition -> 1);
            , // else //
                draw(lerp(self().endPoints_2 + self().overshoot * dir, self().endPoints_1 - self().overshoot * dir, self().reverseGrow), lerp(self().endPoints_1 - self().overshoot * dir, self().endPoints_2 + self().overshoot * dir, self().grow), size -> self().size * self().scale, color -> self().color, dashtype -> self().dashType, alpha -> self().alpha);
            );

        );
    );

    res;
);
newLine(pointA, pointB) := newLine(pointA, pointB, {});


newStroke(list, modifs) := (
    regional(res, keys);
    keys = keys(modifs);
    res = {
        "type":              "stroke",
        "points":            list,
        "length":            length(list),
        "size":              if(contains(keys, "size"), modifs.size, defaultLineSize),
        "color":             if(contains(keys, "color"), modifs.color, defaultStrokeColor),
        "outlineSize":       if(contains(keys, "outlineSize"), modifs.outlineSize, defaultOutlineSizePixel),
        "outlineColor":      if(contains(keys, "outlineColor"), modifs.outlineColor, defaultBackgroundColor),
        "fillColor":         if(contains(keys, "fillColor"), modifs.fillColor, defaultBackgroundColor),
        "fillAlpha":         if(contains(keys, "fillAlpha"), modifs.fillAlpha, 0),
        "dashType":          if(contains(keys, "dashType"), modifs.dashType, 0),
        "arrow":             if(contains(keys, "arrow"), modifs.arrow, [false, false]),
        "arrowSize":         if(contains(keys, "arrowSize"), modifs.arrowSize, defaultArrowSize),
        "arrowShape":        if(contains(keys, "arrowShape"), modifs.arrowShape, "line"),
        "fadeIn":            if(contains(keys, "fadeIn"), modifs.fadeIn, 1),
        "fadeOut":           if(contains(keys, "fadeOut"), modifs.fadeOut, 0),
        "ink":               if(contains(keys, "ink"), modifs.ink, 0),
        "erase":             if(contains(keys, "erase"), modifs.erase, 0),
        "reverseInk":        if(contains(keys, "reverseInk"), modifs.ink, 1),
        "reverseErase":      if(contains(keys, "reverseErase"), modifs.erase, 0)
    };  

    res.grow := easeInOutCubic(self().ink) - easeInOutCubic(self().erase);
    res.reverseGrow := easeInOutCubic(self().reverseInk) - easeInOutCubic(self().reverseErase);
    res.endIndex := round(lerp(1, self().length, self().grow));
    res.startIndex := round(lerp(self().length, 1, self().reverseGrow));
    res.lut := animatePolygon(self().points, 1 - self().reverseGrow, self().grow);
    res.scale := easeOutCirc(self().ink) - easeInCirc(self().erase);
    res.alpha := easeOutCirc(self().fadeIn) - easeOutCirc(self().fadeOut);
    res.draw := (
        if(self().alpha > 0,
            fillpoly(self().lut, color -> self().fillColor, alpha -> self().fillAlpha * self().alpha * self().grow);
            if(self().size > 0,
                if(self().outlineSize > 0, 
                    connect(self().lut, size -> (self().size + 2 * self().outlineSize) * self().scale, color -> self().outlineColor, dashtype -> self().dashType, alpha -> self().alpha);
                    if(self().endIndex - self().startIndex >= 1,
                        if(self().arrow_1, draw(self().lut_2, self().lut_1, size -> (self().size + 2 * self().outlineSize) * self().scale, color -> self().outlineColor, arrow -> true, arrowshape -> self().arrowShape, arrowsize -> self().arrowSize * self().grow, alpha -> self().alpha));
                        if(self().arrow_2, draw(self().lut_(-2), self().lut_(-1), size -> (self().size + 2 * self().outlineSize) * self().scale, color -> self().outlineColor, arrow -> true, arrowshape -> self().arrowShape, arrowsize -> self().arrowSize * self().grow, alpha -> self().alpha));
                    );
                );
                connect(self().lut, size -> self().size * self().scale, color -> self().color, dashtype -> self().dashType, alpha -> self().alpha);
                if(self().endIndex - self().startIndex >= 1,
                    if(self().arrow_1, draw(self().lut_2, self().lut_1, size -> self().size * self().scale, color -> self().color, arrow -> true, arrowshape -> self().arrowShape, arrowsize -> self().arrowSize * self().grow, alpha -> self().alpha));
                    if(self().arrow_2, draw(self().lut_(-2), self().lut_(-1), size -> self().size * self().scale, color -> self().color, arrow -> true, arrowshape -> self().arrowShape, arrowsize -> self().arrowSize * self().grow, alpha -> self().alpha));
                );
            );
        );
    );

    res;
);
newStroke(list) := newStroke(list, {});



// lerp(x, y, t) := (
//     regional(res);
//     if((isreal(x) % iscomplex(x)) & (isreal(y) % iscomplex(y)),
//         res = (1 - t) * x + t * y;
//     , // else // 
//         if(contains(keys(x), "type") & contains(keys(y), "type"),
//             if(x.type != y.type,
//                 err("lerp: incompatible types");
//             , // else //
//                 if(x.type == "point",
//                     res = newPoint(lerp(x.position, y.position, t), {
//                         "size": lerp(x.size, y.size, t),
//                         "color": lerp(x.color, y.color, t),
//                         "outlineSize": lerp(x.outlineSize, y.outlineSize, t),
//                         "outlineColor": lerp(x.outlineColor, y.outlineColor, t),
//                         "bounceGrow": lerp(x.bounceGrow, y.bounceGrow, t),
//                         "bounceShrink": lerp(x.bounceShrink, y.bounceShrink, t),
//                         "linearGrow": lerp(x.linearGrow, y.linearGrow, t),
//                         "linearShrink": lerp(x.linearShrink, y.linearShrink, t),
//                         "fadeIn": lerp(x.fadeIn, y.fadeIn, t),
//                         "fadeOut": lerp(x.fadeOut, y.fadeOut, t)
//                     });
//                 ,if(x.type == "line",
//                     res = newLine(lerp(x.endPoints, y.endPoints, t), {
//                         "size": lerp(x.size, y.size, t),
//                         "color": lerp(x.color, y.color, t),
//                         "outlineSize": lerp(x.outlineSize, y.outlineSize, t),
//                         "outlineColor": lerp(x.outlineColor, y.outlineColor, t),
//                         "overshoot": lerp(x.overshoot, y.overshoot, t),
//                         "dashType": if(t < 0.5, x.dashType, y.dashType),
//                         "arrow": if(t < 0.5, x.arrow, y.arrow),
//                         "arrowSize": lerp(x.arrowSize, y.arrowSize, t),
//                         "fadeIn": lerp(x.fadeIn, y.fadeIn, t),
//                         "fadeOut": lerp(x.fadeOut, y.fadeOut, t),
//                         "ink": lerp(x.ink, y.ink, t),
//                         "erase": lerp(x.erase, y.erase, t)
//                     });

//                 ,if(x.type == "stroke", 
//                     if(x.length != y.length,
//                         err("lerp: incompatible lengths of strokes");
//                     , // else //
//                         res = newStroke(lerp(x.points, y.points, t), {
//                             "size": lerp(x.size, y.size, t),
//                             "color": lerp(x.color, y.color, t),
//                             "outlineSize": lerp(x.outlineSize, y.outlineSize, t),
//                             "outlineColor": lerp(x.outlineColor, y.outlineColor, t),
//                             "fillColor": lerp(x.fillColor, y.fillColor, t),
//                             "fillAlpha": lerp(x.fillAlpha, y.fillAlpha, t),
//                             "dashType": if(t < 0.5, x.dashType, y.dashType),
//                             "arrow": if(t < 0.5, x.arrow, y.arrow),
//                             "arrowSize": lerp(x.arrowSize, y.arrowSize, t),
//                             "fadeIn": lerp(x.fadeIn, y.fadeIn, t),
//                             "fadeOut": lerp(x.fadeOut, y.fadeOut, t),
//                             "ink": lerp(x.ink, y.ink, t),
//                             "erase": lerp(x.erase, y.erase, t)
//                         });
//                     );
//                 , // else //
//                     err("lerp: unknown type");    
//                 )));
//             );
//         ,if(contains(keys(x), "type"),
//             if(x.type == "point",
//                 res = newPoint(lerp(x.position, y, t), {
//                     "size": x.size,
//                     "color": x.color,
//                     "outlineSize": x.outlineSize,
//                     "outlineColor": x.outlineColor,
//                     "bounceGrow": x.bounceGrow,
//                     "bounceShrink": x.bounceShrink,
//                     "linearGrow": x.linearGrow,
//                     "linearShrink": x.linearShrink,
//                     "fadeIn": x.fadeIn,
//                     "fadeOut": x.fadeOut
//                 });
//             ,if(x.type == "line",
//                 res = newLine(lerp(x.endPoints, y, t), {
//                     "size": x.size,
//                     "color": x.color,
//                     "outlineSize": x.outlineSize,
//                     "outlineColor": x.outlineColor,
//                     "overshoot": x.overshoot,
//                     "dashType": x.dashType,
//                     "arrow": x.arrow,
//                     "arrowSize": x.arrowSize,
//                     "fadeIn": x.fadeIn,
//                     "fadeOut": x.fadeOut,
//                     "ink": x.ink,
//                     "erase": x.erase
//                 });
//             ,if(x.type == "stroke",
//                 res = newStroke(lerp(x.points, y, t), {
//                     "size": x.size,
//                     "color": x.color,
//                     "outlineSize": x.outlineSize,
//                     "outlineColor": x.outlineColor,
//                     "fillColor": x.fillColor,
//                     "fillAlpha": x.fillAlpha,
//                     "dashType": x.dashType,
//                     "arrow": x.arrow,
//                     "arrowSize": x.arrowSize,
//                     "fadeIn": x.fadeIn,
//                     "fadeOut": x.fadeOut,
//                     "ink": x.ink,
//                     "erase": x.erase
//                 });
//             , // else //
//                 err("lerp: unknown type");
//             )));
//         ,if(contains(keys(y), "type"),
//             if(y.type == "point",
//                 res = newPoint(lerp(x, y.position, t), {
//                     "size": y.size,
//                     "color": y.color,
//                     "outlineSize": y.outlineSize,
//                     "outlineColor": y.outlineColor,
//                     "bounceGrow": y.bounceGrow,
//                     "bounceShrink": y.bounceShrink,
//                     "linearGrow": y.linearGrow,
//                     "linearShrink": y.linearShrink,
//                     "fadeIn": y.fadeIn,
//                     "fadeOut": y.fadeOut
//                 });
//             ,if(y.type == "line",
//                 res = newLine(lerp(x, y.endPoints, t), {
//                     "size": y.size,
//                     "color": y.color,
//                     "outlineSize": y.outlineSize,
//                     "outlineColor": y.outlineColor,
//                     "overshoot": y.overshoot,
//                     "dashType": y.dashType,
//                     "arrow": y.arrow,
//                     "arrowSize": y.arrowSize,
//                     "fadeIn": y.fadeIn,
//                     "fadeOut": y.fadeOut,
//                     "ink": y.ink,
//                     "erase": y.erase
//                 });
//             ,if(y.type == "stroke",
//                 res = newStroke(lerp(x, y.points, t), {
//                     "size": y.size,
//                     "color": y.color,
//                     "outlineSize": y.outlineSize,
//                     "outlineColor": y.outlineColor,
//                     "fillColor": y.fillColor,
//                     "fillAlpha": y.fillAlpha,
//                     "dashType": y.dashType,
//                     "arrow": y.arrow,
//                     "arrowSize": y.arrowSize,
//                     "fadeIn": y.fadeIn,
//                     "fadeOut": y.fadeOut,
//                     "ink": y.ink,
//                     "erase": y.erase
//                 });
//             , // else //
//                 err("lerp: unknown type");
//             )));
//         , // else //
//             res = (1 - t) * x + t * y;
//         )));
//     );
//     res;
// );






newText(pos, nykaString, modifs) := (
    regional(res, keys, fragments);
    keys = keys(modifs);
    fragments = fragment(nykaString, if(contains(keys, "size"), modifs.size, defaultTextSize), if(contains(keys, "family"), modifs.family, fam));
    res = {
        "type":              "text",
        "fragments":         fragments,
        "length":            fragmentLength(fragments),
        "position":          pos,
        "color":             if(contains(keys, "color"), modifs.color, defaultTextColor),
        "angle":             if(contains(keys, "angle"), modifs.angle, 0°),
        "alpha":             if(contains(keys, "alpha"), modifs.alpha, 1),
        "align":             if(contains(keys, "align"), modifs.align, "left"),
        "colorMap":          if(contains(keys, "colorMap"), modifs.colorMap, []),
        "alphaMap":          if(contains(keys, "alphaMap"), modifs.alphaMap, []),
        "outlinewidth":      if(contains(keys, "outlineSize"), modifs.outlineSize, 0),
        "outlinecolor":      if(contains(keys, "outlineColor"), modifs.outlineColor, defaultBackgroundColor),
        "mode":             if(contains(keys, "mode"), modifs.mode, "up"),
        "write":             if(contains(keys, "write"), modifs.write, 0),
        "erase":             if(contains(keys, "erase"), modifs.erase, 0),
        "fadeIn":            if(contains(keys, "fadeIn"), modifs.fadeIn, 1),
        "fadeOut":           if(contains(keys, "fadeOut"), modifs.fadeOut, 0),
        "linearFade":        if(contains(keys, "linearFade"), modifs.linearFade, 0)
    };  

    res.grow := self().write - self().erase;
    res.alpha := easeOutCirc(self().fadeIn) - easeOutCirc(self().fadeOut) + self().linearFade;
    res.trueModifs := {
        "color":             self().color,
        "angle":             self().angle,
        "alpha":             self().alpha,
        "align":             self().align,
        "colorMap":          self().colorMap,
        "alphaMap":          self().alphaMap
    };
    res.outlineModifs := {
        "color":             self().outlinecolor,
        "angle":             self().angle,
        "alpha":             self().alpha,
        "outlinewidth":      self().outlinewidth,
        "outlinecolor":      self().outlinecolor,
        "align":             self().align,
        "colorMap":          self().colorMap,
        "alphaMap":          self().alphaMap
    };
    res.draw  := (
        self().trueModifs.alpha = self().alpha;
        self().outlineModifs.alpha = self().alpha;
        if(self().alpha > 0,
            if(self().outlineModifs.outlinewidth > 0,
                drawFragments(self().position, self().fragments, self().grow, self().mode, self().outlineModifs);
            );
            drawFragments(self().position, self().fragments, self().grow, self().mode, self().trueModifs);
        );
    );

    res;
);
newText(pos, nykaString) := newText(pos, nykaString, {});





newNode(pos, modifs) := (
    regional(res, keys);
    keys = keys(modifs);
    res = {
        "position":     pos,
        "size":         if(contains(keys, "size"), modifs.size, [6, 6]),
        "color":        if(contains(keys, "color"), modifs.color, defaultBackgroundColor),
        "fillAlpha":    if(contains(keys, "fillAlpha"), modifs.fillAlpha, 1),
        "label":        if(contains(keys, "label"), modifs.label, ""),
        "labelSize":    if(contains(keys, "labelSize"), modifs.labelSize,  defaultTextSize),
        "labelColor":   if(contains(keys, "labelColor"), modifs.labelColor, (1,1,1)),
        "labelAlpha":   if(contains(keys, "labelAlpha"), modifs.labelAlpha, 1),
        "outlineSize":  if(contains(keys, "outlineSize"), modifs.outlineSize, defaultLineSize),
        "outlineColor": if(contains(keys, "outlineColor"), modifs.outlineColor, defaultTextColor),
        "corner":       if(contains(keys, "corner"), modifs.corner, 3),
        "family":       if(contains(keys, "family"), modifs.family, fam),
        "slideIn":      if(contains(keys, "slideIn"), modifs.slideIn, 0),
        "slideOut":     if(contains(keys, "slideOut"), modifs.slideOut, 0),
        "slideInDir":   if(contains(keys, "slideInDir"), modifs.slideInDir, [0, 1]),
        "slideOutDir":  if(contains(keys, "slideOutDir"), modifs.slideOutDir, [0, -1]),
        "fadeIn":       if(contains(keys, "fadeIn"), modifs.fadeIn, 1),
        "fadeOut":      if(contains(keys, "fadeOut"), modifs.fadeOut, 0)
    };
    res.shape := roundedRectangleShape(self().position + self().offset + 0.5 * (-self().size.x, self().size.y), self().size.x, self().size.y, self().corner);
    res.labelOffset := -0.6 * (pixelsize(self().label, size -> self().labelSize, family -> self().family)_2 - pixelsize(self().label, size -> self().labelSize, family -> self().family)_3) / screenresolution();

    res.alpha := min(easeOutCirc(self().fadeIn), (self().slideIn)) - max(easeOutCirc(self().fadeOut), (self().slideOut));
    res.offset := 0.25 * sum(self().size) * (self().slideOutDir * easeOutCubic(self().slideOut) - self().slideInDir * easeInCubic(1 - self().slideIn));
    
    res.draw := (
        if(self().alpha > 0,
            fill(self().shape, color -> self().color, alpha -> self().alpha * self().fillAlpha);
            if(self().outlineSize > 0, draw(self().shape, size -> self().outlineSize, color -> self().outlineColor, alpha -> self().alpha));
            fillpoly(self().labelBox, color -> sapColor.black, alpha -> self().alpha);
            drawtext(self().position + self().offset + (0, self().labelOffset), self().label, align -> "mid", size -> self().labelSize, color -> self().labelColor, family -> self().family, alpha -> self().labelAlpha * self().alpha);
        );
    );

    res;
);
newNode(pos) := newNode(pos, {});
newBlueNode(pos, modifs) := (
    modifs.color = sapColor.blue1;
    modifs.outlineColor = sapColor.blue3;
    newNode(pos, modifs);
);
newBlueNode(pos) := newBlueNode(pos, {});
newRedNode(pos, modifs) := (
    modifs.color = sapColor.red0;
    modifs.outlineColor = sapColor.red2;
    newNode(pos, modifs);
);
newRedNode(pos) := newRedNode(pos, {});
newGreenNode(pos, modifs) := (
    modifs.color = sapColor.green0;
    modifs.outlineColor = sapColor.green2;
    newNode(pos, modifs);
);
newGreenNode(pos) := newGreenNode(pos, {});
newOrangeNode(pos, modifs) := (
    modifs.color = sapColor.orange0;
    modifs.outlineColor = sapColor.orange2;
    newNode(pos, modifs);
);
newOrangeNode(pos) := newOrangeNode(pos, {});
newVioletNode(pos, modifs) := (
    modifs.color = sapColor.violet0;
    modifs.outlineColor = sapColor.violet2;
    newNode(pos, modifs);
);
newVioletNode(pos) := newVioletNode(pos, {});
newTealNode(pos, modifs) := (
    modifs.color = sapColor.teal0;
    modifs.outlineColor = sapColor.teal2;
    newNode(pos, modifs);
);
newTealNode(pos) := newTealNode(pos, {});
newGrayNode(pos, modifs) := (
    modifs.color = sapColor.grey1;
    modifs.outlineColor = sapColor.grey3;
    newNode(pos, modifs);
);
newGrayNode(pos) := newGrayNode(pos, {});
newDotNode(pos, modifs) := (
    modifs.size = [3, 3];
    modifs.corner = 1.5;
    modifs.outlineSize = 0;
    modifs.color = defaultTextColor;
    newNode(pos, modifs);
);
newDotNode(pos) := newDotNode(pos, {});
newDebugNode(pos) := newNode(pos, {"color": debugColor, "slideIn": END});
newPunctureNode(pos, modifs) := (
    modifs.color = defaultBackgroundColor;
    modifs.outlineColor = defaultBackgroundColor;
    modifs.outlineSize = 0;
    modifs.size = [0.02, 0.02];
    modifs.corner = 0.01;
    newNode(pos, modifs);
);
newPunctureNode(pos) := newPunctureNode(pos, {});
newLabelNode(pos, modifs) := (
    regional(keys);

    keys = keys(modifs);

    modifs.fillAlpha = 0;
    modifs.outlineSize = 0;
    modifs.size = if(contains(keys, "size"), modifs.size, [4, 4]);
    modifs.corner = if(contains(keys, "corner"), modifs.corner, 2);
    newNode(pos, modifs);
);
newLabelNode(pos) := newLabelNode(pos, {});





rr2border(size, corner, dir) := (
    regional(a, b, xSign, ySign, d, point, normal);

    if(abs(dir) > 0, dir = dir / abs(dir));
    xSign = sign(dir.x);
    ySign = sign(dir.y);
    dir = [dir.x * xSign, dir.y * ySign];
    

    
    b = 0.5 * size.y - corner;
    if(dir.y * size.x <= 2 * b * dir.x,
        point = 0.5 * size.x * [xSign, ySign * dir.y / dir.x];
        normal = [xSign, 0];
    , // else //;
        a = 0.5 * size.x - corner;
        if(size.y * dir.x <= dir.y * 2 * a,
            point = 0.5 * size.y * [xSign * dir.x / dir.y, ySign];
            normal = [0, ySign];
        , // else //;
            d = [a, b] * dir;
            point = [dir.x, dir.y] * (d + sqrt(d^2 - (a^2 + b^2 - corner^2)));
            normal = point - [a, b];
            normal = normal / abs(normal);
            point = [point.x * xSign, point.y * ySign];
            normal = [normal.x * xSign, normal.y * ySign];
        );
    );

    [point, normal];
);


newEdge(nodeA, nodeB, modifs) := (
    regional(res, d, dir, areNodes, anchorA, anchorB, offsetA, offsetB, keys, uA, uB, normalA, normalB, sampleRate);
    keys = keys(modifs);


    sampleRate = if(contains(keys, "sampleRate"), modifs.sampleRate, 32);
    
    if(!contains(keys, "color"), modifs.color = defaultBackgroundColor);
    if(!contains(keys, "arrow"), modifs.arrow = [false, true]);
    if(!contains(keys, "arrowShape"), modifs.arrowShape = "line");

    offsetA = if(contains(keys, "offsetA"), modifs.offsetA, 0°);
    offsetB = if(contains(keys, "offsetB"), modifs.offsetB, 0°);
    areNodes = [contains(keys(nodeA), "position"), contains(keys(nodeB), "position")];

    dir = nodeB.position - nodeA.position;
    d = abs(dir);
    dir = dir / d;
    uA = rotate(dir, offsetA);
    uB = rotate(-dir, offsetB);
    [anchorA, normalA] = rr2border(nodeA.size, nodeA.corner, uA);
    [anchorB, normalB] = rr2border(nodeB.size, nodeB.corner, uB);

    anchorA = nodeA.position + anchorA + normalA * if(modifs.arrow_1, 0.3, 0);
    anchorB = nodeB.position + anchorB + normalB * if(modifs.arrow_2, 0.3, 0);



    
    res = newStroke(sampleBezierCurve([anchorA, anchorA + uA * d / 3, anchorB + uB * d / 3, anchorB], sampleRate), modifs);
    res.offsetA = offsetA;
    res.offsetB = offsetB;

    res;
);
newEdge(nodeA, nodeB) := newEdge(nodeA, nodeB, {});
newDebugEdge(nodeA, nodeB) := newEdge(nodeA, nodeB, {"color": debugColor, "ink": END});






cindy2shaderBox(p, bl, hs, r1, hr) := (
    regional(res);
    
    res = (p - bl) / hs / r1 * hr;
  
    [floor(res.x), floor(res.y)];
  );
  cindy2shaderBox(p, env) := cindy2shaderBox(p, env.BL, env.hSize, env.ratio_1, env.hRes);
  
  
  
  
  drawShaderBoxGrid(box, modifs) := (
    regional(keys, scale);
  
    keys = keys(modifs);
    if(!contains(keys, "color"), modifs.color = defaultBackgroundColor);
    if(!contains(keys, "baseSize"), modifs.baseSize = 2);
    
    scale = min(1, box.ratio_1 / box.hRes);
    if(scale * modifs.baseSize > 0.15,  
      forall(1..box.hRes-1,
        draw(lerp(box.BL, box.BR, #, 0, box.hRes), lerp(box.TL, box.TR, #, 0, box.hRes), color -> modifs.color, size -> scale * modifs.baseSize);
      );
      forall(1..box.vRes-1,
        draw(lerp(box.BL, box.TL, #, 0, box.vRes), lerp(box.BR, box.TR, #, 0, box.vRes), color -> modifs.color, size -> scale * modifs.baseSize);
      );
    );
    drawpoly([box.BL, box.BR, box.TR, box.TL], color -> modifs.color, size -> scale * modifs.baseSize);
  );
  
  
  
  newShaderBox(position, hSize, ratio, hRes) := (
      regional(res);
  
      res = {
        "position": position,
        "hSize": hSize,
        "ratio": ratio,
        "hRes": hRes,
        "BL": position - 0.5 * hSize * ratio / ratio_1,
        "TR": position + 0.5 * hSize * ratio / ratio_1,
        "vRes": hRes * ratio_2 / ratio_1
      };
      res.TL = [res.BL.x, res.TR.y];
      res.BR = [res.TR.x, res.BL.y];
  
      res;
  );


