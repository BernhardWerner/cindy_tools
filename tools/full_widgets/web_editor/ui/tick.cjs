mouseScriptIndicator = "Tick";

uiDelta = computerSeconds() - uiTime;
uiTime = computerSeconds();

/*
fpsBuffer = fpsBuffer :> 1 / uiDelta;
if(length(fpsBuffer) > 60,
fpsBuffer = fpsBuffer_(-60..-1);
);
println(format(sum(fpsBuffer) / length(fpsBuffer), 0));
uiDelta = 1/60;
*/

forall(uiCollection, #.animate);