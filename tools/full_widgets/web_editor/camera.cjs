/* These need a camera object of the form
camera = {
    "rad": 60,
    "azimuth": 32°,
    "polar": 51°,
    "lookAt": [0,0,0],
    "up": [0, 0, 1],
    "fov": 60°,
    "anchor": [0,0,0],
    "position": [0,0,0],
    "basis": zeroMatrix(3, 3);
};
*/



newCamera(r, a, p) := (
    regional(res);

    res = {
        "rad": r,
        "azimuth": a,
        "polar": p,
        "lookAt": [0,0,0],
        "up": [0, 0, 1],
        "fov": 60°,
        "anchor": [0,0,0],
        "position": [0,0,0],
        "basis": zeroMatrix(3, 3);
    };
    updateCamera(res);

    res;
);





screenWidth = 1920 / screenresolution();
screenCenter = [0, 0];


sphericalCoordinates(radius, azimuth, polar) := radius * [cos(azimuth) * sin(polar), sin(azimuth) * sin(polar), cos(polar)];




cameraBasis(cam) := (
    regional(backward, right);

    backward = cam.position - cam.lookAt;
    backward = backward / abs(backward);

    right = cross(cam.up, backward);
    right = right / abs(right);

    transpose([right, cross(backward, right), backward]);
);




projectToScreen(p, camPosition, camBasis, camFOV) := (
    p = transpose(camBasis) * (p - camPosition);
    p = if(camFOV == 0,
        [p.x, p.y]
    , // else //
        - p / p.z / tan(camFOV / 2) * screenWidth / 2;
    );

    screenCenter + [p.x, p.y];
);
projectToScreen(p, cam) := projectToScreen(p, cam.position, cam.basis, cam.fov);





liftTo3D(p, camPosition, camBasis, camFOV) := (
    regional(t);

    t = tan(camFOV / 2) * 2 / screenWidth;

    p = p - screenCenter;

    camBasis * [t * p.x, t * p.y, -1] + camPosition;
);
liftTo3D(p, cam) := liftTo3D(p, cam.position, cam.basis, cam.fov);




updateCamera(cam) := (
    cam.position = cam.anchor + sphericalCoordinates(cam.rad, cam.azimuth, cam.polar);
    cam.basis = cameraBasis(cam);
);

