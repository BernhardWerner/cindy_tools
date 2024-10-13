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
texDelimitersEBOW = ["@", "€"];
integralResolutionEBOW = 3;




u0022 := unicode("0022");
u2013 := unicode("2013");












sphericalCoordinates(radius, azimuth, polar) := radius * [cos(azimuth) * sin(polar), sin(azimuth) * sin(polar), cos(polar)];




































sinh(x) := 0.5 * (exp(x) - exp(-x));
cosh(x) := 0.5 * (exp(x) + exp(-x));
tanh(x) := (exp(x) - exp(-x)) / (exp(x) + exp(-x));





evalLUTforwards(lut, x) := (
    regional(ins, outs, index, n);

    [ins, outs] = transpose(lut);

    x = clamp(x, ins_1, ins_(-1));

    index = 1;
    n = length(lut);
    forall(2..n-1, if(ins_# <= x, index = #));

    lerp(outs_index, outs_(index + 1), x, ins_index, ins_(index + 1));
);

// Make sure, the LUT is monotone!
evalLUTbackwards(lut, y) := evalLUTforwards(apply(lut, [#.y, #.x]), y);











drawCone3D(base, radius, tip, color, resolution) := (
    regional(dir, aux, orthoA, orthoB);

    dir = tip - base;

    aux = dir + [random(), random(), random()];
    while(aux * dir ~= abs(aux) * abs(dir),
        aux = dir + [random(), 0, 0];
    );

    orthoA = cross(dir, aux);
    orthoB = cross(dir, orthoA);
    orthoA = orthoA / abs(orthoA);
    orthoB = orthoB / abs(orthoB);

    forall(1..resolution,
        fillpoly3d([
            base + radius * sin(2 * pi * # / resolution) * orthoA + radius * cos(2 * pi * # / resolution) * orthoB, 
            base + radius * sin(2 * pi * (# + 1) / resolution) * orthoA + radius * cos(2 * pi * (# + 1) / resolution) * orthoB, 
            tip
        ], color -> color);
    );
    fillpoly3d(apply(1..resolution, base + radius * sin(2 * pi * # / resolution) * orthoA + radius * cos(2 * pi * # / resolution) * orthoB), color -> color);
);
drawCone3D(base, radius, tip, color) := drawCone3D(base, radius, tip, color, 128);


plane3D(x, y, p, size) := (
    x = x / abs(x);
    y = y / abs(y);

    [
        p - size * x - size * y,
        p + size * x - size * y,
        p + size * x + size * y,
        p - size * x + size * y
    ];
);



















drawAxes3D(start, end, rodSize, arrowHeadLength, arrowHeadRadius) := (
    
    draw3d([start,0,0], [end,0,0], color -> sapColor.red2,   size -> rodSize);
    draw3d([0,start,0], [0,end,0], color -> sapColor.green2, size -> rodSize);
    draw3d([0,0,start], [0,0,end], color -> sapColor.blue2,  size -> rodSize);
  
    drawCone3D([end - 0.5 * arrowHeadLength, 0, 0], arrowHeadRadius, [end + 0.5 * arrowHeadLength, 0, 0], sapColor.red2);
    drawCone3D([0, end - 0.5 * arrowHeadLength, 0], arrowHeadRadius, [0, end + 0.5 * arrowHeadLength, 0], sapColor.green2);
    drawCone3D([0, 0, end - 0.5 * arrowHeadLength], arrowHeadRadius, [0, 0, end + 0.5 * arrowHeadLength], sapColor.blue2);
);













// Gives t values such that solutions are lineBase + t * lineDir. Value -10000 has to be interpreted as 'nothing'; is needed for CindyGL
intersectSphereLine(sphereCenter, sphereRad, lineBase, lineDir) := (
    regional(discriminant, res, dirLengthSquared);

    dirLengthSquared = lineDir * lineDir;

    discriminant = (lineDir * (lineBase - sphereCenter))^2 - dirLengthSquared * ((lineBase - sphereCenter) * (lineBase - sphereCenter) - sphereRad^2);

    res = [-10000, -10000];
    if(discriminant == 0, 
        res = [-(lineDir * (lineBase - sphereCenter)) / dirLengthSquared, -10000]
    );
    if(discriminant > 0, 
        res = [
            -(lineDir * (lineBase - sphereCenter) + sqrt(discriminant)) / dirLengthSquared, 
            -(lineDir * (lineBase - sphereCenter) - sqrt(discriminant)) / dirLengthSquared
        ];
    );

    res;
);













rectangleWave(x, start, end) := 0.5 * sign(2 - abs((x - 0.5 * (start + end)) * 4 / (end - start))) + 0.5;
















integral(name, start, end, resolution) := (
    // Subdividing followed by Boole's rule

    regional(s, a, b, h);

    auxf(x) := parse(name + "(" + x + ")");

    sum(apply(0 .. resolution - 1, s, 
        a = lerp(start, end, s, 0, resolution);	
        b = lerp(start, end, s + 1, 0, resolution);	
        h = (b - a) / 4;

        [7, 32, 12, 32, 7] * apply(0..4, auxf(lerp(a, b, #, 0, 4))) * 2 * h / 45;
    ));

    

);

integral(name, start, end) := integral(name, start, end, integralResolutionEBOW);








// ************************************************************************************************
// Quaternion rotation.
// ************************************************************************************************

qProd(u, v) := [
    u_1 * v_1 - u_2 * v_2 - u_3 * v_3 - u_4 * v_4,
    u_1 * v_2 + u_2 * v_1 + u_3 * v_4 - u_4 * v_3,
    u_1 * v_3 - u_2 * v_4 + u_3 * v_1 + u_4 * v_2,
    u_1 * v_4 + u_2 * v_3 - u_3 * v_2 + u_4 * v_1
];

qConj(a) := [a_1, -a_2, -a_3, -a_4];

rotate3D(vec, axis, angle) := (
    regional(r, p, res);

    if(abs(axis) <= 0.001,
        vec;
    , // else //
        axis = axis / abs(axis);

        r = [cos(angle / 2), sin(angle / 2) * axis_1, sin(angle / 2) * axis_2, sin(angle / 2) * axis_3];
        p = [0, vec_1, vec_2, vec_3];

        res = qProd(qProd(r, p), qConj(r));

        [res_2, res_3, res_4];
    );
);




sdfTwist(p, amount) := (
    regional(c, s, m);

    c = cos(amount * p_3);
    s = sin(amount * p_3);
    m = [[c, -s, 0], [s, c, 0], [0, 0, 1]];
    m * p;
);




roundedRectangleStroke(center, w, h, cornerRadius) := (
    regional(corners);

    corners = [];
    corners = corners :> apply(sampleCircle(cornerRadius, 0.5 * pi, pi), # + center + 0.5 * [-w, h] + cornerRadius * [1, -1]);
    corners = corners :> apply(sampleCircle(cornerRadius, pi, 1.5 * pi), # + center + 0.5 * [-w, -h] + cornerRadius * [1, 1]);
    corners = corners :> apply(sampleCircle(cornerRadius, 1.5 * pi, 2 * pi), # + center + 0.5 * [w, -h] + cornerRadius * [-1, 1]);
    corners = corners :> apply(sampleCircle(cornerRadius, 0, 0.5 * pi), # + center + 0.5 * [w, h] + cornerRadius * [-1, -1]);
    

    resample(resample(corners_4_(-1) <: flatten(corners)));
);








drawOutline(image, size, outlineColor) := (
    // Brute force

    regional(vis, a, b, c, resultColor, imageColor);

    
    a = 40;
    
    colorplot(
        imageColor = imagergba(image, #);
        
        if(imageColor_4 > 0,
            vis = 1;
        , // else //
            vis = 0;
            repeat(a, i, vis = vis + imagergba(image, # + size *         [sin(2 * pi * i / a), cos(2 * pi * i / a)])_4);

            vis = clamp(vis, 0, 1);
        );

        

        (outlineColor.x, outlineColor.y, outlineColor.z, 1) * vis;
    );
);

drawOutline(image, targetTexture, size, outlineColor) := (
    // Brute force

    regional(vis, a, b, c, resultColor, imageColor);

    
    a = 40;
    
    colorplot(targetTexture,
        imageColor = imagergba(image, #);
        
        if(imageColor_4 > 0,
            vis = 1;
        , // else //
            vis = 0;
            repeat(a, i, vis = vis + imagergba(image, # + size *         [sin(2 * pi * i / a), cos(2 * pi * i / a)])_4);

            vis = clamp(vis, 0, 1);
        );

        

        (outlineColor.x, outlineColor.y, outlineColor.z, 1) * vis;
    );
);














adj(mat) := (
regional(n, sub);

    n = length(mat);
    transpose(apply(1..n, i, apply(1..n, j, 
        sub = apply(mat_((1..n) -- [i]), #_((1..n) -- [j]));
        (-1)^(i + j) * det(sub);
    )));
);


trace(mat) := sum(apply(1..length(mat), mat_#_#));



conicThroughFive(list) := (
    regional(g1, g2, h1, h2, g, h, q, m);

    if(length(list_1) == 2,
        list = apply(list, #.xy :> 1);
    );

    g1 = apply(cross(list_1, list_3), [#]);
    g2 = apply(cross(list_2, list_4), [#]);
    h1 = apply(cross(list_1, list_4), [#]);
    h2 = apply(cross(list_2, list_3), [#]);

    g = g1 * transpose(g2);
    h = h1 * transpose(h2);

    q = apply(list_5.homog, [#]);

    m = (transpose(q) * h * q)_1_1 * g - (transpose(q) * g * q)_1_1 * h;

    m + transpose(m);

);




crossMatrix(p) := [[0, p.z, -p.y], [-p.z, 0, p.x], [p.y, -p.x, 0]];

splitDegenerateConic(mat) := (
    regional(b, n, i, beta, p, c, j);

    if(mat != transpose(mat), mat = mat + transpose(mat));
    
    n = length(mat);
    b = adj(mat);
    i = select(1..n, b_#_# != 0);
    if(i == [], 
        i = 1;
        beta = 1;
    , // else //
        i = i_1;
        if(im(b_i_i) != 0 & re(b_i_i) < 0,
            b = -b;	
        );
        beta = 	sqrt(b_i_i);
    );
    p = transpose(b)_i / beta;
    c = mat + crossMatrix(p);
    [i,j] = select(directproduct(1..n, 1..n), c_(#_1)_(#_2) != 0)_1;

    [c_i, transpose(c)_j];		
);

intersectConicLine(mat, vec) := (
    regional(b, n, alpha, c, i, j, sub);

    n = length(mat);
    b = transpose(crossMatrix(vec)) * mat * crossMatrix(vec);
    
    
    i = select(1..n, vec_# != 0)_1;
    sub = apply(b_((1..n) -- [i]), #_((1..n) -- [i]));
    alpha = sqrt(-det(sub)) / vec_i;
    c = b + alpha * crossMatrix(vec);
    [i,j] = select(directproduct(1..n, 1..n), c_(#_1)_(#_2) != 0)_1;

    [c_i, transpose(c)_j];
);



findRootsHomoCubic(coeffs) := (
    regional(a, b, c, d, w, e, q, r, l, m, omega, omegaMatrix);

    omega = complex([cos(2 * pi / 3), sin(2 * pi / 3)]); //-0.5 + i * sqrt(0.75);
    omegaMatrix = [[omega, 1, omega^2], [1,1,1], [omega^2, 1, omega]];
    [a, b, c, d] = coeffs;

    w = -2*b^3 + 9*a*b*c - 27*a^2*d;
    e = - b^2*c^2 + 4*a*c^3 + 4*b^3*d - 18*a*b*c*d + 27*a^2*d^3;
    q = w - a * sqrt(27*e);
    r = pow(4*q, 1/3);
    l = [2*b^2 - 6*a*c, -b, r];
    m = 3*a*[r, 1, 2];

    zip(omegaMatrix * l, omegaMatrix * m);
);	

// Smallest to highest degree
findRootsHomoPoly(coeffs) := (
    apply(roots(coeffs), [#, 1]) ++ apply( roots(const(length(coeffs) - 1, 0) :> coeffs_(-1)), [#, 0] );
);

intersectConicConic(matA, matB) := (
    regional(a, b, c, d, l, m, matC, g, h);

    if(matA != transpose(matA), matA = matA + transpose(matA));
    if(matB != transpose(matB), matB = matB + transpose(matB));

    a = det(matA);
    b = det(matA_[1,2] :> matB_3) - det(matA_[1,3] :> matB_2) + det(matA_[2,3] :> matB_1);
    c = det(matB_[1,2] :> matA_3) - det(matB_[1,3] :> matA_2) + det(matB_[2,3] :> matA_1);
    d = det(matB);

    //b = sum(apply(1..3, (-1)^(# + 1) * det(transpose(matA)_((1..3) -- [#]) :> transpose(matB)_#)));
    //c = sum(apply(1..3, (-1)^(# + 1) * det(transpose(matB)_((1..3) -- [#]) :> transpose(matA)_#)));
    
    [lambda, mu] = findRootsHomoPoly([d, c, b, a])_1;

    matC = lambda * matA + mu * matB;

    [g, h] = splitDegenerateConic(matC);


    apply(intersectConicLine(matA, g) ++ intersectConicLine(matA, h), reduceHomoCoords(#));
);


isComplexHomo(vec, eps) := (
    vec = reduceHomoCoords(vec);

    contains(apply(vec, abs(im(#)) <= eps), false);
);
isComplexHomo(vec) := isComplexHomo(vec, 0);

reduceHomoCoords(vec) := (
    regional(entry);

    entry = select(vec, # != 0)_1;

    vec / entry;
);




// ************************************************************************************************
// Gets the current time from the computer clock converted to seconds.
// ************************************************************************************************
computerSeconds() := (
    regional(actualTime);

    actualTime = time();

    actualTime_1 * 3600 + actualTime_2 * 60 + actualTime_3 + actualTime_4 * 0.001;
);

timeBufferEBOW = 0;
scriptStartTimeEBOW = 0;
// ************************************************************************************************
// Sets up time-keeping variables. Will be automatically called when included.
// Has to be called together with playanimation()!
// ************************************************************************************************
setupTime() := (
    timeBufferEBOW = computerSeconds();
    scriptStartTimeEBOW = timeBufferEBOW;
);
now() := computerSeconds() - scriptStartTimeEBOW;

// ************************************************************************************************
// Returns the duration ofthe last frame/tick in seconds.
// Needs to run on every frame!
// ************************************************************************************************
deltaTime() := (
    regional(result);

    result = computerSeconds() - timeBufferEBOW;
    timeBufferEBOW = computerSeconds();

    result;
);




timeOffset(t, a, b) := clamp(inverseLerp(a, b, t), 0, 1);
timeOffsetGPU(t, a, b) := clamp(inverseLerp1(a, b, t), 0, 1);

stepSignal(t, a, b, c, d) := clamp(min(inverseLerp(a, b, t), inverseLerp(d, c, t)), 0, 1);


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

setupAnimationTrack(s, e) := {
    "start":    s,
    "end":      e,
    "duration": e - s,
    "timeLeft": e - s,
    "progress": 0,
    "running":  true,
    "looping":  false
}; 

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




trackStarted(track, delay) := now() >= track.start + delay;
trackEnded(track, delay) := now() > track.end + delay;
trackRunning(track, delay) := and(trackStarted(track, delay), not(trackEnded(track, delay)));
trackStarted(track) := trackStarted(track, 0);	
trackEnded(track) := trackEnded(track, 0);
trackRunning(track) := trackRunning(track, 0);


// Needs to run on every frame!
updateAnimationTrack(track, delta) := (
    if(track.running & trackStarted(track),
        track.timeLeft = track.timeLeft - delta;	
        track.progress = 1 - track.timeLeft / track.duration;
        if(track.timeLeft <= 0,
            if(track.looping,
                track.timeLeft = track.end - track.start;
            , // else //
                track.timeLeft = 0;
                track.progress = 1;
                track.running = false;		
            );
        );
    );
);

tween(obj, prop, from, to, track, easing) := (
    regional(t);

    t = track.progress;
    
    if(trackStarted(track),
        if(t < 1,
            if(easing != "none",
                t = parse(easing + "(" + t + ")");
            );
        
            if(contains(keys(obj), prop),
                obj_prop = lerp(from, to, t);
            );	
        ,if(t >= 1,
            if(contains(keys(obj), prop),
                obj_prop = to;
            );	
        ));
    );
);
tween(obj, prop, from, to, track) := tween(obj, prop, from, to, track, "none");




arrowTipAngleEBOW = pi/ 6;
arrowTip(tipPos, dir, size) := (
    if(abs(dir) > 0, dir = dir / abs(dir));

    [
        tipPos - size * rotation(arrowTipAngleEBOW) * dir,
        tipPos,
        tipPos - size * rotation(-arrowTipAngleEBOW) * dir
    ];		
);




flipBookIndex(progress, max) := floor(lerp(1, max + 0.9999, progress));





// Normal mod, but instead of returning a number between 0 and n-1, it returns a number between 1 and n.
cindyMod(k, n) := mod(k - 1, n) + 1;




// ************************************************************************************************
// Creates deep copy of a dictionary.
// ************************************************************************************************
copy(dict) := (
    regional(result);

    result = {};
    forall(keys(dict),
        result_# = dict_#;
    );
    result;
);




// ************************************************************************************************
// Creates stroke around a circle.
// ************************************************************************************************
sampleCircle(rad, angle) := apply(0..strokeSampleRateEBOW - 1, rad * [cos(angle * # / (strokeSampleRateEBOW - 1)), sin(angle * # / (strokeSampleRateEBOW - 1))]);
sampleCircle(rad, startAngle, endAngle) := apply(0..strokeSampleRateEBOW - 1, rad * [cos(startAngle + (endAngle - startAngle) * # / (strokeSampleRateEBOW - 1)), sin(startAngle + (endAngle - startAngle) * # / (strokeSampleRateEBOW - 1))]);
sampleCircle(rad) := sampleCircle(rad, 2*pi);


// ************************************************************************************************
// Subdivides the distance between two points.
// ************************************************************************************************
subdivideSegment(p, q, n) := apply(1..n, lerp(p, q, #, 1, n));

// ************************************************************************************************
// Creates stroke around a polygon.
// ************************************************************************************************
samplePolygonFREE(poly, nop, closed) := (
    regional(pairs, dists, totalDist, effectiveNumber, splitNumbers, stepSize, index, sr);
    
    if(closed, 
        poly = poly :> poly_1;
    );
    
    sr = if(length(poly) == 2, strokeSampleRateEBOW, nop);
    
    pairs = consecutive(poly);
    
    dists = apply(pairs, dist(#_1, #_2));
    totalDist = sum(dists);
    
    effectiveNumber = sr - length(poly);

    splitNumbers = apply(dists, floor((sr - 1) * # / totalDist));


    
    if(sum(splitNumbers) < effectiveNumber,
        forall(1..effectiveNumber - sum(splitNumbers),
            index = randchoose(1..length(splitNumbers));
            splitNumbers_index = splitNumbers_index + 1;
        );
    );
    if(sum(splitNumbers) > effectiveNumber,
        forall(1..sum(splitNumbers) - effectiveNumber,
            index = randchoose(1..length(splitNumbers));
            splitNumbers_index = splitNumbers_index - 1;
        );
    );


    flatten(apply(1..length(pairs), pop(subDivideSegment(pairs_#_1, pairs_#_2, splitNumbers_# + 2)) )) :> poly_(-1);

);
samplePolygonFREE(poly, nop) :=	samplePolygonFREE(poly, nop, true);

samplePolygon(poly) := samplePolygonFREE(poly, strokeSampleRateEBOW);
samplePolygon(poly, closed) := samplePolygonFREE(poly, strokeSampleRateEBOW, closed);






// ************************************************************************************************
// Resampling via centripetal Catmull-Rom splines.
// ************************************************************************************************
resample(stroke, nop) := sampleCatmullRomSplineFREE(stroke, nop);
resample(stroke) := sampleCatmullRomSplineFREE(stroke, strokeSampleRateEBOW);




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




sampleBezierCurve(controls) := (
    regional(t, sr);

    sr = strokeSampleRateEBOW;
    apply(0..sr - 1, 
        t = # / (sr - 1);

        bezier(controls, t);
    );
);

sampleBezierSpline(listOfCurves, t) := (
    regional(lengths);
    
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
    apply(0..strokeSampleRateEBOW - 1, 
        t = # / (strokeSampleRateEBOW - 1);

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
sampleCatmullRomSplineGeneral(points, alpha) := sampleCatmullRomSplineGeneralFREE(points, alpha, strokeSampleRateEBOW);
sampleCatmullRomSplineFREE(points, nop)      := sampleCatmullRomSplineGeneralFREE(points, 0.5, nop);
sampleCatmullRomSpline(points)               := sampleCatmullRomSplineGeneralFREE(points, 0.5, strokeSampleRateEBOW);





// ************************************************************************************************
// Creates a stroke based on a function graph.
// ************************************************************************************************
sampleFunctionGraph(func, start, end) := (
    apply(0..strokeSampleRateEBOW-1,
        t = lerp(start, end, #, 0, strokeSampleRateEBOW-1);

        (t, parse(func + "(" + t + ")"));	
    );
);
sampleCurve(curve, start, end) := (
    apply(0..strokeSampleRateEBOW-1,
        t = lerp(start, end, #, 0, strokeSampleRateEBOW-1);

        parse(curve + "(" + t + ")");	
    );
);


    

// ************************************************************************************************
// Transformation matrices.
// ************************************************************************************************
rotation(alpha) := [[cos(alpha), -sin(alpha)], [sin(alpha), cos(alpha)]];


rotate(point, alpha, center) := rotation(alpha) * (point - center) + center;
rotate(vector, alpha) := rotate(vector, alpha, [0,0]);






// n is normal vector of a plane through the origin.
centralProjToOrthoPlane(n, p) := n + ((n * n) / (n * n - n * p)) * (p - n);






    
    // ************************************************************************************************
    // Takes two arrays of the same length and pairs elements with the same index together.
    // ************************************************************************************************
    zip(a, b) := transpose([a, b]);



    // *************************************************************************************************
    // Removes the first i elements of a list.
    // *************************************************************************************************
    bite(list, i) := list_((i + 1)..length(list));
    bite(list) := bite(list, 1);


    // *************************************************************************************************
    // Intersecting and joining a list of lists.
    // *************************************************************************************************
    cap(list) := (
        regional(res);
        if(list == [],
            [];
        , // else //
            res = list_1;
            forall(bite(list),
                res = res ~~ #;
            );

            res;
        );
    );
    cup(list) := set(flatten(list));



    // *************************************************************************************************
    // Generates all triples of consecutive elements of a list.
    // *************************************************************************************************
    consectriples(list) := (
        regional(res);

        res = [];
        if(length(list) <= 2,
            res = [];
        , // else //
            forall(1..(length(list) - 2),
                res = res :> list_[#, # + 1, # + 2];
            );
        );
    );

    // *************************************************************************************************
    // Returns a list of length n where every entry is the object x.
    // *************************************************************************************************
    const(n, x) := if(n == 0, [], apply(1..n, x));


    
    // *************************************************************************************************
    // Finds first index at which x appears in list. Returns 0, when x is not in list.
    // *************************************************************************************************
    findin(list, x) := (
        regional(occs);

        occs = select(1..length(list), list_# == x);
        if(length(occs) == 0, 0, occs_1);
    );

    // ************************************************************************************************
    // Returns the number of elements in list that are equal to x.
    // ************************************************************************************************
    frequency(list, x) := length(select(list, # == x));



    // *************************************************************************************************
    // Checks whether a list is constant or constant with a specific value.
    // *************************************************************************************************
    isconst(list) := (
             list == const(length(list), list_1);
    );
    isconst(list, x) := (
             list == const(length(list), x);
    );

    // *************************************************************************************************
    // For two lists consisting of distinct elements this function returns the permutation mapping the
    // first list to the second. It does it such that list1_result = list2.
    // Please make sure yourself, that the lists are compatible, i.e. that such a permutation exists.
    // *************************************************************************************************
    findperm(list1, list2) := (
        apply(list2, e, select(1..length(list1), list1_# == e)_1);
    );

    // *************************************************************************************************
    // Removes last i elements of an array.
    // *************************************************************************************************
    pop(list) := list_(1..(length(list) - 1));
    pop(list, i) := list_(1..(length(list) - i));

    // *************************************************************************************************
    // Provides a list of all integers 1...n randomly sorted.
    // *************************************************************************************************
    randomindex(n) := randsort(1..n);

    // *************************************************************************************************
    // Sorts a list randomly.
    // *************************************************************************************************
    randsort(list) := (
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
    randchoose(list, k) := (
            regional(res, i);

            if(k > length(list),
                randsort(list);
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

    randchoose(list) := randchoose(list, 1)_1;



    // *************************************************************************************************
    // Removes the i-th element of an array.
    // *************************************************************************************************
    remove(arr, i) := (
       if(i <= 1,
        bite(arr);
      ,if(i >= length(arr),
        pop(arr);
      , // else //
        arr_((1..(i - 1)) ++ ((i + 1)..length(arr)));
      ));
    );










    // ************************************************************************************************
    // Color transformation
    // ************************************************************************************************
    rgb2hsv(vec) := (
        regional(cMax, cMin, delta, maxIndex, h, s);

        maxIndex = 1;
        cMax = vec_1;
        forall(2..3, 
            if(vec_# > cMax,
                maxIndex = #;
                cMax = vec_#;
            );
        );

        cMin = min(vec);
        delta = cMax - cMin;

        if(delta <= 0.0001,
                h = 0;
            ,if(maxIndex == 1,
                h = mod((vec_2 - vec_3) / delta, 6);
            ,if(maxIndex == 2,
                h = 2 + (vec_3 - vec_1) / delta;
            ,if(maxIndex == 3,
                h = 4 + (vec_1 - vec_2) / delta;
                
            ))));

        if(cMax <= 0.0001, s = 0, s = delta / cMax);

        [h * 60°, s, cMax];

    );

    hsv2rgb(vec) := (
        regional(c, x, m, res);

        vec_1 = vec_1 / 60°;
        c = vec_2 * vec_3;
        x = c * (  1 - abs(mod(vec_1, 2) - 1)  );
        m = vec_3 - c;

        if(vec_1 < 1, 
            res = [c, x, 0];
        ,if(vec_1 < 2, 
            res = [x, c, 0];
        ,if(vec_1 < 3, 
            res = [0, c, x];
        ,if(vec_1 < 4, 
            res = [0, x, c];
        ,if(vec_1 < 5, 
            res = [x, 0, c];
        ,if(vec_1 <= 6, 
            res = [c, 0, x];
        ))))));

        
        [res_1 + m, res_2 + m, res_3 + m];
    );
    
    deca2hexa(digit) := ["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F"]_(digit + 1);
    hexa2deca(digit) := (
        regional(x, y);

        x = findin(["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F"], digit) - 1;
        y = findin(["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"], digit) - 1;

        if(x == -1, y, x);
    );

    rgb2hex(vec) := (
        regional(a, b);
        vec = round(255 * vec);

        sum(apply(vec,
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

    hex2rgb(string) := (
        regional(digits);

        digits = tokenize(string, "");
        apply([1,3,5],
            16 * hexa2deca(text(digits_#)) + hexa2deca(text(digits_(# + 1)));
        ) / 255;
    );



// http://www.brucelindbloom.com/index.html?Eqn_RGB_to_XYZ.html

// Pretending its sRGB what I'm using here... ¯\_(ツ)_/¯

rgb2xyz(vec) := (
    vec = apply(vec, 
        if(# < 0.04045, # / 12.92, re(pow((# + 0.055) / 1.055, 2.4)));
    );

    apply([[0.4124564,  0.3575761, 0.1804375],
     [0.2126729,  0.7151522, 0.0721750],
     [0.0193339,  0.1191920, 0.9503041]] * vec, clamp(#, 0, 1));
);

xyz2rgb(vec) := (
    vec =  [[ 3.2404542, -1.5371385, -0.4985314],
            [-0.9692660,  1.8760108,  0.0415560],
            [ 0.0556434, -0.2040259,  1.0572252]] * vec;

    apply(vec,
        if(# < 0.0031308, # * 12.92, 1.055 * re(pow(#, 1 / 2.4)) - 0.055);    
    );
);


whitePointD65 = [0.31271, 0.32902, 0.35827];

xyz2lab(vec) := (
    regional(eps, kappa);

    eps = 216 / 24389;
    kappa = 24389 / 27;

    vec = apply(1..3, vec_# / whitePointD65_#);
    vec = apply(vec, if(# > eps, re(pow(#, 1 / 3)), (kappa * # + 16) / 116));

    [116 * vec.y - 16, 500 * (vec.x - vec.y), 200 * (vec.y - vec.z)];
);

lab2xyz(vec) := (
    regional(eps, kappa, f, x, y, z);

    eps = 216 / 24389;
    kappa = 24389 / 27;

    f = [0.1,0,0];
    f_2 = (vec_1 + 16) / 116;
    f_1 = vec_2 / 500 + f_2;
    f_3 = f_2 - vec_3 / 200;

    x = re(pow(f_1, 3));
    if(x <= eps, x = (116 * f_1 - 16) / kappa);

    if(vec_1 > kappa * eps, 
        y = re(pow((vec_1 + 16) / 116, 3));
    , // else //    
        y = vec_1 / kappa;
    );

    z = re(pow(f_3, 3));
    if(z <= eps, z = (116 * f_3 - 16) / kappa);

    [x * whitePointD65.x, y * whitePointD65.y, z * whitePointD65.z];
);

rgb2lab(vec) := xyz2lab(rgb2xyz(vec));
lab2rgb(vec) := xyz2rgb(lab2xyz(vec));

lab2lch(vec) := (
    [vec_1, abs([vec_2, vec_3]), arctan2(vec_2, vec_3)];
);

lch2lab(vec) := (
    [vec_1, vec_2 * cos(vec_3), vec_2 * sin(vec_3)];
);



rgb2lch(vec) := lab2lch(rgb2lab(vec));
lch2rgb(vec) := lab2rgb(lch2lab(vec));



lerpHSV(vecA, vecB, t) := (
    regional(d, newH);

    d = abs(vecA_1 - vecB_1);
    
    if(d <= pi,
        newH = lerp1(vecA_1, vecB_1, t);
    , // else //
       vecA_1 = vecA_1 + 180°;
       vecB_1 = vecB_1 + 180°;
       if(vecA_1 > 360°, vecA_1 = vecA_1 - 360°);
       if(vecB_1 > 360°, vecB_1 = vecB_1 - 360°);
       
       newH = lerp1(vecA_1, vecB_1, t) + 180°;
       if(newH > 360°, newH = newH - 360°);
    );
    
    [newH, lerp1(vecA_2, vecB_2, t), lerp1(vecA_3, vecB_3, t)];
);


lerpLCH(vecA, vecB, t) := (
    regional(d, newH);

    d = abs(vecA_3 - vecB_3);
    
    if(d <= pi,
        newH = lerp1(vecA_3, vecB_3, t);
    , // else //
       vecA_3 = vecA_3 + 180°;
       vecB_3 = vecB_3 + 180°;
       if(vecA_3 > 360°, vecA_3 = vecA_3 - 360°);
       if(vecB_3 > 360°, vecB_3 = vecB_3 - 360°);
       
       newH = lerp1(vecA_3, vecB_3, t) + 180°;
       if(newH > 360°, newH = newH - 360°);
    );
    
    [lerp1(vecA_1, vecB_1, t), lerp1(vecA_2, vecB_2, t), newH];
);




    // ************************************************************************************************
    // Checks whether float a lies between floats c and d.
    // ************************************************************************************************
    between(a, c, d) := (a >= c) & (a <= d);


    // ************************************************************************************************
    // Clamps x between the values a and b.
    // ************************************************************************************************
    clamp(x, a, b) := if(a <= b, min(max(x, a), b), min(max(x, b), a));

    pNorm(p, v) := (
        v = apply(v, abs(#));

        if(p == 0,
            max(v);
        , // else //
            sum(apply(v, #^p))^(1 / p);
        );
    );

    distPointSet(point, set) := (
        min(apply(set, dist(point,#)));
    );

    // *************************************************************************************************
    // Computes the binomial n over k.
    // *************************************************************************************************
    binom(n, k) := (
        if((n < 0) % (k < 0) % (k > n),
            err("binom: wrong numbers")
        , // else //
            factorial(n) / factorial(k) / factorial(n - k)
        );
    );
    


    // *************************************************************************************************
    // Computes the convexhulls of a list of points
    // *************************************************************************************************
    cross(o, a, b) := (
        (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)
      );
    convexHull(points) := (
        regional(ordered, upper, lower);
      
        ordered = set(sort(points));
        if(length(ordered) <= 3,
          ordered;
        , // else //
          lower = [];
          forall(ordered,
            while((length(lower) > 1) & (cross(lower_(-2), lower_(-1), #) <= 0),
              lower = pop(lower);
            );
            lower = lower :> #;
          );
          upper = [];
          forall(reverse(ordered),
            while((length(upper) > 1) & (cross(upper_(-2), upper_(-1), #) <= 0),
              upper = pop(upper);
            );
            upper = upper :> #;
          );
      
          pop(lower) ++ pop(upper);
        );
      );
    



    // *************************************************************************************************
    // Area of a (simple?) polygon.
    // *************************************************************************************************
    areaOfPolygon(points) := (
        0.5 * abs(sum(apply(1..(length(points) - 1),
          (points_#).x * (points_(# + 1)).y - (points_(# + 1)).x * (points_#).y;
        )));
      );


    // *************************************************************************************************
    // Lagrange interpolation for a list of points.
    // *************************************************************************************************
    lagrange(list, x) := sum(apply(list, p,
        p.y * product(apply(list -- [p], q, (x - q.x) / (p.x - q.x)));
    ));

    
    sampleLagrangeInterpolationFREE(points, nop) := (
        regional(dists, traj, cutTimes, piece, t, start, end);

        [start, end] = [min(points).x, max(points).x];

        apply(1..nop, [lerp(start, end, #, 1, nop), lagrange(points, lerp(start, end, #, 1, nop))] );
    );
    sampleLagrangeInterpolation(points) := sampleLagrangeInterpolationFREE(points, strokeSampleRateEBOW);




    // *************************************************************************************************
    // Computes coefficients of polynomial interpolation via Newton basis / divided differences.
    // Output are coefficients for Newton basis ordered from lowest to highest degree.
    // *************************************************************************************************
    dividedDifferences(points) := (
        regional(recurMatrix, n);

        n = length(points);

        recurMatrix = zeromatrix(n, n);

        forall(1..n, i, forall(1..i, j,
            recurMatrix_i_j = if(j == 1,
                points_i.y;
            , // else //
                (recurMatrix_i_(j - 1) - recurMatrix_(i - 1)_(j - 1)) / (points_i.x - points_(i - j + 1).x);
            );
        ));

        apply(1..n, recurMatrix_#_#);
    );

    // *************************************************************************************************
    // Evaluates polynomial given by list of coefficients of Newton basis at value x.
    // Coefficients have to be sorted from lowest to highest degree!
    // *************************************************************************************************
    newtonInterpolation(points, coeffs, x) := if(length(coeffs) == 1, coeffs_1, 
        newtonInterpolation(bite(points), bite(coeffs), x) * (x - points_1.x) + coeffs_1;
    );


    // *************************************************************************************************
    // Evaluates polynomial given by list of coefficients via Horner scheme at value x.
    // Coefficients have to be sorted from lowest to highest degree!
    // *************************************************************************************************
    horner(coeffs, x) := if(length(coeffs) == 1, coeffs_1, horner(bite(coeffs), x) * x + coeffs_1);


    lazyCollision(shapeA, shapeB) := (
        regional(mink);
        
        mink = convexHull(flatten(apply(shapeA, a, apply(shapeB, b, b - a))));

        result = true;
        forall(cycle(mink),
            result = result & (det([#_1 :> 1, #_2 :> 1, (0,0,1)]) >= 0);
        );

        result;
    );

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

    // *************************************************************************************************
    // Computes the angle at q from p to r. The result lies in [0, 2 * pi].
    // *************************************************************************************************
    computeangle(p, q, r) := (
        regional(x, y, s, w);

        x = p - q;
        y = r - q;
        s = (x * y) / (abs(x) * abs(y));
        s = if(s < -1, -1, if(s > 1, 1, s));
        w = arccos(s) + 0;

         if(perp(x) * y >= 0, w, 2*pi - w);
    );


    // ************************************************************************************************* PLUGED IN
    // The sign of a number x.
    // *************************************************************************************************
    sign(x) := if(x == 0.0, 0.0, x / abs(x));

    // *************************************************************************************************
    // The factorial of the positive number n.
    // *************************************************************************************************
    //factorial(n) := if(n <= 0, 1, n * factorial(n - 1));
    factorial(n) := (
        prod = 1;

        if(n > 0,
            repeat(n,
                prod = prod * n;
            );    
        );

        prod;
    );
    




    // ************************************************************************************************* PLUGED IN
    poissonDiscSampling(rect, d, numberOfPoints, searchThreshold) := (
        regional(oldPoints, hSize, vSize, result, searching, i, j, candidate, candidateValid, rangeA, rangeB);

        hSize = ceil(rect.w / d);
        vSize = ceil(rect.h / d);
        oldPoints = const(vSize, const(hSize, []));

        result = [];
        
        searching = true;
        candidateValid = true;
        numberOfSearches = 0;

        while(and(searching, length(result) < numberOfPoints),
            candidate = [random() * rect.w, random() * rect.h];
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

        apply(result, # + rect.xy);
    );
    poissonDiscSampling(rect, d, numberOfPoints) := poissonDiscSampling(rect, d, numberOfPoints, 32);











    






    // *************************************************************************************************
    // Checks, whether two line segments intersect.
    // *************************************************************************************************
    intersectLineSegments(a, b) := (
          area(a_1, a_2, b_1) * area(a_1, a_2, b_2) < 0
        & area(b_1, b_2, a_1) * area(b_1, b_2, a_2) < 0
    );


    
    // *************************************************************************************************
    // Computes the signed distance of x to the line a-b.
    // *************************************************************************************************
    triangleheight(a, b, x) := if(a ~= b, dist(x, a), det(a :> 1, b :> 1, x :> 1) / dist(a, b));




    // *************************************************************************************************
    // Computes logarithms to p digits after the decimal point.
    // *************************************************************************************************
    arbiLog(x, b, p) := 10^(-p) * round(10^p * log(x) / log(b));
    log2(x, p)       := arbiLog(x, 2, p);
    log2(x)          := log2(x, 6);



    // *************************************************************************************************
    // The Kaylee way to scale probabilities.
    // *************************************************************************************************
    fuzzyScale(x, c) := c * x / ((c - 1) * x + 1);
    fuzzyS(x, c, lambda) := if(x < lambda, lambda * fuzzyScale(x / lambda, 1 / c),  lambda + (1 - lambda) * fuzzyScale((x - lambda) / (1 - lambda), c));

    fuzzyVectorScale(x, c) := apply(x, fuzzyScale(#, c));


    
    // *************************************************************************************************
    // Computes the fractional part of a float.
    // *************************************************************************************************
    residual(x) := x - floor(x);
    fract(x)    := residual(x);



    // *************************************************************************************************
    // Computes a random point on the unit circle.
    // *************************************************************************************************
    randomDirection() := (
        regional(alpha);
        
        alpha = 2 * pi * random();
        [sin(alpha), cos(alpha)];
    );









        





    ang2vec(alpha) := [cos(alpha), sin(alpha)];





    generalLaguerrePoly(k, n, x) := (
        regional(sum);

        sum = 0;

        repeat(n + 1,
            sum = sum + (-1)^(# - 1) * binom(n + k, n - # + 1) * x^(# - 1) / factorial(# - 1);    
        );

        sum;
    );





    cro(a,b) := a.x * b.y - a.y * b.x;


// NOT WORKING (YET...)
    quadBezierSDF(pos, aa, bb, cc) := (
        regional(a, b, c, d, kk, kx, ky, kz, res, p, p3, q, h, x, uv, z, v, m, n, s, k, sgn, r); 
        a = bb - aa;
        b = aa - 2.0 * bb + cc;
        c = aa * 2.0;
        d = aa - pos;

        kk = 1.0 / (b * b);
        kx = kk * (a * b);
        ky = kk * (2.0 * (a * a) + (d * b)) / 3.0;
        kz = kk * (d * a);
        res = 0.0;
        p = ky - kx * kx;
        p3 = p * p * p;
        q = kx * (2.0 * kx * kx - 3.0 * ky) + kz;
        h = q * q + 4.0 * p3;

        if(h >= 0.0,
            h = re(sqrt(h));
            x = ([h - q, -h - q]) / 2.0;



            if(abs(p) < 0.001,
                k = p3 / q;
                x = [k, -k-q];
            );

            uv = [sign(x_1) * re(pow(abs(x_1), 1/3)), sign(x_2) * re(pow(abs(x_2), 1/3))];
            t = clamp(uv_1 + uv_2 - kx, 0.0, 1.0);
            r = d + (c + b * t) * t;
            res = r * r;
            sgn = cro(c + 2.0 * b * t, r);

        , // else //
            z = re(sqrt(-p));
            v = arccos(q / (p * z * 2.0)) / 3.0;
            m = re(cos(v));
            n = re(sin(v) * 1.732050808);
            s = [clamp((m + m) * z - kx, 0.0, 1.0), clamp((-n - m) * z - kx, 0.0, 1.0), clamp((n - m) * z - kx, 0.0, 1.0)];
            res = min(
                (d + (c + b * s_1) * s_1) * (d + (c + b * s_1) * s_1),
                (d + (c + b * s_2) * s_2) * (d + (c + b * s_2) * s_2)
            );
            sgn = 1.0;
        );

        re(sqrt(res)) * sign(sgn);
    );








    sphereSDF(p, center, radius) := dist(p, center) - radius;
    
    capsuleSDF(p, start, end, radius) := (
        regional(pa, ba, h);

        pa = p - start;
        ba = end - start;

        h = clamp((pa * ba) / (ba * ba), 0, 1);

        abs(pa - ba * h) - radius;
    );
    
    truncatedConeSDF(p, base, baseRadius, tip, tipRadius) := (
        regional(rba, baba, papa, paba, x, cax, cay, k, f, cbx, cby, s);

        rba  = tipRadius - baseRadius;
        baba = (tip - base) * (tip - base);
        papa = (p - base) * (p - base);
        paba = ((p - base) * (tip - base)) / baba;

        x = sqrt(papa - paba * paba * baba);
        cax = max(0.0, re(x - if(paba < 0.5, baseRadius, tipRadius)));
        cay = abs(paba - 0.5) - 0.5;
        k = rba * rba + baba;
        f = clamp( re((rba * (x - baseRadius) + paba * baba) / k), 0.0, 1.0);
        cbx = x - baseRadius - f * rba;
        cby = paba - f;
        s = if((re(cbx) < 0.0) & (re(cay) < 0.0), -1.0, 1.0);
        
        re(s * sqrt(min(re(cax * cax + cay * cay * baba), re(cbx * cbx + cby * cby * baba))));
    );
    coneSDF(p, base, radius, tip) := truncatedConeSDF(p, base, radius, tip, 0);



boxSDF(p, size) := (
    regional(d);

    d = [abs(p.x), abs(p.y), abs(p.z)] - size;

    min(max(d), 0.0) + abs([max(d.x, 0.0), max(d.y, 0.0), max(d.z, 0.0)]);


);


rectSDF(p, size) := (
    regional(d);

    d = [abs(p.x), abs(p.y)] - size;
    min(max(d), 0.0) + abs([max(d.x, 0.0), max(d.y, 0.0)]);
);




polygonSDF(p, vertices) := (
    regional(d, s, e, w, b, c, f, u);

    d = (p - vertices_1) * (p - vertices_1); // float
    s = 1.0; // float

    u = vertices_(-1);
    forall(vertices, v,
        e = u - v; // vec2
        w = p - v; // vec2
        b = w - e * clamp((w * e) / (e * e), 0, 1); // vec2
        f = capsuleSDF(p, u, v, 0);
        
        d = min(d, b * b); // float
        
        c = [
            p.y >= v.y,
            p.y < u.y,
            e.x * w.y > e.y * w.x
        ]; // bvec3
        if(c_1 & c_2 & c_3,
            s = -s;
        );
        if(not(c_1) & not(c_2) & not(c_3),
            s = -s;
        );  

        u = v;
    );

    s * abs(sqrt(d));
);



triangleSDF(p, p0, p1, p2) := (
    regional(e0, e1, e2, v0, v1, v2, pq0, pq1, pq2, s, d);

    e0 = p1 - p0;
    e1 = p2 - p1;
    e2 = p0 - p2;

    v0 = p - p0;
    v1 = p - p1;
    v2 = p - p2;

    pq0 = v0 - e0 * clamp((v0 * e0) / (e0 * e0), 0.0, 1.0);
    pq1 = v1 - e1 * clamp((v1 * e1) / (e1 * e1), 0.0, 1.0);
    pq2 = v2 - e2 * clamp((v2 * e2) / (e2 * e2), 0.0, 1.0);

    s = sign(e0.x * e2.y - e0.y * e2.x);
    d = [
            min(min(pq0 * pq0, pq1 * pq1), pq2 * pq2),
            min(min(s * (v0.x * e0.y - v0.y * e0.x), s * (v1.x * e1.y - v1.y * e1.x)), s * (v2.x * e2.y - v2.y * e2.x))
        ];

    -re(sqrt(d.x)) * sign(d.y);
);



moonSDF(p, ra, rb, d) := (
    p = [p.x, abs(p.y)];
    a = (ra * ra - rb * rb + d * d) / (2 * d);
    b = re(sqrt(max(ra * ra - a * a, 0.0)));
    if(d * (p.x * b - p.y * a) > d * d * max(b - p.y, 0.0),
        abs(p - [a,b]);
    , // else //
        max(
            abs(p) - ra,
            -(abs(p - [d, 0]) - rb)
        );
    );
);









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




    lissajoue(a, b, d, t) := [sin(a * t + d), cos(b * t)];


    equalGPU(a, b) := floor(max(0, 1 - abs(a - b)));
    largerGPU(a, b) := floor(max(0, min(a, b) - (b - 1)));
    smallerGPU(a, b) := 1 - largerGPU(a, b);


    
    // *************************************************************************************************
    // Given a list of points, this returns the box circumscribing the points.
    // *************************************************************************************************
    box(list) := (
        regional(bl, diag);

        bl   = min(list);
        diag = max(list) - bl;
        expandrect(bl, diag.x, diag.y);
    );

    aabb(list) := box(list);
    
















 
    
    
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


    
    
    /* ************************************************************************************************
     Draws and handles button. They have to be a JSON with the following keys and value-types:
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
    drawButton(button) := (
        if(button.pressed,
            //fill(roundedrectangle(button.position + 0.5 * (-button.size.x, button.size.y), button.size.x, button.size.y, button.corner), color -> (button.colors)_2);
            fill(roundedrectangle(button.position + 0.5 * (-button.size.x, button.size.y) + (0, -0.2), button.size.x, button.size.y, button.corner), color -> (button.colors)_1);
                drawtext(button.position + (0, -0.5 * button.textSize / 35) + (0, -0.2), button.label, align->"mid", size->button.textSize, color->button.labelColor, bold->true, family->button.fontFamily);
        , // else //
            fill(roundedrectangle(button.position + 0.5 * (-button.size.x, button.size.y) + (0, -0.2), button.size.x, button.size.y, button.corner), color -> (button.colors)_3);
            fill(roundedrectangle(button.position + 0.5 * (-button.size.x, button.size.y), button.size_1, button.size_2, button.corner), color -> (button.colors)_2);
            drawtext(button.position + (0, -0.5 * button.textSize / 35), button.label, align->"mid", size->button.textSize, color->button.labelColor, bold->true, family->button.fontFamily);
        );
    );


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







    // *************************************************************************************************
    // Draws text with border.
    // *************************************************************************************************
    drawTextWithBorder(pos, txt, size, align, color, bordercolor, bordersize, family) := (
        forall(bordersize * apply(1..8, [sin(2 * pi * #/ 8), cos(2 * pi * #/ 8)]), o,
               drawtext(pos, txt, color -> bordercolor, offset -> o, size -> size, align -> align, family -> family);
              );
        drawtext(pos, txt, color -> color, size -> size, align -> align, family -> family);
      );
      drawTextWithBorder(pos, txt, size, align, color, bordercolor, bordersize) := (
        forall(bordersize * apply(1..8, [sin(2 * pi * #/ 8), cos(2 * pi * #/ 8)]), o,
               drawtext(pos, txt, color -> bordercolor, offset -> o, size -> size, align -> align);
              );
        drawtext(pos, txt, color -> color, size -> size, align -> align);
      );



    // *************************************************************************************************
    // Draws text over multiple lines with given line length.
    // *************************************************************************************************
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

   // *************************************************************************************************
    // Creates a rectangle (as a list of its vertices) of width w and height h with at position pos.
    // The value c gives the position in relation to the rectangle according to the number pad on a key-
    // board: E.g. 2 means the position is in the center of the bottom side, 5 means the center and 7
    // means the top left corner.
    // No c results in positioning the rectangle with pos in its lower left corner. I.e. c = 1 by
    // default.
    // *************************************************************************************************
    expandrect(pos, w, h, c) := (
        regional(d, e, shift);

        d     = 0.5 * [w, h];
        e     = (d_1, -d_2);
        shift = -compass(c);
        shift = (0.5 * w * shift.x, 0.5 * h * shift.y);
        apply([-d, e, d, -e], pos + # + shift); //LU, RU, RO, LO
    );
    expandrect(pos, w, h) := expandrect(pos, w, h, 1);

    compass(index) := apply(directproduct(-1..1, -1..1), reverse(#))_index;
    
    
    // *************************************************************************************************
    // Creates and handles rectangle objects.
    // *************************************************************************************************
    rect(x, y, c, w, h) := {"x": x, "y": y, "w": w, "h": h, "c": c, "xy": [x, y]};
    rect(x, y, w, h) := rect(x, y, 1, w, h);
    rect(pos, w, h)  := rect(pos.x, pos.y, w, h);
    drawRect(rect, size, color, alpha) := drawpoly(expandrect(rect.xy, rect.w, rect.h), size -> size, color -> color, alpha -> alpha);
    drawRect(rect, size, color) := drawRect(rect, size, color, 1);
    fillRect(rect, color, alpha) := fillpoly(expandrect(rect.xy, rect.w, rect.h), color -> color, alpha -> alpha);
    fillRect(rect, color) := fillRect(rect, color, 1);

    updateRectPos(rect, x, y) := (
        rect.x = x;
        rect.y = y;
        rect.xy = [x,y];
    );
    updateRectPos(rect, pos) := (
        rect.x = pos.x;
        rect.y = pos.y;
        rect.xy = pos;
    );

    rectContainsPoint(rect, point) := (
      regional(expanded);

      expanded = expandrect(rect);

        point.x > (expanded_1).x
      & point.x < (expanded_2).x
      & point.y > (expanded_1).y
      & point.y < (expanded_3).y
    );


    // Returns 0 if they don't intersect
    intersectRects(rectA, rectB) := (
        regional(top, bottom, left, right);

        right = min(rectA.x + rectA.w, rectB.x + rectB.w);
        left = max(rectA.x, rectB.x);
        top = min(rectA.y + rectA.h, rectB.y + rectB.h);
        bottom = max(rectA.y, rectB.y);

        if(or(left > right, bottom > top),
            0;	
        , // else //
            rect(left, bottom, right - left, top - bottom);
        );
    );


    centerOfRect(rect) := rect.xy + 0.5 * [rect.w, rect.h];





    // *************************************************************************************************
    // Draws text with border.
    // *************************************************************************************************
    drawWithBorder(pos, txt, size, align, color, bordercolor, bordersize, family) := (
        forall(bordersize * apply(1..8, [sin(2 * pi * #/ 8), cos(2 * pi * #/ 8)]), o,
               drawtext(pos, txt, color -> bordercolor, offset -> o, size -> size, align -> align, family -> family);
              );
        drawtext(pos, txt, color -> color, size -> size, align -> align, family -> family);
      );
      drawWithBorder(pos, txt, size, align, color, bordercolor, bordersize) := (
        forall(bordersize * apply(1..8, [sin(2 * pi * #/ 8), cos(2 * pi * #/ 8)]), o,
               drawtext(pos, txt, color -> bordercolor, offset -> o, size -> size, align -> align);
              );
        drawtext(pos, txt, color -> color, size -> size, align -> align);
      );



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

        if(lineSegmentSDF2D(endPoints, mouse().xy) <= slider.bulbSize + 0.02 * slider.size,
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

        if(lineSegmentSDF2D(endPoints, mouse().xy) <= slider.bulbSize + 0.02 * slider.size,
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

        if(lineSegmentSDF2D(endPoints, mouse().xy) <= selector.bulbSize + 0.02 * selector.size,
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

        if(lineSegmentSDF2D(endPoints, mouse().xy) <= selector.bulbSize + 0.02 * selector.size,
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




    preprocessSelector(selector) := (
        regional(endPoints);

        createimage(selector.outlineTexture, 3 * screenresolution() * canvasWidth, 3 * screenresolution() * canvasHeight);
        canvas(canvasCorners.bl, canvasCorners.br, selector.outlineTexture,
            endPoints = selectorEnds(selector);
            forall(1..length(selector.content),
                drawtext(lerp(endPoints_1, endPoints_2, #, 1, length(selector.content)) + (0, -0.015 * selector.textSize), selector.content_#, size -> selector.textSize, align -> "mid", color -> selector.innerColor, family -> selector.fontFamily);
            );
        );
        drawOutline(selector.outlineTexture, selector.outlineTexture, 0.1, selector.innerColor);
    );















// Taken from Wyman, Chris; Sloan, Peter-Pike; Shirley, Peter (July 12, 2013). "Simple Analytic Approximations to the CIE XYZ Color Matching Functions". Journal of Computer Graphics Techniques. 2 (2): 1-11. 
skewGauss(x, m, s1, s2) := if(x < m,
    exp(-0.5 * (x - m)^2 / s1^2)
    , // else //
    exp(-0.5 * (x - m)^2 / s2^2)
);
cieX(lambda) := 1.056 * skewGauss(lambda, 599.9, 37.9, 31.0) + 0.362 * skewGauss(lambda, 442.0, 16.0, 26.7) - 0.065 * skewGauss(lambda, 501.1, 20.4, 26.2);
cieY(lambda) := 0.821 * skewGauss(lambda, 568.8, 46.9, 40.5) + 0.289 * skewGauss(lambda, 530.9, 16.3, 31.1);
cieZ(lambda) := 1.217 * skewGauss(lambda, 437.0, 11.8, 36.0) + 0.681 * skewGauss(lambda, 459.0, 26.0, 13.8);









    wavelength2rgbaRaw(lambda) := (
        
        regional(red, green, blue);

        if((lambda > 620) & (lambda <= 780),
            red   = lerp(255,255, lambda, 620, 780) / 255.0;
            green = lerp(  1,  1, lambda, 620, 780) / 255.0;
            blue  = lerp(  2,  1, lambda, 620, 780) / 255.0;
        ,if((lambda > 600) & (lambda <= 620),
            red   = lerp(255,255, lambda, 600, 620) / 255.0;
            green = lerp( 71,  1, lambda, 600, 620) / 255.0;
            blue  = lerp(  1,  2, lambda, 600, 620) / 255.0;
        ,if((lambda > 580) & (lambda <= 600),
            red   = lerp(255,255, lambda, 580, 600) / 255.0;
            green = lerp(181, 71, lambda, 580, 600) / 255.0;
            blue  = lerp(  1,  1, lambda, 580, 600) / 255.0;
        ,if((lambda > 560) & (lambda <= 580),
            red   = lerp(148,255, lambda, 560, 580) / 255.0;
            green = lerp(254,181, lambda, 560, 580) / 255.0;
            blue  = lerp(  1,  1, lambda, 560, 580) / 255.0;
        ,if((lambda > 540) & (lambda <= 560),
            red   = lerp(  0,148, lambda, 540, 560) / 255.0;
            green = lerp(255,254, lambda, 540, 560) / 255.0;
            blue  = lerp(  1,  1, lambda, 540, 560) / 255.0;
        ,if((lambda > 520) & (lambda <= 540),
            red   = lerp(  0,  0, lambda, 520, 540) / 255.0;
            green = lerp(255,255, lambda, 520, 540) / 255.0;
            blue  = lerp(  1,  1, lambda, 520, 540) / 255.0;
        ,if((lambda > 500) & (lambda <= 520),
            red   = lerp(  0,  0, lambda, 500, 520) / 255.0;
            green = lerp(255,255, lambda, 500, 520) / 255.0;
            blue  = lerp(161,  1, lambda, 500, 520) / 255.0;
        ,if((lambda > 490) & (lambda <= 500),
            red   = lerp(  0,  0, lambda, 490, 500) / 255.0;
            green = lerp(236,255, lambda, 490, 500) / 255.0;
            blue  = lerp(254,161, lambda, 490, 500) / 255.0;
        ,if((lambda > 480) & (lambda <= 490),
            red   = lerp(  1,  0, lambda, 480, 490) / 255.0;
            green = lerp(133,236, lambda, 480, 490) / 255.0;
            blue  = lerp(255,254, lambda, 480, 490) / 255.0;
        ,if((lambda > 470) & (lambda <= 480),
            red   = lerp(  2,  1, lambda, 470, 480) / 255.0;
            green = lerp( 43,133, lambda, 470, 480) / 255.0;
            blue  = lerp(254,255, lambda, 470, 480) / 255.0;
        ,if((lambda > 460) & (lambda <= 470),
            red   = lerp( 23,  2, lambda, 460, 470) / 255.0;
            green = lerp(  0, 43, lambda, 460, 470) / 255.0;
            blue  = lerp(255,254, lambda, 460, 470) / 255.0;
        ,if((lambda >= 380) & (lambda <= 460),
            red   = lerp(114, 23, lambda, 380, 460) / 255.0;
            green = lerp(  1,  0, lambda, 380, 460) / 255.0;
            blue  = lerp(254,255, lambda, 380, 460) / 255.0;
        , // else //
            red = 0;
            green = 0;
            blue = 0;
        ))))))))))));

        [red, green, blue, 1];
        
    );




    wavelength2rgba(lambda) := (
        regional(left, middle, right);

        left   = 0.25 * wavelength2rgbaRaw(lambda - 5);
        middle = 0.5 *  wavelength2rgbaRaw(lambda);
        right  = 0.25 * wavelength2rgbaRaw(lambda + 5);


        // Estimated from https://en.wikipedia.org/wiki/Spectral_color#/media/File:Linear_visible_spectrum.svg
        if((lambda >= 380) & (lambda < 430),
            factor = lerp(0.1, 1.0, lambda, 380, 430);
        ,if((lambda >= 420) & (lambda < 650),
            factor = 1.0;
        ,if((lambda >= 650) & (lambda <= 780),
            factor = lerp(1.0, 0.1, lambda, 650, 780);
        , // else //
            factor = 0.0;
        )));

        (left + middle + right) * factor;
    );




















    distSquared(u, v) := (u - v) * (u - v);










    // *************************************************************************************************
    // Standard smmothstep function.
    // *************************************************************************************************
    smoothstep(x) := x * x * (3 - 2 * x);
    smoothStep(x, a, b) := smoothStep(inverseLerp(a, b, clamp(x, a, b)));



    // *************************************************************************************************
    // Computes a random value in the interval [0,1] at a x,y position.
    // *************************************************************************************************
    randomValue(pos) := fract(sin(pos * [12.9898, 78.233]) * 43758.5453123);

    randomGradient2D(pos) := (
        regional(a);

        a = randomValue(pos);
        [sin(2 * pi * a), cos(2 * pi * a)]
    );
    randomGradient3D(pos) := (
        regional(a);

        a = randomValue([pos.x, pos.y]);
        b = randomValue([-pos.z, pos.x + pos.y]);

        [sin(2 * pi * a) * sin(pi * b), cos(pi * b), cos(2 * pi * a) * sin(pi * b)]
    );                            
    randomPoint(pos) := [fract(sin(pos * (127.1,311.7)) * 43758.5453), 
                         fract(sin(pos * (269.5,183.3)) * 43758.5453) ];

    // *************************************************************************************************
    // Computes a random point in [0,1]^3 at a x,y,z position.
    // *************************************************************************************************					 
    randomPoint3D(pos) := [fract(sin(pos * (127.1,311.7, 56.2)) * 43758.5453), 
                             fract(sin(pos * (269.5,183.3,468.1)) * 43758.5453),
                             fract(sin(pos * ( 62.5,654.2,863.4)) * 43758.5453) ];

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



    perlinNoise3D(coords) := (
        regional(iPoint, fPoint);
        
        iPoint = [floor(coords.x), floor(coords.y), floor(coords.z)];
        fPoint = [fract(coords.x), fract(coords.y), fract(coords.z)];

        0.5 * lerp(
            lerp(
                lerp(
                    randomGradient3D(iPoint) * (fPoint), 
                    randomGradient3D(iPoint + [1,0,0]) * (fPoint - [1,0,0]), 
                smoothstep(fPoint.x)),
                lerp(
                    randomGradient3D(iPoint + [0,1,0]) * (fPoint - [0,1,0]),
                    randomGradient3D(iPoint + [1,1,0]) * (fPoint - [1,1,0]),
                smoothstep(fPoint.x)),
            smoothstep(fPoint.y)),
            lerp(
                lerp(
                    randomGradient3D(iPoint + [0,0,1]) * (fPoint - [0,0,1]), 
                    randomGradient3D(iPoint + [1,0,1]) * (fPoint - [1,0,1]), 
                smoothstep(fPoint.x)),
                lerp(
                    randomGradient3D(iPoint + [0,1,1]) * (fPoint - [0,1,1]),
                    randomGradient3D(iPoint + [1,1,1]) * (fPoint - [1,1,1]),
                smoothstep(fPoint.x)),
            smoothstep(fPoint.y)),
        smoothStep(fPoint.z)) + 0.5;
    );
    perlinNoise3DOctaves(coords) := (
        regional(sumA, sumB);

        sumA = 0;
        sumB = 0;

        repeat(3,
            sumA = sumA + pow(0.5, # - 1) * perlinNoise3D(pow(2, # - 1) * coords);    
            sumB = sumB + pow(0.5, # - 1);    
        );

        sumA / sumB;
    );


    // *************************************************************************************************
    // Gives noise based on Voronoi decomposition.
    // *************************************************************************************************
    voronoiNoise(coords) := (
        regional(iPoint, mDist, neighbours, currDist);

        iPoint = [floor(coords.x), floor(coords.y)];
        fPoint = [fract(coords.x), fract(coords.y)];

        neighbours = directproduct(-1..1, -1..1);

        mDist = 1.5;

        forall(neighbours,
            currDist = dist(coords, iPoint + # + randomPoint(iPoint + #));	
            if(currDist < mDist,
                mDist = currDist;
            );
        );

        mDist;

    );



















    pca(list) := (
        regional(mean, eigenvectors, eigenvalues);

        mean = sum(list) / length(list);
        list = apply(list, # - mean);

        eigenvectors = eigenvectors(transpose(list) * list);
        eigenvalues = eigenvalues(transpose(list) * list);

        eigenvectors_(  reverse(sort(1..length(eigenvalues), abs(eigenvalues_#)))  );
    );















    canvasRect = rect(canvasCorners.bl, canvasWidth, canvasHeight);









