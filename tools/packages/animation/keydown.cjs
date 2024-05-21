key = key();
if(key == STEPFORWARDS,
    if(stepRenderState == STEPRENDERSTATES.WAITING & currentTrackIndex <= numberOfTracks,
        stepRenderState = STEPRENDERSTATES.RUNNING;
    );
);

if(key == SKIPFORWARDS,
    if(stepRenderState == STEPRENDERSTATES.WAITING & currentTrackIndex <= numberOfTracks,
        calculate(trackData_(2 * currentTrackIndex - 1) + trackData_(2 * currentTrackIndex));
        currentTrackIndex = currentTrackIndex + 1;
    );
);

if(key == SKIPBACKWARDS,
    if(stepRenderState == STEPRENDERSTATES.WAITING & currentTrackIndex > 1,
        currentTrackIndex = currentTrackIndex - 1;    
        calculate(-trackData_(2 * currentTrackIndex) -trackData_(2 * currentTrackIndex - 1));
    );
);
