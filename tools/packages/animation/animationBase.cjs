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
screenMouse() := [(mouse().x - canvasLeft) / canvasWidth, (mouse().y - canvasBottom) / canvasHeight];



strokeSampleRateEBOW = 64;
texDelimitersEBOW = ["@", "/"];
integralResolutionEBOW = 3;






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





/*
// Needs to run on every frame!
updateAnimationTrack(track, delta) := (
    if(or(
        and(delta > 0, trackStarted(track)),
        and(delta < 0, not(trackEnded(track)))
    ),
        track.timeLeft = track.timeLeft - delta;	
        //track.progress = 1 - track.timeLeft / track.duration;
        if(track.looping,
            track.timeLeft = mod(track.timeLeft, track.duration);
        , // else //
            track.timeLeft = clamp(track.timeLeft, 0, track.duration);
            //track.progress = clamp(track.progress, 0, 1);
        );
    );
);
*/


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








fragmentText(string, size) := (
    regional(n, result, pixelsize);

    n = length(string);
    result = {
        "size": size,
        "length": n,
        "characters": [],
        "offsets": []
    };
    pixelsize = 1/screenresolution();

    if(n > 0,
        result.characters = result.characters :> string_1;
        result.offsets = result.offsets :> 0;

        forall(2..n,
            result.characters = result.characters :> string_#;
            result.offsets = result.offsets :> pixelsize * (pixelsize(sum(string_(1..#)), size -> size)_1 - pixelsize(string_#, size -> size)_1);
        );
    );

    result;
);

fragmentTex(string, size) := (
    regional(n, m, pairsOfDelimiters, candidate);

    m = length(string);

    pairsOfDelimiters = [];
    forall(1..m,
        if(string_# == texDelimitersEBOW_1, 
            candidate = findMatchingTexDelimiter(string, #);
            if(candidate > 0,
                pairsOfDelimiters = pairsOfDelimiters :> [#, candidate];
            );
        );
    );

    n = length(pairsOfDelimiters);
    string = replace(string, texDelimitersEBOW_2, "}");

    {
        "size": size,
        "length": n,
        "characters": apply(1..n, i, sum(flatten(zip(tokenize(string, texDelimitersEBOW_1), apply(1..n, j, "\color{" + if(i == j, "[COLOR_" + j + "][ALPHA_" + j + "]", "#00000000") + "}{") :> "")))),
        "offsets": apply(1..n, 0)
    };

);



zip(a, b) := transpose([a, b]);
joinStrings(list, symbol) := sum(flatten(zip(list, apply(1..length(list) - 1, symbol) :> "")));


drawFragmentedText(pos, dict, time, mode, modifs) := (
    regional(modifKeys, n, fontHeight, yOffset, alpha, size);

    modifKeys = keys(modifs);
    if(!contains(modifKeys, "color"), modifs.color = (0,0,0));
    if(!contains(modifKeys, "alpha"), modifs.alpha = 1);
    if(!contains(modifKeys, "family"), modifs.family = "");

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
                yOffset = lerp(-0.2 * fontHeight, 0, easeOutCubic(customTime));
                alpha = easeOutCirc(customTime);
            );
        );
        if(mode == "down",
        if(# == n, 
            customTime = timeOffset(time, (#-1)/dict.length, #/dict.length);
            yOffset = lerp(0.2 * fontHeight, 0, easeOutCubic(customTime));
            alpha = easeOutCirc(customTime);
        );
    );
        if(mode == "pop",
            if(# == n, 
                customTime = timeOffset(time, (#-1)/dict.length, #/dict.length);
                size = easeOutBack(customTime)^2;
                alpha = (customTime);

            );
        );
        drawtext(pos + [dict.offsets_#, yOffset], dict.characters_#, size->dict.size * size, color->modifs.color, alpha->modifs.alpha * alpha);
    );
);
drawFragmentedText(pos, dict, time, mode) := drawFragmentedText(pos, dict, time, mode, {});




drawFragmentedTex(pos, dict, time, mode, modifs) := (
    regional(modifKeys, n, fontHeight, yOffset, alpha, size, s);

    modifKeys = keys(modifs);
    if(!contains(modifKeys, "color"), modifs.color = (0,0,0));
    if(!contains(modifKeys, "alpha"), modifs.alpha = 1);
    if(!contains(modifKeys, "family"), modifs.family = "");

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
                yOffset = lerp(-0.2 * fontHeight, 0, easeOutCubic(customTime));
                alpha = easeOutCirc(customTime);
            );
        );
        if(mode == "down",
            if(# == n, 
                customTime = timeOffset(time, (#-1)/dict.length, #/dict.length);
                yOffset = lerp(0.2 * fontHeight, 0, easeOutCubic(customTime));
                alpha = easeOutCirc(customTime);
            );
        );
        if(mode == "pop",
            if(# == n, 
                customTime = timeOffset(time, (#-1)/dict.length, #/dict.length);
                size = easeOutBack(customTime)^2;
                alpha = (customTime);

            );
        );
        s = dict.characters_#;
        s = replace(s, "[COLOR_" + # + "]", rgb2hex(modifs.color));
        s = replace(s, "[ALPHA_" + # + "]", alpha2hex(modifs.alpha * alpha));
        drawtext(pos + [dict.offsets_#, yOffset], s, size->dict.size * size);
    );
);
drawFragmentedTex(pos, dict, time, mode) := drawFragmentedTex(pos, dict, time, mode, {});







deca2hexa(digit) := ["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F"]_(digit + 1);

rgb2hex(vec) := (
    regional(a, b);
    vec = round(255 * vec);

    "#" + sum(apply(vec,
        a = mod(#, 16);
        b = (# - a) / 16;
        deca2hexa(b) + deca2hexa(a);
    ));			
);
alpha2hex(x) := (
    regional(a,b);

    x = round(x * 255);
    a = mod(x, 16);
    b = (x - a) / 16;
    deca2hexa(b) + deca2hexa(a);
);






  frequency(list, x) := length(select(list, # == x));









  drawWrappedText(pos, txt, lineLength, lineHeight, size, align, color, family) := (
    regional(lines);

    lines = splitString(txt, lineLength);
    forall(1..length(lines),
        drawtext(pos + [0, -(# - 1) * lineHeight], lines_#, size->size, align->align, color->color, family->family);
    );
);
splitString(string, subLength) := (
    regional(totalSplit, result, candidate);

    totalSplit = tokenize(string, " ");

    result = [""];


    while(length(totalSplit) > 0,
        candidate = result_(-1) + totalSplit_1;
        
        if(length(candidate) <= subLength,
            result_(-1) = candidate + " ";
        , // else //
            result = result :> totalSplit_1 + " ";
        );

        totalSplit = bite(totalSplit);
    );

    result;
);


joinStrings(strings, separator) := (
    regional(result);

    result = strings_1;

    forall(2..length(strings),
        result = result + separator + strings_#;
    );

    result;
);


newLine = "
";

wrapText(string, lineLength) := joinStrings(splitString(string, lineLength), newLine);





findMatchingTexDelimiter(string, startIndex) := (
    regional(endIndex, innerCount, foundMatch, n);

    endIndex = 0;
    n = length(string);
    if(startIndex > 0,
        endIndex = startIndex;
        innerCount = 0;
        foundMatch = false;
        while((endIndex < n) & not(foundMatch),
            endIndex = endIndex + 1;
            if(string_endIndex == texDelimitersEBOW_1, innerCount = innerCount + 1);
            if(string_endIndex == texDelimitersEBOW_2, 
                innerCount = innerCount - 1;
                if(innerCount <= -1,
                    foundMatch = true;            
                );
            );
        );
    );
    if(foundMatch, endIndex, 0);
);



// *************************************************************************************************
// Handles typing effect for LaTeX formulas.
// *************************************************************************************************
convertTexDelimiters(string, buffer) := (
    regional(startIndex, endIndex, innerCount, foundEnd);
    
    startIndex = indexof(string, texDelimitersEBOW_1);
    if(startIndex == 0,
        string;
    , // else //
        endIndex = startIndex;
        innerCount = 0;
        foundEnd = false;
        while(not(foundEnd),
        endIndex = endIndex + 1;
            if(endIndex == length(string),
                foundEnd = true;
            , // else //
                if(string_endIndex == texDelimitersEBOW_1, innerCount = innerCount + 1);
                if(string_endIndex == texDelimitersEBOW_2, 
                innerCount = innerCount - 1;
                if(innerCount == -1,
                    foundEnd = true;            
                );
                );
            )
        );
    
        convertTexDelimiters(
          sum(string_(1..startIndex - 1)) 
        + if(buffer > 0, "", "\phantom{")
        + sum(string_(startIndex + 1 .. endIndex - 1))
        + if(buffer > 0, "", "}") 
        + sum(string_(endIndex + 1 .. length(string)))
        , buffer - 1);
        
    
    );
);
parseTex(string) := apply(0..frequency(tokenize(string, ""), texDelimitersEBOW_1), convertTexDelimiters(string, #));
parseText(string) := "" <: apply(1..length(string), sum(string_(1..#)));
    
stitch(parts) := (
    regional(n, res, ends);
    n = length(parts);
    ends = apply(parts, #_(-1));

    res = parts_1;

    forall(2..n, i,
        res = res ++ bite(apply(parts_i, sum(ends_(1..i-1)) + #));
    );

    res;
);


typeParsedText(list, time) := list_(round(lerp(1, length(list), time)));