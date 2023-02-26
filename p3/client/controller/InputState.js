//Detect clicks
function configureInputs(context) {
	context.onmouseup = function(e)
	{
		if(e.click_time < 200) //fast click
		{
			//compute collision with floor plane
			var ray = camera.getRay(e.canvasx, e.canvasy);
			if( ray.testPlane( RD.ZERO, RD.UP ) ) //collision
			{
				console.log( "floor position clicked", ray.collision_point );
			}
		}
	}

	context.onmousemove = function(e)
	{
		if(e.dragging)
		{
			//orbit camera around
			//camera.orbit( e.deltax * -0.01, RD.UP );
			//camera.position = vec3.scaleAndAdd( camera.position, camera.position, RD.UP, e.deltay );
			camera.move([-e.deltax*0.1, e.deltay*0.1,0]);
		}
	}

	context.onmousewheel = function(e)
	{
		//move camera forward
		camera.moveLocal([0,0,e.wheel < 0 ? 10 : -10] );
	}

	//capture mouse events
	context.captureMouse(true);
	context.captureKeys();
}

//Detect keys
function manageKeys(gl, character, animations, time_factor, dt) {
    if(gl.keys["UP"])
    {
        character.moveLocal([0,0,1]);
        anim = animations.walking;
    }
    else if(gl.keys["DOWN"])
    {
        character.moveLocal([0,0,-1]);
        anim = animations.walking;
        time_factor = -1;
    }
    if(gl.keys["LEFT"])
        character.rotate(90*DEG2RAD*dt,[0,1,0]);
    else if(gl.keys["RIGHT"])
        character.rotate(-90*DEG2RAD*dt,[0,1,0]);
    
}