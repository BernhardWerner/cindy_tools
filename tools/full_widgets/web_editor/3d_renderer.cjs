a = 0;
b = 0;
c = -10;
r = 3;
D = 7;

drawScene() := (
	colorplot(
    	color = [0,0,0];
      	disc = (a*#.x + b*#.y + c*D)^2 - (#.x^2 + #.y^2 + D^2)*(a^2 + b^2 + c^2 - r^2);
      	if(disc >= 0,
	      	t = (-sqrt(disc) + a*#.x + b*#.y + c*D)/(#.x^2 + #.y^2 + D^2);
    	  	hitPoint = t * [#.x, #.y, D];
      		color = [1,1,1];
      	);

  		color;
    );
);