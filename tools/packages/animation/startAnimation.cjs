

if(mod(length(trackData), 2) == 0,
    trackData = trackData :> defaultPause;
);

tracks = setupMultiAnimationTracks(trackData);

forall(tracks, 
    #.started = false;
    #.ended = false;
);


numberOfTracks = length(tracks);

forall(1..numberOfTracks, parse("t" + # + " = " + 0 + ";"));

now() := totalTime;



totalDuration = sum(trackData);

currentTrackIndex = startTrack;





// *****


// big = [L,R], intervals = list of [s,e]
findGaps(L, R, intervals) := (
  regional(gaps, clamped, merged, cur, i, s, e, gstart, gend);

  gaps = [];

  // no inner intervals → whole big interval is a gap
  if(length(intervals) == 0,
    [[L, R]];
  , // else //

    // 1. clamp intervals to [L,R] and discard those completely outside
    clamped = [];
    forall(intervals, cur,
      s = cur_1;
      e = cur_2;
      if(!(e < L % s > R),
        s = max(s, L);
        e = min(e, R);
        clamped = clamped ++ [[s, e]];
      );
    );

    if(length(clamped) == 0,
      [[L, R]];
    , // else //

      // 2. sort clamped by start coordinate
      clamped = sort(clamped, #_1);

      // 3. merge overlapping/touching intervals
      merged = [];
      cur = clamped_1;
      forall(2..length(clamped), i,
        s = clamped_i_1;
        e = clamped_i_2;
        if(s <= cur_2,
          // overlap or touch: extend current
          cur_2 = max(cur_2, e);
        ,
          // disjoint: store previous and start new
          merged = merged :> cur;
          cur = [s, e];
        );
      );
      merged = merged ++ [cur];

      // 4. collect gaps inside [L,R]

      // gap before first merged interval
      if(L < merged_1_1,
        gaps = gaps :> [L, merged_1_1];
      );

      // gaps between merged intervals
      forall(2..length(merged), i,
        gstart = merged_(i - 1)_2;
        gend   = merged_i_1;
        if(gstart < gend,
          gaps = gaps :> [gstart, gend];
        );
      );

      // gap after last merged interval
      if(merged_(length(merged))_2 < R,
        gaps = gaps :> [merged_(length(merged))_2, R];
      );

      gaps;
    );
  );
);




// ****


if(renderMode == RENDERMODES.STEPS,
    stepGaps = findGaps(0, totalDuration, apply(tracks, [#.start, #.end]));
);


if(renderMode == RENDERMODES.FRAMES,
    frameCount = if(startTrack > 1, floor(tracks_startTrack.start * 60) - 1, 0);
    maxFrames = ceil(60 * totalDuration);
);






if(renderMode == RENDERMODES.REAL,
    totalTime = if(startTrack > 1, sum(trackData_(1 .. 2 * (startTrack - 1))), 0);
    setupTime();
    playanimation();
    calculate(0);
);

if(renderMode == RENDERMODES.FRAMES,
    totalTime = if(startTrack > 1, sum(trackData_(1 .. 2 * (startTrack - 1))), 0);
    calculate(0);
);


if(renderMode == RENDERMODES.STEPS,
    totalTime = if(startTrack > 1, sum(trackData_(1 .. 2 * (startTrack - 1))), 0);
    currentGap = 1;
    setupTime();
    playanimation();
    calculate(0);
);

