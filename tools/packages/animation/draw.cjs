rendering();

if(showDebugInfo,
    drawtext(debugInfoPosition + [0, 1.5], format(now(),2), size -> 25, color -> debugInfoColor);
    if(renderMode == RENDERMODES.REAL % renderMode == RENDERMODES.STEPS,
      drawtext(debugInfoPosition, round(sum(fpsBuffer) / length(fpsBuffer)), size -> 25, color -> debugInfoColor);
    );
  );
  
triggerScreenshot();
  

