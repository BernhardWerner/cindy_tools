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
screenMouse() := [(mouse().x - canvasLeft) / canvasWidth, (mouse().y - canvasBottom) / canvasHeight];



strokeSampleRate = 256;
texDelimiters = ["@", "/"];
integralResolution = 3;




arrowTipAngle = pi/ 6;
arrowTip(tipPos, dir, size) := (
    if(abs(dir) > 0, dir = dir / abs(dir));

    [
        tipPos - size * rotation(arrowTipAngle) * dir,
        tipPos,
        tipPos - size * rotation(-arrowTipAngle) * dir
    ];		
);



sampleCircle(rad, angle) := apply(0..strokeSampleRate - 1, rad * [cos(angle * # / (strokeSampleRate - 1)), sin(angle * # / (strokeSampleRate - 1))]);
sampleCircle(rad, startAngle, endAngle) := apply(0..strokeSampleRate - 1, rad * [cos(startAngle + (endAngle - startAngle) * # / (strokeSampleRate - 1)), sin(startAngle + (endAngle - startAngle) * # / (strokeSampleRate - 1))]);
sampleCircle(rad) := sampleCircle(rad, 2*pi);


roundedRectangleStroke(center, w, h, cornerRadius) := (
    regional(corners);

    corners = [];
    corners = corners :> apply(sampleCircle(cornerRadius, 0.5 * pi, pi), # + center + 0.5 * [-w, h] + cornerRadius * [1, -1]);
    corners = corners :> apply(sampleCircle(cornerRadius, pi, 1.5 * pi), # + center + 0.5 * [-w, -h] + cornerRadius * [1, 1]);
    corners = corners :> apply(sampleCircle(cornerRadius, 1.5 * pi, 2 * pi), # + center + 0.5 * [w, -h] + cornerRadius * [-1, 1]);
    corners = corners :> apply(sampleCircle(cornerRadius, 0, 0.5 * pi), # + center + 0.5 * [w, h] + cornerRadius * [-1, -1]);
    

    resample(resample(corners_4_(-1) <: flatten(corners)));
);





// ************************************************************************************************
// Creates stroke around a polygon.
// ************************************************************************************************
samplePolygonFREE(poly, nop, closed) := (
    regional(pairs, dists, totalDist, effectiveNumber, splitNumbers, stepSize, index, sr);
    
    if(closed, 
        poly = poly :> poly_1;
    );
    
    sr = if(length(poly) == 2, strokeSampleRate, nop);
    
    pairs = consecutive(poly);
    
    dists = apply(pairs, dist(#_1, #_2));
    totalDist = sum(dists);
    
    effectiveNumber = sr - length(poly);

    splitNumbers = apply(dists, floor((sr - 1) * # / totalDist));


    
    if(sum(splitNumbers) < effectiveNumber,
        forall(1..effectiveNumber - sum(splitNumbers),
            index = randomChoose(1..length(splitNumbers));
            splitNumbers_index = splitNumbers_index + 1;
        );
    );
    if(sum(splitNumbers) > effectiveNumber,
        forall(1..sum(splitNumbers) - effectiveNumber,
            index = randomChoose(1..length(splitNumbers));
            splitNumbers_index = splitNumbers_index - 1;
        );
    );


    flatten(apply(1..length(pairs), pop(subDivideSegment(pairs_#_1, pairs_#_2, splitNumbers_# + 2)) )) :> poly_(-1);

);
samplePolygonFREE(poly, nop) :=	samplePolygonFREE(poly, nop, true);

samplePolygon(poly) := samplePolygonFREE(poly, strokeSampleRate);
samplePolygon(poly, closed) := samplePolygonFREE(poly, strokeSampleRate, closed);




sign(x) := if(x > 0, 1, if(x < 0, -1, 0));

animatePolygon(vertices, t) := (
    regional(n, counter, cummulativeLengths, totalLength, cummulativeTimes, endPoint);

    n = length(vertices);
    cummulativeLengths = [0];
    forall(1..n-1,
        cummulativeLengths = cummulativeLengths :> cummulativeLengths_(-1) + dist(vertices_#, vertices_(#+1));
    );
    totalLength = cummulativeLengths_(-1);
    cummulativeTimes = cummulativeLengths / totalLength;

    counter = sum(apply(cummulativeTimes, max(0, sign(t - #))) );

    if(counter == 0,
        [];
    , // else //
        endPoint = lerp(vertices_counter, vertices_(counter + 1), t, cummulativeTimes_counter, cummulativeTimes_(counter + 1));
        vertices_(1..counter) :> endPoint;
    );
);









// ************************************************************************************************
// Resampling via centripetal Catmull-Rom splines.
// ************************************************************************************************
resample(stroke, nop) := sampleCatmullRomSplineFREE(stroke, nop);
resample(stroke) := sampleCatmullRomSplineFREE(stroke, strokeSampleRate);




// ************************************************************************************************
// Creates stroke as Bezier curves.
// ************************************************************************************************
bezier(controls, t) := (
    regional(n);

    n = length(controls);

    if(n == 1,
        controls_1;
    , // else //
        (1 - t) * bezier(pop(controls), t) + t * bezier(bite(controls), t);
    );
);



// ************************************************************************************************
// Discrete derivative of a discrete curve
// ************************************************************************************************
derive(curve) := apply(consecutive(curve), #_2 - #_1);


// ************************************************************************************************
// Creates stroke as Catmull-Rom curves.
// ************************************************************************************************
catmullRom(controls, alpha, t) := (
    regional(a, b, c, p, q, knot1, knot2, knot3, knot4);

    knot1 = 0;
    knot2 = knot1 + pow(dist(controls_2, controls_1), alpha);
    knot3 = knot2 + pow(dist(controls_3, controls_2), alpha);
    knot4 = knot3 + pow(dist(controls_4, controls_3), alpha);
    
    t = lerp(knot2, knot3, t);

    a = lerp(controls_1, controls_2, t, knot1, knot2);
    b = lerp(controls_2, controls_3, t, knot2, knot3);
    c = lerp(controls_3, controls_4, t, knot3, knot4);

    p = lerp(a, b, t, knot1, knot3);
    q = lerp(b, c, t, knot2, knot4);

    lerp(p, q, t, knot2, knot3);
);




sampleCatmullRomCurve(controls, alpha) := (
    regional(t);
    apply(0..strokeSampleRate - 1, 
        t = # / (strokeSampleRate - 1);

        catmullRom(controls, alpha, t);
    );
);
sampleCatmullRomCurve(controls) := sampleCatmullRomCurve(controls, 0.5);
        
sampleCatmullRomSplineGeneralFREE(points, alpha, nop) := (
    regional(dists, traj, before, after, cutTimes, piece, controls, t);

    dists    = apply(derive(points), abs(#));
    traj     = sum(dists);
    before   = 2 * points_1    - points_2;
    after    = 2 * points_(-1) - points_(-2);
    cutTimes = 0 <: apply(1..(length(dists) - 1), sum(dists_(1..#))) / traj;
  
    apply(0..(nop - 1), i,
      piece = select(1..(length(points) - 1), cutTimes_# * (nop - 1) <= i)_(-1);
  
    
      if(piece == 1,
        controls = [before, points_1, points_2, points_3];
        t = i / (nop - 1) * traj / dists_1;
      ,if(piece == length(points) - 1,
        controls = [points_(-3), points_(-2), points_(-1), after];
        t = (i / (nop - 1) - cutTimes_(-1)) * traj / dists_(-1);
      , // else //
        controls = [points_(piece - 1), points_(piece), points_(piece + 1), points_(piece + 2)];
        t = (i / (nop - 1) - cutTimes_piece) * traj / dists_piece;
      ));

      catmullRom(controls, alpha, t);
    );
);
sampleCatmullRomSplineGeneral(points, alpha) := sampleCatmullRomSplineGeneralFREE(points, alpha, strokeSampleRate);
sampleCatmullRomSplineFREE(points, nop)      := sampleCatmullRomSplineGeneralFREE(points, 0.5, nop);
sampleCatmullRomSpline(points)               := sampleCatmullRomSplineGeneralFREE(points, 0.5, strokeSampleRate);


subdivideSegment(p, q, n) := apply(1..n, lerp(p, q, #, 1, n));






// *************************************************************************************************
// Sorts a list randomly.
// *************************************************************************************************
randomSort(list) := (
    regional(l, temp, i);

    l = length(list);

    while(l > 0,
        i = randomint(l) + 1;

        temp = list_l;
        list_l = list_i;
        list_i = temp;
        l = l - 1;
    );

    list;
);



// *************************************************************************************************
// Chooses randomly k elements of a list.
// *************************************************************************************************
randomChoose(list, k) := (
        regional(res, i);

        if(k > length(list),
            randomSort(list);
        , // else //
            res = [];
            forall(1..k,
                i = randomint(length(list)) + 1;
                res = res :> list_i;
                list = remove(list, i);
            );

            res;
        );
);

randomChoose(list) := randomChoose(list, 1)_1;




pop(list) := list_(1..(length(list) - 1));
pop(list, i) := list_(1..(length(list) - i));




bite(list, i) := list_((i + 1)..length(list));
bite(list) := bite(list, 1);

clamp(x, a, b) := min(max(x, a), b);



// *************************************************************************************************
// Linear interpolation between x and y.
// *************************************************************************************************
lerp(x, y, t) := t * y + (1 - t) * x;
inverseLerp(x, y, p) := if(dist(y, x) != 0, (p - x) / (y - x), 0.5);
// Lerp relative to t in interval [a, b].
lerp(x, y, t, a, b) := lerp(x, y, inverseLerp(a, b, t));

slerp(u, v, t) := (
    regional(angle);

    angle = re(arccos(u * v));

    if(angle <= 0.0001,
        u;
    , // else //
        (sin((1 - t) * angle) * u + sin(t * angle) * v) / sin(angle);
    );
);
inverseSlerp(u, v, w) := (
    regional(result);

    result = abs(min(inverseLerp(arctan2([u.x, u.y]), arctan2([v.x, v.y]), arctan2([w.x, w.y])), inverseLerp(arctan2([u.x, u.y]) + 2*pi, arctan2([v.x, v.y]), arctan2([w.x, w.y]))));

    if(result > 1, 2 - result, result);

);

eerp(x, y, t) := x^(1 - t) * y^t;
inverseEerp(x, y, p) := inverseLerp(log(x), log(y), log(p));




lerp1(x, y, t) := t * y + (1 - t) * x;
lerp2(x, y, t) := t * y + (1 - t) * x;
lerp3(x, y, t) := t * y + (1 - t) * x;
lerp4(x, y, t) := t * y + (1 - t) * x;
inverseLerp1(x, y, p) := (p - x) / (y - x);
inverseLerp2(x, y, p) := abs(p - x) / abs(y - x);
inverseLerp3(x, y, p) := abs(p - x) / abs(y - x);
lerp1(x, y, t, a, b) := lerp1(x, y, inverseLerp1(a, b, t));
lerp2(x, y, t, a, b) := lerp2(x, y, inverseLerp2(a, b, t));
lerp3(x, y, t, a, b) := lerp3(x, y, inverseLerp3(a, b, t));






ang2vec(alpha) := [cos(alpha), sin(alpha)];


// ************************************************************************************************
// Gets the current time from the computer clock converted to seconds.
// ************************************************************************************************
computerSeconds() := (
    regional(actualTime);

    actualTime = time();

    actualTime_1 * 3600 + actualTime_2 * 60 + actualTime_3 + actualTime_4 * 0.001;
);


currentTimeBOW = 0;
scriptStartTimeBOW = 0;

// ************************************************************************************************
// Sets up time-keeping variables. Will be automatically called when included.
// Has to be called together with playanimation()!
// ************************************************************************************************
setupTime() := (
    currentTimeBOW = computerSeconds();
    scriptStartTimeBOW = currentTimeBOW;
);
now() := computerSeconds() - scriptStartTimeBOW;

// ************************************************************************************************
// Returns the duration ofthe last frame/tick in seconds.
// Needs to run on every frame!
// ************************************************************************************************
deltaTime() := (
    regional(result);

    result = computerSeconds() - currentTimeBOW;
    currentTimeBOW = computerSeconds();

    result;
);




timeOffset(t, a, b) := clamp(inverseLerp(a, b, t), 0, 1);

stepSignal(t, a, b, c, d) := clamp(min(inverseLerp(a, b, t), inverseLerp(d, c, t)), 0, 1);

smoothStep(x) := x * x * (3 - 2 * x);
smoothStep(x, a, b) := smoothStep(inverseLerp(a, b, clamp(x, a, b)));

triangleSignal(t, a, b) := max(0, 1 - 2 * abs((t - 0.5 * (a + b)) / (b - a)));
triangleSignal(t) := triangleSignal(t, 0, 1);


// ************************************************************************************************
// Easing functions.
// ************************************************************************************************
easeInSine(x)        := 1 - cos((x * pi) / 2);
easeOutSine(x)       := sin((x * pi) / 2);
easeInOutSine(x)     := -(cos(pi * x) - 1) / 2;

easeInQuad(x)        := x^2;
easeOutQuad(x)       := 1 - (1 - x)^2;
easeInOutQuad(x)     := if(x < 0.5, 2 * x^2, 1 - (-2 * x + 2)^2 / 2);
   
easeInCubic(x)       := x^3;
easeOutCubic(x)      := 1 - (1 - x)^3;
easeInOutCubic(x)    := if( x < 0.5, 4 * x^3, 1 - (-2 * x + 2)^3 / 2);
   
easeInQuart(x)       := x^4;
easeOutQuart(x)      := 1 - (1 - x)^4;
easeInOutQuart(x)    := if(x < 0.5, 8 * x^4, 1 - (-2 * x + 2)^4 / 2);
   
easeInQuint(x)       := x^5;
easeOutQuint(x)      := 1 - (1 - x)^5;
easeInOutQuint(x)    := if(x < 0.5, 16 * x^5, 1 - (-2 * x + 2)^5 / 2);

easeInExpo(x)        := if(x == 0, 0, 2^(10 * x - 10));
easeOutExpo(x)       := if(x == 1, 1, 1 - 2^(-10 * x));
easeInOutExpo(x)     := if(x == 0, 0, if(x == 1, 1, if(x < 0.5, 2^(20 * x - 10) / 2, (2 - 2^(-20 * x + 10)) / 2)));

easeInCirc(x)        := 1 - sqrt(1 - x^2);
easeOutCirc(x)       := sqrt(1 - (x - 1)^2);
easeInOutCirc(x)     := if(x < 0.5, (1 - sqrt(1 - 4 * x^2)) / 2, (sqrt(1 - (-2 * x + 2)^2) + 1) / 2);

easeInBack(x)        := 2.70158 * x^3 - 1.70158 * x^2;
easeOutBack(x)       := 1 - easeInBack(1 - x);
easeInOutBack(x)     := if(x < 0.5, 4 * x^2 * ((1.70158 * 1.525 + 1) * 2 * x - 1.70158 * 1.525) / 2, ((2 * x - 2)^2 * ((1.70158 * 1.525 + 1) * (2 * x - 2) + 1.70158 * 1.525) + 2) / 2);

easeInElastic(x)     := if(x == 0, 0, if(x == 1, 1, -2^(10 * x - 10) * sin(2 * pi / 3 * (10 * x - 10.75))));
easeOutElastic(x)    := 1 - easeInElastic(1 - x);
easeInOutElastic(x)  := if(x == 0, 0, if(x == 1, 1, if(x < 0.5, -2^(20 * x - 10) * sin(4 * pi / 9 * (20 * x - 11.125)) / 2, 2^(-20 * x + 10) * sin(4 * pi / 9 * (20 * x - 11.125)) / 2 + 1)));



// ************************************************************************************************
// Basic animation functionlity.
// ************************************************************************************************

setupAnimationTrack(s, e) := (
    res = {
        "start":    s,
        "end":      e,
        "duration": e - s,
        "timeLeft": e - s,
        //"progress": 0,
        //"running":  true,
        "looping":  false
    };
    res.progress := 1 - self().timeLeft / self().duration;
    res.timeElapsed := self().duration - self().timeLeft;

    res;
); 


setupMultiAnimationTracks(start, listOfDurations, pause) := (
    regional(t, res);

    res = [];
    t = start;
    forall(listOfDurations, d,
        res = res :> setupAnimationTrack(t, t + d);
        t = t + d + pause;
    );

    res;
);

// times must be of the form [startPause, duration 1, endPause 1, duration 2, endPause 2, ...]
setupMultiAnimationTracks(times) := (
    regional(startPause, durations, endPauses, n, res, start);

    n = (length(times) - 1) / 2;
    startPause = times_1;
    durations = apply(1..n, times_(2 * #));
    endPauses = apply(1..n, times_(2 * # + 1));

    res = [];

    forall(1..n,
        start = startPause + if(# == 1, 0, sum(durations_(1..#-1)) + sum(endPauses_(1..#-1)););
        res = res :> setupAnimationTrack(start, start + durations_#);
    );

    res;
);




trackStarted(track) := now() >= track.start;
trackEnded(track) := now() > track.end;
trackRunning(track) := and(trackStarted(track), not(trackEnded(track)));




// Now with absolute time
updateAnimationTrack(track) := (
    regional(timeToEnd);

    timeToEnd = track.end - now();
    if(track.looping,
        track.timeLeft = mod(timeToEnd, track.duration);
    , // else //
        track.timeLeft = clamp(timeToEnd, 0, track.duration);
    );
);





tween(obj, prop, target, time) := (
    obj_prop = lerp(obj_prop, target, time)
);




START = 0;
END = 1;


































fragmentText(string, size, family) := (
    regional(n, result, pixelsize);

    n = length(string);
    result = {
        "size": size,
        "family": family,
        "length": n,
        "characters": [],
        "offsets": []
    };
    pixelsize = 1 / screenresolution();

    if(n > 0,
        result.characters = result.characters :> string_1;
        result.offsets = result.offsets :> 0;

        forall(2..n,
            result.characters = result.characters :> string_#;
            result.offsets = result.offsets :> pixelsize * (pixelsize(sum(string_(1..#)), size -> size, family->family)_1 - pixelsize(string_#, size -> size, family->family)_1);
        );
    );

    result;
);
fragmentText(string, size) := fragmentText(string, size, 0);

fragmentTex(string, size, family) := (
    regional(n, m, pairsOfDelimiters, candidate);

    m = length(string);

    pairsOfDelimiters = [];
    forall(1..m,
        if(string_# == texDelimiters_1, 
            candidate = findMatchingTexDelimiter(string, #);
            if(candidate > 0,
                pairsOfDelimiters = pairsOfDelimiters :> [#, candidate];
            );
        );
    );

    n = length(pairsOfDelimiters);
    string = replace(string, texDelimiters_2, "}");

    {
        "size": size,
        "family": family,
        "length": n,
        "characters": apply(1..n, i, sum(flatten(zip(tokenize(string, texDelimiters_1), apply(1..n, j, "\color{" + if(i == j, "[COLOR_" + j + "][ALPHA_" + j + "]", "#00000000") + "}{") :> "")))),
        "offsets": apply(1..n, 0)
    };
);
fragmentTex(string, size) := fragmentTex(string, size, 0);







fragment(string, size, family) := (
    regional(split, res, bufferWidth, n, chunk);

    split = tokenize(string, "$");
    res = apply(split, s, index,
        if(mod(index, 2) == 0,
            fragmentTex("$" + s + "$", size);
        , // else //
            fragmentText(s, size, family);
        );
    );
    bufferWidth = 0;
    n = length(res);
    if(n > 1,
        forall(2..n, index,
            chunk = if(mod(index, 2) == 1, 
                "$" + replace(replace(split_(index - 1), texDelimiters_1, ""), texDelimiters_2, "") + "$";
            , // else //
                split_(index - 1)
            );
            bufferWidth = bufferWidth + pixelsize(chunk, size -> size, family -> family)_1 / screenresolution();
            res_index.offsets = apply(res_index.offsets, # + bufferWidth);
        );
    );

    res;
);
fragment(string, size) := fragment(string, size, 0);



drawFragments(pos, listOfDicts, time, mode, modifs) := (
    regional(totalLength, customTime, s, e);

    totalLength = sum(apply(listOfDicts, #.length));
    s = 0;
    forall(listOfDicts, dict, index,
        if(index > 1,
            s = s + listOfDicts_(index - 1).length / totalLength;
        );
        e = s + dict.length / totalLength;
        customTime = timeOffset(time, s, e);
        if(mod(index, 2) == 0,
            drawFragmentedTex(pos, dict, customTime, mode, modifs);
        , // else //
            drawFragmentedText(pos, dict, customTime, mode, modifs);
        );
    );

);
drawFragments(pos, listOfDicts, time, mode) := drawFragments(pos, listOfDicts, time, mode, {});














zip(a, b) := transpose([a, b]);
joinStrings(list, symbol) := sum(flatten(zip(list, apply(1..length(list) - 1, symbol) :> "")));


drawFragmentedText(pos, dict, time, mode, modifs) := (
    regional(modifKeys, n, fontHeight, yOffset, alpha, size, hasColorMap, hasAlphaMap, col);

    modifKeys = keys(modifs);
    if(!contains(modifKeys, "color"), modifs.color = (0,0,0));
    if(!contains(modifKeys, "alpha"), modifs.alpha = 1);
    //if(!contains(modifKeys, "family"), modifs.family = 0);
    hasColorMap = contains(modifKeys, "colorMap");
    hasAlphaMap = contains(modifKeys, "alphaMap");

    n = round(lerp(0, dict.length, time));

    fontHeight = pixelsize("M", size -> dict.size);
    fontHeight = fontHeight_2 + fontHeight_3;

    forall(1..n,
        yOffset = 0;
        alpha = 1;
        size = 1;
    
        if(mode == "up",
            if(# == n, 
                customTime = timeOffset(time, (#-1)/dict.length, #/dict.length);
                yOffset = lerp(-0.1 * fontHeight, 0, easeOutCubic(customTime));
                alpha = (customTime);
            );
        );
        if(mode == "down",
        if(# == n, 
            customTime = timeOffset(time, (#-1)/dict.length, #/dict.length);
            yOffset = lerp(0.1 * fontHeight, 0, easeOutCubic(customTime));
            alpha = (customTime);
        );
    );
        if(mode == "pop",
            if(# == n, 
                customTime = timeOffset(time, (#-1)/dict.length, #/dict.length);
                size = easeOutBack(customTime)^2;
                alpha = (customTime);

            );
        );
        col = modifs.color;
        if(hasColorMap,
            forall(modifs.colorMap, entry, 
                if(contains(entry_1, #), col = entry_2);
            );
        );
        if(hasAlphaMap,
            forall(modifs.alphaMap, entry, 
                if(contains(entry_1, #), alpha = alpha * entry_2);
            );
        );
        

        drawtext(pos + [dict.offsets_#, yOffset], dict.characters_#, size -> dict.size * size, color -> col, alpha -> modifs.alpha * alpha, family -> dict.family, outlinewidth -> modifs.outlinewidth, outlinecolor -> modifs.outlinecolor);
    );
);
drawFragmentedText(pos, dict, time, mode) := drawFragmentedText(pos, dict, time, mode, {});




preProcessTex(string) := (
    
);

drawFragmentedTex(pos, dict, time, mode, modifs) := (
    regional(modifKeys, n, fontHeight, yOffset, alpha, size, s, hasColorMap, hasAlphaMap, col);

    modifKeys = keys(modifs);
    if(!contains(modifKeys, "color"), modifs.color = (0,0,0));
    if(!contains(modifKeys, "alpha"), modifs.alpha = 1);
    if(!contains(modifKeys, "outlinewidth"), modifs.outlinewidth = 0);
    if(!contains(modifKeys, "outlinecolor"), modifs.outlinecolor = (0,0,0));

    hasColorMap = contains(modifKeys, "colorMap");
    hasAlphaMap = contains(modifKeys, "alphaMap");

    n = round(lerp(0, dict.length, time));

    fontHeight = pixelsize("M", size -> dict.size);
    fontHeight = fontHeight_2 + fontHeight_3;



    forall(1..n,
        yOffset = 0;
        alpha = 1;
        size = 1;
    
        if(mode == "up",
            if(# == n, 
                customTime = timeOffset(time, (#-1)/dict.length, #/dict.length);
                yOffset = lerp(-0.1 * fontHeight, 0, easeOutCubic(customTime));
                alpha = (customTime);
            );
        );
        if(mode == "down",
            if(# == n, 
                customTime = timeOffset(time, (#-1)/dict.length, #/dict.length);
                yOffset = lerp(0.1 * fontHeight, 0, easeOutCubic(customTime));
                alpha = (customTime);
            );
        );
        
        if(mode == "pop",
            if(# == n, 
                customTime = timeOffset(time, (#-1)/dict.length, #/dict.length);
                size = easeOutBack(customTime)^2;
                alpha = (customTime);

            );
        );

        col = modifs.color;
        if(hasColorMap,
            forall(modifs.colorMap, entry, 
                if(contains(entry_1, #), col = entry_2);
            );
        );
        if(hasAlphaMap,
            forall(modifs.alphaMap, entry, 
                if(contains(entry_1, #), alpha = alpha * entry_2);
            );
        );

        s = dict.characters_#;
        s = replace(s, "[COLOR_" + # + "]", "#" + rgb2hex(col));
        s = replace(s, "[ALPHA_" + # + "]", alpha2hex(modifs.alpha * alpha));


        drawtext(pos + [dict.offsets_#, yOffset], s, size -> dict.size * size, outlinewidth -> modifs.outlinewidth, outlinecolor -> modifs.outlinecolor, family -> dict.family);
    );
);
drawFragmentedTex(pos, dict, time, mode) := drawFragmentedTex(pos, dict, time, mode, {});




frequency(list, x) := length(select(list, # == x));


findin(list, x) := (
    regional(occs);

    occs = select(1..length(list), list_# == x);
    if(length(occs) == 0, 0, occs_1);
);






findMatchingBracket(string, startIndex, bracketA, bracketB) := (
    regional(endIndex, innerCount, foundMatch, n);

    endIndex = 0;
    n = length(string);
    if(startIndex > 0,
        endIndex = startIndex;
        innerCount = 0;
        foundMatch = false;
        while((endIndex < n) & not(foundMatch),
            endIndex = endIndex + 1;
            if(string_endIndex == bracketA, innerCount = innerCount + 1);
            if(string_endIndex == bracketB, 
                innerCount = innerCount - 1;
                if(innerCount <= -1,
                    foundMatch = true;            
                );
            );
        );
    );
    if(foundMatch, endIndex, 0);
);
findMatchingTexDelimiter(string, startIndex) := findMatchingBracket(string, startIndex, texDelimiters_1, texDelimiters_2);




newRect(pos, w, h, a) := (
    regional(res, offset);
    res = {"position": pos, "width": w, "height": h, "anchor": a};
    offset = compass(a);
    res.center = pos + 0.5 * [offset.x * w, offset.y * h];
    res;
);
newRect(pos, w, h) := newRect(pos, w, h, 1);



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



rotation(alpha) := [[cos(alpha), -sin(alpha)], [sin(alpha), cos(alpha)]];


rotate(point, alpha, center) := rotation(alpha) * (point - center) + center;
rotate(vector, alpha) := rotate(vector, alpha, [0,0]);




sampleBezierSpline(spline, sampleRate, strokeResolution) := (
    regional(normalizedSpline, resampledSpline, connectedCurve, totalLength);

    normalizedSpline = apply(spline, curve, apply(curve, #));
    resampledSpline = apply(normalizedSpline, sampleBezierCurve(#, sampleRate));
    connectedCurve = resampledSpline_1_1 <: flatten(apply(resampledSpline, bite(#)));
    totalLength = sum(apply(derive(connectedCurve), abs(#)));
    resample(connectedCurve, totalLength * strokeResolution);
);










bezier(controls, t) := (
    regional(n);

    n = length(controls);

    if(n == 1,
        controls_1;
    , // else //
        (1 - t) * bezier(pop(controls), t) + t * bezier(bite(controls), t);
    );
  );




sampleBezierCurve(controls, n) := (
    regional(t);

    apply(0..n - 1, 
        t = # / (n - 1);

        bezier(controls, t);
    );
);


resample(stroke, nop) := sampleCatmullRomSplineFREE(stroke, nop);
resample(stroke) := sampleCatmullRomSplineFREE(stroke, strokeSampleRate);






fract(x) := x - floor(x);



randomValue(pos) := fract(sin(pos * [12.9898, 78.233]) * 43758.5453123);

randomGradient2D(pos) := (
    regional(a);

    a = randomValue(pos);
    [sin(2 * pi * a), cos(2 * pi * a)]
);



// *************************************************************************************************
// Gives random gradient noise based on a point in the plane.
// *************************************************************************************************
perlinNoise2D(coords) := (
    regional(iPoint, fPoint);
    
    iPoint = [floor(coords.x), floor(coords.y)];
    fPoint = [fract(coords.x), fract(coords.y)];

    0.5 * lerp(
            lerp(
                randomGradient2D(iPoint) * (fPoint), 
                randomGradient2D(iPoint + [1,0]) * (fPoint - [1,0]), 
            smoothstep(fPoint.x)),
            lerp(
                randomGradient2D(iPoint + [0,1]) * (fPoint - [0,1]),
                randomGradient2D(iPoint + [1,1]) * (fPoint - [1,1]),
            smoothstep(fPoint.x)),
        smoothstep(fPoint.y)) + 0.5;
);
perlinNoise2DOctaves(coords) := (
    regional(sum);

    sum = 0;
    repeat(3,
        sum = sum + pow(0.5, # - 1) * perlinNoise2D(pow(2, # - 1) * coords);    
    );

    sum / 1.75
);


rndSeed = 0.123456789;
rnd() := (
    regional(newSeed);

    newSeed = randomValue([63.245986 * rndSeed, 102.334155 * rndSeed]);
    rndSeed = newSeed;

    newSeed;
);











// *************************************************************************************************
// Potential split for Egdod Mark III
// **************************************************************************************************/



const(n, x) := if(n == 0, [], apply(1..n, x));

poissonDiscSampling(rect, d, numberOfPoints, searchThreshold) := (
    regional(oldPoints, hSize, vSize, result, searching, i, j, candidate, candidateValid, rangeA, rangeB, offset);

    hSize = ceil(rect.width / d);
    vSize = ceil(rect.height / d);
    oldPoints = const(vSize, const(hSize, []));

    result = [];
    
    searching = true;
    candidateValid = true;
    numberOfSearches = 0;

    while(and(searching, length(result) < numberOfPoints),
        candidate = [random() * rect.width, random() * rect.height];
        i = floor(candidate.x / d);
        j = floor(candidate.y / d);

        rangeA = max(i - 1, 0)..min(i + 1, hSize - 1);
        rangeB = max(j - 1, 0)..min(j + 1, vSize - 1);
        
        

        forall(rangeA, a, forall(rangeB, b,
            
            forall(oldPoints_(b+1)_(a+1), point,  
                candidateValid = and(candidateValid,
                    (candidate.x - point.x)^2 + (candidate.y - point.y)^2 > d^2;
                );	
            );
        ));

        if(candidateValid,
            oldPoints_(j+1)_(i+1) = oldPoints_(j+1)_(i+1) :> candidate;
            result = result :> candidate;
            numberOfSearches = 0;
        , // else //		
            numberOfSearches = numberOfSearches + 1;
            if(numberOfSearches > searchThreshold,
                searching = false;	
            );
            candidateValid = true;
        );
    );

    offset = [-1, -1] - compass(rect.anchor);

    apply(result, # + rect.position + 0.5 * [offset.x * rect.width, offset.y * rect.height]);
);
poissonDiscSampling(rect, d, numberOfPoints) := poissonDiscSampling(rect, d, numberOfPoints, 32);

