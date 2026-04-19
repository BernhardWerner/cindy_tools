if(stepMode == STEPMODES.KEYBOARD,
    key = key();
    
    timeScale = abs(timeScale);

    if(key == SKIPBACKWARDS,
        skipStepBackwards();
    );    

    if(key == MOVEBACKWARDS,
        moveStepBackwards();
    );

    if(key == MOVEFORWARDS,
        moveStepForwards();
    );
    
    if(key == SKIPFORWARDS,
        skipStepForwards();
    );
    


    if(key == RELOAD,
        reload();
    );
);