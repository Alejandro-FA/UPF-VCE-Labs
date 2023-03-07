let fastClick = false;

/**
 * Manages mouse events
 * @param context
 * @param character
 */
function configureInputs(context, character) {
	context.onmouseup = function(e)
	{
		if(e.click_time < 200) //fast click
		{
			//compute collision with floor plane
			let ray = camera.getRay(e.canvasx, e.canvasy);
			if( ray.testPlane( RD.ZERO, RD.UP ) ) //collision
			{
                console.log("Girl position", character.position);
				console.log( "floor position clicked", ray.collision_point );

                WORLD.setThisUserTarget(ray.collision_point)
				sphere_cursor.position = ray.collision_point
				

				//Show the cursor during 1 second
				fastClick = true
				setTimeout(() => {
					fastClick = false
				}, 1000)


				//Check if the click is on the canvas
				if(e.target.nodeName == "CANVAS"){
					
					let username = WORLD.username
					let myuser = WORLD.users[username]
					let msg = {
						room: WORLD.room_name,
						type: "MOVE",
						username: username,
						content: myuser.toJson(),
						userID: MYCHAT.server.user_id
					}
	
					MYCHAT.server.sendMessage(msg)
				}
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
