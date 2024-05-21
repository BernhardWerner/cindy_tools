


    
    // ************************************************************************************************
    // Gets the ALICE and Toolbox colours.
    // ************************************************************************************************
    toolColorTable = dict(blue      -> [(2, 88,155),    (0, 70,124),      (0, 50, 89),     (0, 27, 48),     (0,  5,  9)]   / 255,
                          red       -> [(255,193,148),  (247,156, 90),    (227,114, 34),   (172, 76,  8),   (114, 47,  0)]    / 255,
                          green     -> [(237,247, 81),  (215,228, 15),    (162,173,  0),   (119,127,  0),   (61, 65,  0)]   / 255,
                          violet    -> [(219,90, 159),  (191,66, 144),    (168,37,  132),  (143,43,  132),  (116, 45,  133)]   / 255,
                          grey      -> [(224,224,224),  (172,172,172),    (128,128,128),   (78,78,78),      (35,35,35)]   / 255
    );
    toolColor(name, bright) := get(toolColorTable, name)_(3 - bright);
    toolColor(name)         := get(toolColorTable, name)_3;

    aliceColorTable = dict(blue      -> [(82,136,188),  (48,110,171),  (12,90,166),   (9,69,128),   (5,54,100)]   / 255,
                           orange    -> [(255,185,99),  (255,166,57),  (255,140,0),   (197,108,0),  (155,85,0)]   / 255,
                           violet    -> [(179,109,212), (158,62,204),  (145,19,204),  (123,5,178),  (95,3,138)]   / 255,
                           turquoise -> [(90,177,171),  (24,156,146),  (0,128,119),   (0,95,88),    (0,60,56)]    / 255,
                           teal      -> [(90,177,171),  (24,156,146),  (0,128,119),   (0,95,88),    (0,60,56)]    / 255,
                           red       -> [(253,105,109), (236,62,66),   (215,19,24),   (173,6,10),   (133,0,3)]    / 255,
                           green     -> [(131,222,92),  (99,204,53),   (67,186,16),   (48,150,5),   (34,116,0)]   / 255,
                           minion    -> [(255,242,153), (255,237,114), (245,224,80),  (221,198,44), (170,151,22)] / 255,
                           brown     -> [(186,104,43),  (152,74,16),   (117,50,0),    (80,34,0),    (42,18,0)]    / 255,
                           pink      -> [(255,246,255), (253,181,253), (248,131,248), (240,90,240), (225,52,225)] / 255,
                           grey      -> [(224,224,224), (172,172,172), (128,128,128), (78,78,78),   (36,35,35)]   / 255
    );
    aliceColor(name, bright) := get(aliceColorTable, name)_(3 - bright);
    aliceColor(name)         := get(aliceColorTable, name)_3;


    aliceColor = {};
    forall(["blue", "orange", "violet", "turquoise", "teal", "red", "green", "minion", "brown", "pink", "grey"], 
        aliceColor_# = reverse(get(aliceColorTable, #));
    );

    toolColor = {};
    forall(["blue", "violet", "red", "green", "grey"], 
        toolColor_# = reverse(get(toolColorTable, #));
    );


    hmColor = {
        "background": hex2rgb("151732"),
        "red": hex2rgb("fc5555"),
        "yellow": hex2rgb("FFFF00"),
        "green": hex2rgb("4AD386"),
        "darkgreen": hex2rgb("006D6D"),
        "teal": hex2rgb("50DDDC"),
        "brightblue": hex2rgb("00B4E6"),
        "blue": hex2rgb("3E46D9"),
        "darkblue": hex2rgb("2F109D"),
        "violet": hex2rgb("9170FF")
    };


    sapColor = {
        "black": hex2rgb("000000"),
        "grey1": hex2rgb("7f7f7f"),
        "gray1": hex2rgb("7f7f7f"),
        "grey2": hex2rgb("aaaaaa"),
        "gray2": hex2rgb("aaaaaa"),
        "grey3": hex2rgb("d4d4d4"),
        "gray3": hex2rgb("d4d4d4"),
        "white": hex2rgb("ffffff"),

        "blue0": hex2rgb("19418c"),
        "blue1": hex2rgb("0c5aa6"),
        "blue2": hex2rgb("2b8dbd"),
        "blue3": hex2rgb("4ac1d4"),
        
        "orange0": hex2rgb("e66317"),
        "orange1": hex2rgb("ff8c00"),
        "orange2": hex2rgb("ffba31"),
        "orange3": hex2rgb("ffe863"),
        
        "green0": hex2rgb("2b911c"),
        "green1": hex2rgb("43ba10"),
        "green2": hex2rgb("7dd233"),
        "green3": hex2rgb("b7eb57"),
        
        "violet0": hex2rgb("703799"),
        "violet1": hex2rgb("9e3ecc"),
        "violet2": hex2rgb("c7778e5"),
        "violet3": hex2rgb("f1b3ff"),
        
        "red0": hex2rgb("a11208"),
        "red1": hex2rgb("d71318"),
        "red2": hex2rgb("e94859"),
        "red3": hex2rgb("fc7e9a"),

        "teal0": hex2rgb("0a5e66"),
        "teal1": hex2rgb("008077"),
        "teal2": hex2rgb("08a67e"),
        "teal3": hex2rgb("23d98d"),
        
        "background": hex2rgb("1a2345")
    };


    sapColorHex = {
        "black": "#000000",
        "grey1": "#7f7f7f",
        "gray1": "#7f7f7f",
        "grey2": "#aaaaaa",
        "gray2": "#aaaaaa",
        "grey3": "#d4d4d4",
        "gray3": "#d4d4d4",
        "white": "#ffffff",

        "blue0": "#19418c",
        "blue1": "#0c5aa6",
        "blue2": "#2b8dbd",
        "blue3": "#4ac1d4",
        
        "orange0": "#e66317",
        "orange1": "#ff8c00",
        "orange2": "#ffba31",
        "orange3": "#ffe863",
        
        "green0": "#2b911c",
        "green1": "#43ba10",
        "green2": "#7dd233",
        "green3": "#b7eb57",
        
        "violet0": "#703799",
        "violet1": "#9e3ecc",
        "violet2": "#c778e5",
        "violet3": "#f1b3ff",
        
        "red0": "#a11208",
        "red1": "#d71318",
        "red2": "#e94859",
        "red3": "#fc7e9a",

        "teal0": "#0a5e66",
        "teal1": "#008077",
        "teal2": "#08a67e",
        "teal3": "#23d98d",
        
        "background": "#1a2345"
    };