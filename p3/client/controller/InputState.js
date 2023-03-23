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
			let result = vec3.create();

			let node = scene.testRay(ray, result, undefined, 0b1000, true)

			//If there is no collision with the selectors, compute collision with the floor
			if(node === null) {
				floor_clicked(e, ray);
				return
			}

			switch (node.name) {
				case "character_selector":
					console.log("Hit clicked on the character")
					break;

				case "closet_selector":
					console.log("Hit clicked on the closet")
					showCharacterChooser();
					break

				case "micro_selector":
					console.log("Hit clicked on the micro")
					showSongChooser();
					break

				case "door_selector":
					console.log("Hit clicked on the door")
					showRoomChooser();
					break

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


/**
 * This function manages everything when the floor is clicked
 * @param e The click event
 * @param ray The computed ray
 */
function floor_clicked(e, ray) {
	if( ray.testPlane( RD.ZERO, RD.UP ) ) //collision
	{
		console.log("floor position clicked", ray.collision_point);

		//Check if the click is on the canvas
		if (e.target.nodeName === "CANVAS") {
			WORLD.setThisUserTarget(ray.collision_point)
			sphere_cursor.position = ray.collision_point


			//Show the cursor during 1 second
			fastClick = true
			setTimeout(() => {
				fastClick = false
			}, 1000)

			let username = WORLD.username
			let myuser = WORLD.users[username]
			sendMoveMessage(WORLD.room_name, username, myuser.toJson(), MYCHAT.server.user_id)
		}
	}
}

/**
 * Show the room choosing interface
 */
function showRoomChooser() {

	let body = document.body;
	let room_list_container = document.createElement("div")
	room_list_container.className = "blurred-background"
	room_list_container.addEventListener("click", (event) => {
		hideRoomChooser();
	})

	body.appendChild(room_list_container)

	let room_list = document.createElement("div")
	room_list.className = "choose-room"
	room_list_container.appendChild(room_list)

	let h3 = document.createElement("h3")
	h3.innerHTML = "Choose the room where you want to go to:"
	room_list.appendChild(h3)

	for (let room in WORLD.world) {
		let node = document.createElement("li")
		node.innerHTML = `${room} room`
		node.classList.add("room")
		if(room === this.room_name) node.classList.add("selected")
		node.addEventListener("click", (event) => {
			WORLD.changeRoom(room)
			hideRoomChooser()
		})
		room_list.appendChild(node)
	}
}

/**
 * Hide the room choosing interface
 */
function hideRoomChooser() {
	let room_chooser = document.querySelector(".blurred-background")
	room_chooser?.remove()
}

/**
 * Show the character choosing interface
 */
function showCharacterChooser() {

	let body = document.body;
	let character_list_container = document.createElement("div")
	character_list_container.className = "blurred-background"
	character_list_container.addEventListener("click", (event) => {
		hideCharacterChooser();
	})

	body.appendChild(character_list_container)

	let character_list = document.createElement("div")
	character_list.className = "choose-character"
	character_list_container.appendChild(character_list)

	let h3 = document.createElement("h3")
	h3.innerHTML = "Choose the character that you want to be:"
	character_list.appendChild(h3)

	for (let character_name in character_scalings) {

		let node = document.createElement("img")
		node.src = `/p3/client/view/data/${character_name}/preview.png`
		node.className = "character"

		node.addEventListener("click", (event) => {

			//Update the sceneNode
			let username = WORLD.username
			scene.root.removeChild(SCENE_NODES[username])
			character = WORLD.createCharacter(character_name, username, SCENE_NODES[username].position, character_scalings[character_name])

			hideCharacterChooser();
			sendSkinMessage(WORLD.room_name, WORLD.username, character_name, MYCHAT.server.user_id)
		})
		character_list.appendChild(node)
	}
}

/**
 * Hide the character choosing interface
 */
function hideCharacterChooser() {
	let character_chooser = document.querySelector(".blurred-background")
	character_chooser?.remove()
}

/**
 * Show the song choosing interface
 * TODO: Adapt to the needed song structure
 */
function showSongChooser() {
	let body = document.body;
	let song_list_container = document.createElement("div")
	song_list_container.className = "blurred-background"
	song_list_container.addEventListener("click", (event) => {
		hideSongChooser();
	})

	body.appendChild(song_list_container)

	let song_list = document.createElement("div")
	song_list.className = "choose-song"
	song_list_container.appendChild(song_list)

	let h3 = document.createElement("h3")
	h3.innerHTML = "Choose the song you want to sing:"
	song_list.appendChild(h3)

	for (let i = 0; i < WORLD.room.songs.length; i++) {
		let song = WORLD.room.songs[i]

		let title = document.createElement("div")
		title.className = "song-title"
		title.innerHTML = song.title

		let artist = document.createElement("div")
		artist.className = "song-artist"
		artist.innerHTML = song.artist

		let node = document.createElement("li")
		node.classList.add("song")

		node.appendChild(title)
		node.appendChild(artist)

		node.addEventListener("click", (event) => {

			//TODO: Add the necessary code for songs
			song.play()
			hideSongChooser()
		})

		song_list.appendChild(node)
	}
}

/**
 * Hide the song choosing interface
 */
function hideSongChooser() {
	let song_chooser = document.querySelector(".blurred-background")
	song_chooser?.remove()
}