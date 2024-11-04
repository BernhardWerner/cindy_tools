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


sign(x) := if(x == 0, 0, if(x > 0, 1, -1));





clamp(x, a, b) := min(max(x, a), b);



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


white = [1, 1, 1];
black = [0, 0, 0];


arrowTipAngle = pi/ 6;
arrowTip(tipPos, dir, size) := (
    if(abs(dir) > 0, dir = dir / abs(dir));

    [
        tipPos - size * rotation(arrowTipAngle) * dir,
        tipPos,
        tipPos - size * rotation(-arrowTipAngle) * dir
    ];		
);



rotation(alpha) := [[cos(alpha), -sin(alpha)], [sin(alpha), cos(alpha)]];


rotate(point, alpha, center) := rotation(alpha) * (point - center) + center;
rotate(vector, alpha) := rotate(vector, alpha, [0,0]);

ang2vec(alpha) := [cos(alpha), sin(alpha)];