var fastClick = false;
//Detect clicks
function configureInputs(context, character) {
	context.onmouseup = function(e)
	{
		if(e.click_time < 200) //fast click
		{
			//compute collision with floor plane
			var ray = camera.getRay(e.canvasx, e.canvasy);
			if( ray.testPlane( RD.ZERO, RD.UP ) ) //collision
			{
                console.log("Girl position", character.position);
				console.log( "floor position clicked", ray.collision_point );

                WORLD.setThisUserTarget(ray.collision_point)
				sphere_cursor.position = ray.collision_point
				
				var delta = vec3.sub(vec3.create(), ray.collision_point, character.position)
				//Face the wanted direction
				delta[0] = -delta[0]
				character.orientTo(delta, false, [0, 1, 0], true)

				//Show the cursor during 1 second
				fastClick = true
				setTimeout(() => {
					fastClick = false
				}, 1000)


				//Check if the click is on the canvas
				if(e.target.nodeName == "CANVAS"){
					
					let myuser = WORLD.users[WORLD.username]
					let username = WORLD.username
					let msg = {
						room: WORLD.room_name,
						type: "MOVE",
						username: username,
						content: {
							character: SCENE_NODES[username].name,
							scaling: SCENE_NODES[username].children[0].scaling,
							position: SCENE_NODES[username].position,
							target: myuser.target,
							anim: "walking"
						},
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
