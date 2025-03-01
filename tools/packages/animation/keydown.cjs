if(stepMode == STEPMODES.KEYBOARD,
    key = key();
    
    if(key == STEPFORWARDS,
        moveStepForwards();
    );
    
    if(key == SKIPFORWARDS,
        skipStepForwards();
    );
    
    if(key == SKIPBACKWARDS,
        skipStepBackwards();
    );    

    if(key == RELOAD,
        reload();
    );
);