if(katexLoaded,
  rendering();

  if(showDebugInfo,
      drawtext(debugInfoPosition, "Track number: " + currentTrackIndex + "/" + numberOfTracks, size -> 25, color -> debugInfoColor);
      drawtext(debugInfoPosition + [0, -1.5], "Track progress: " + format(parse("t" + min(numberOfTracks, currentTrackIndex)), 2), size -> 25, color -> debugInfoColor);
      drawtext(debugInfoPosition + [0, -3], "Total time: " + format(now(),2), size -> 25, color -> debugInfoColor);
      if(renderMode == RENDERMODES.REAL % renderMode == RENDERMODES.STEPS,
        drawtext(debugInfoPosition + [0, -4.5], "FPS: " + round(sum(fpsBuffer) / length(fpsBuffer)), size -> 25, color -> debugInfoColor);
      );
      
    );
    
  triggerScreenshot();  
);