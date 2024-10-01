/* These need a camera object  of the form
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
    p = - p / p.z / tan(camFOV / 2) * canvasWidth / 2;

    canvasCenter + [p.x, p.y];
);
projectToScreen(p, cam) := projectToScreen(p, cam.position, cam.basis, cam.fov);





liftTo3D(p, camPosition, camBasis, camFOV) := (
    regional(t);

    t = tan(camFOV / 2) * 2 / canvasWidth;

    p = p - canvasCenter;

    camBasis * [t * p.x, t * p.y, -1] + camPosition;
);
liftTo3D(p, cam) := liftTo3D(p, cam.position, cam.basis, cam.fov);




updateCamera(cam) := (
    cam.position = cam.anchor + sphericalCoordinates(cam.rad, cam.azimuth, cam.polar);
    cam.basis = cameraBasis(cam);
);

