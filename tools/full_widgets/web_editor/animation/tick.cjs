if(renderMode == RENDERMODES.FRAMES,
    delta = 1/60;
    if(frameRenderState == FRAMERENDERSTATES.EXPORTING,
        if(frameExportTimer > 0,
            frameExportTimer = frameExportTimer - 1;
        , // else //
            continueAnimation();
        );
    );
, // else //
    if(katexLoaded & 0 <= totalTime & totalTime <= totalDuration,
        if(renderMode == RENDERMODES.REAL,
            delta = deltaTime();  
            fpsBuffer = fpsBuffer :> 1 / delta;
            if(length(fpsBuffer) > 30, fpsBuffer = bite(fpsBuffer));
            
            calculate(delta);
        );

        if(renderMode == RENDERMODES.STEPS,
            delta = deltaTime();
            if(stepRenderState == STEPRENDERSTATES.RUNNING,
                fpsBuffer = fpsBuffer :> 1 / delta;
                if(length(fpsBuffer) > 30, fpsBuffer = bite(fpsBuffer));

                calculate(delta);

                if(stepRenderState == STEPRENDERSTATES.RUNNING,
                    hitGap = 0;
                    forall(stepGaps, gap, index,
                        if(gap_1 < totalTime & totalTime < gap_2,
                            hitGap = index;
                        );
                    );
                    if(hitGap > 0 & hitGap != currentGap,
                        stepRenderState = STEPRENDERSTATES.WAITING;
                        currentGap = hitGap;
                    );
                );
            );
        );

    , // else //
        if(pixelsize(katexForceString)_1 < katexBufferWidth,
            katexLoaded = true;
            delayedSetup();
        , // else //
            delayedSetup();
        );
    );
);

