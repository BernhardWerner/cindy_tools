if(katexLoaded,
  render();

  if(showDebugInfo,
      trackIndex = currentTrack();
      drawtext(debugInfoPosition, "Track number: " + if(trackIndex == 0, "pause", trackIndex + "/" + numberOfTracks), size -> 25, color -> debugInfoColor);
      if(numberOfTracks > 0, drawtext(debugInfoPosition + [0, -1.5], "Track progress: " + if(trackIndex == 0, "", format(t(trackIndex), 2)), size -> 25, color -> debugInfoColor));
      drawtext(debugInfoPosition + [0, -3], "Total time: " + format(now(),2), size -> 25, color -> debugInfoColor);
      if(renderMode == RENDERMODES.REAL % renderMode == RENDERMODES.STEPS,
        drawtext(debugInfoPosition + [0, -4.5], "FPS: " + round(sum(fpsBuffer) / length(fpsBuffer)), size -> 25, color -> debugInfoColor);
      );
      
    );
    
  triggerScreenshot();  
);