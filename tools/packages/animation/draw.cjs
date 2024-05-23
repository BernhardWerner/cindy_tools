rendering();

if(showDebugInfo,
    drawtext(debugInfoPosition, "Track number: " + currentTrackIndex, size -> 25, color -> debugInfoColor);
    drawtext(debugInfoPosition + [0, -1.5], "Time: " + format(now(),2), size -> 25, color -> debugInfoColor);
    if(renderMode == RENDERMODES.REAL % renderMode == RENDERMODES.STEPS,
      drawtext(debugInfoPosition + [0, -3], "FPS: " + round(sum(fpsBuffer) / length(fpsBuffer)), size -> 25, color -> debugInfoColor);
    );
    
  );
  
triggerScreenshot();
  

