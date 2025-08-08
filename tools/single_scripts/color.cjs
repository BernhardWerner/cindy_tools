lerp(x, y, t) := t * y + (1 - t) * x;


// *****************************************************************************************************************************

findin(list, x) := (
    regional(occs);

    occs = select(1..length(list), list_# == x);
    if(length(occs) == 0, 0, occs_1);
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


// *****************************************************************************************************************************



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

lerpHSV(vecA, vecB, t) := (
    regional(d, newH);

    d = abs(vecA_1 - vecB_1);
    
    if(d <= pi,
        newH = lerp(vecA_1, vecB_1, t);
    , // else //
        vecA_1 = vecA_1 + 180°;
        vecB_1 = vecB_1 + 180°;
        if(vecA_1 > 360°, vecA_1 = vecA_1 - 360°);
        if(vecB_1 > 360°, vecB_1 = vecB_1 - 360°);
        
        newH = lerp(vecA_1, vecB_1, t) + 180°;
        if(newH > 360°, newH = newH - 360°);
    );
    
    [newH, lerp(vecA_2, vecB_2, t), lerp(vecA_3, vecB_3, t)];
);

// *****************************************************************************************************************************



rgb2linrgb(vec) := apply(vec,
    if(# >= 0.0031308,
        1.055 * #^(1 / 2.4) - 0.055
    , // else //
        12.92 * #
    );
);
linrgb2rgb(vec) := apply(vec,
    if(# >= 0.04045,
        ((# + 0.055)/(1 + 0.055))^2.4
    , // else //
        # / 12.92
    );
);



// *****************************************************************************************************************************


linrgb2oklab(vec) := (
    regional(l, m, s);

    l = 0.4122214708 * vec_1 + 0.5363325363 * vec_2 + 0.0514459929 * vec_3;
	m = 0.2119034982 * vec_1 + 0.6806995451 * vec_2 + 0.1073969566 * vec_3;
	s = 0.0883024619 * vec_1 + 0.2817188376 * vec_2 + 0.6299787005 * vec_3;

    l = l^(1/3);
    m = m^(1/3);
    s = s^(1/3);

    [
        0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
        1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
        0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
    ];
);

oklab2linrgb(vec) := ( 
    regional(l, m, s);

    l = vec_1 + 0.3963377774 * vec_2 + 0.2158037573 * vec_3;
    m = vec_1 - 0.1055613458 * vec_2 - 0.0638541728 * vec_3;
    s = vec_1 - 0.0894841775 * vec_2 - 1.2914855480 * vec_3;

    l = l^3;
    m = m^3;
    s = s^3;

    [
		+4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
		-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
		-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
    ];
);

oklab2oklch(vec) := [
    vec_1,
    abs(vec_[2,3]),
    arctan2(vec_[2,3])
];
oklch2oklab(vec) := [
    vec_1,
    vec_2 * cos(vec_3),
    vec_2 * sin(vec_3)
];

lerpLCH(vecA, vecB, t) := (
    regional(d, newH);

    d = abs(vecA_3 - vecB_3);
    
    if(d <= pi,
        newH = lerp(vecA_3, vecB_3, t);
    , // else //
        vecA_3 = vecA_3 + 180°;
        vecB_3 = vecB_3 + 180°;
        if(vecA_3 > 360°, vecA_3 = vecA_3 - 360°);
        if(vecB_3 > 360°, vecB_3 = vecB_3 - 360°);
        
        newH = lerp(vecA_3, vecB_3, t) + 180°;
        if(newH > 360°, newH = newH - 360°);
    );
    
    [lerp(vecA_1, vecB_1, t), lerp(vecA_2, vecB_2, t), newH];
);


// *****************************************************************************************************************************

rgb2oklab(vec) := linrgb2oklab(rgb2linrgb(vec));
oklab2rgb(vec) := linrgb2rgb(oklab2linrgb(vec));
rgb2oklch(vec) := oklab2oklch(rgb2oklab(vec));
oklch2rgb2(vec) := oklab2rgb(oklch2oklab(vec));

// *****************************************************************************************************************************


blendRGB(a, b, t) := linrgb2rgb(lerp(rgb2linrgb(a), rgb2linrgb(b), t));
blendRGB(a, b, t, c, d) := blendRGB(a, b, inverseLerp(c, d, t));
blendHSV(a, b, t) := hsv2rgb(lerpHSV(rgb2hsv(a), rgb2hsv(b), t));
blendHSV(a, b, t, c, d) := blendHSV(a, b, inverseLerp(c, d, t));
blendLAB(a, b, t) := oklab2rgb(lerp(rgb2oklab(a), rgb2oklab(b), t));
blendLAB(a, b, t, c, d) := blendLAB(a, b, inverseLerp(c, d, t));
blendLCH(a, b, t) := oklch2rgb2(lerpLCH(rgb2oklch(a), rgb2oklch(b), t));
blendLCH(a, b, t, c, d) := blendLCH(a, b, inverseLerp(c, d, t));
