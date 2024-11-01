mouseScriptIndicator = "Tick";

uiDelta = computerSeconds() - uiTime;
uiTime = computerSeconds();


forall(uiCollection, #.animate);