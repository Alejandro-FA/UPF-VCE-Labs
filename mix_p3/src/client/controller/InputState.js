let fastClick = false;
let freeze = false
let dance = {}

/**
 * Manages mouse events
 * @param context
 * @param character
 */
function configureInputs(context, character) {
	context.onmouseup = function(e)
	{
		if(e.click_time < 200 && !freeze) //fast click
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
					sendDanceMessage(WORLD.room_name, WORLD.username, MYCHAT.server.user_id)
					dance[WORLD.username] = true
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
		//console.log("floor position clicked", ray.collision_point);

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

	let main = document.querySelector("main");
	let room_list_container = document.createElement("div")
	room_list_container.className = "blurred-background"
	room_list_container.addEventListener("click", (event) => {
		hideRoomChooser();
	})

	main.appendChild(room_list_container)

	let room_list = document.createElement("div")
	room_list.classList.add("choose-room")
	room_list.classList.add("card")
	room_list_container.appendChild(room_list)

	let h2 = document.createElement("h2")
	h2.innerHTML = "Choose the room where you want to go to:"
	h2.classList.add("card-header")
	room_list.appendChild(h2)

	let card_body = document.createElement("div")
	card_body.classList.add("card-body")

	for (let room in WORLD.world) {
		let node = document.createElement("li")
		node.innerHTML = `${room} room`
		node.classList.add("room")
		node.classList.add("btn")
		node.classList.add("btn-primary")
		node.classList.add("m-2")
		if(room === this.room_name) node.classList.add("selected")
		node.addEventListener("click", (event) => {
			WORLD.changeRoom(room)
			hideRoomChooser()
		})
		card_body.appendChild(node)
	}
	room_list.appendChild(card_body)
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

	let main = document.querySelector("main");
	let character_list_container = document.createElement("div")
	character_list_container.className = "blurred-background"
	character_list_container.addEventListener("click", (event) => {
		hideCharacterChooser();
	})

	main.appendChild(character_list_container)

	let character_list = document.createElement("div")
	character_list.classList.add("choose-character")
	character_list.classList.add("card")
	character_list_container.appendChild(character_list)

	let h2 = document.createElement("h2")
	h2.innerHTML = "Choose the character that you want to be:"
	h2.classList.add("card-header")
	character_list.appendChild(h2)

	let card_body = document.createElement("div")
	card_body.classList.add("card-body")

	for (let character_name in character_scalings) {

		let node = document.createElement("img")
		node.src = `view/data/${character_name}/preview.png`
		node.className = "character"

		node.addEventListener("click", (event) => {

			//Update the sceneNode
			let username = WORLD.username
			scene.root.removeChild(SCENE_NODES[username])
			character = WORLD.createCharacter(character_name, username, SCENE_NODES[username].position, character_scalings[character_name], true)

			hideCharacterChooser();
			sendSkinMessage(WORLD.room_name, WORLD.username, character_name, MYCHAT.server.user_id)
		})
		card_body.appendChild(node)
	}
	character_list.appendChild(card_body)
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
 */
function showSongChooser() {
	let body = document.querySelector("main");
	let song_list_container = document.createElement("div")
	song_list_container.className = "blurred-background"
	song_list_container.addEventListener("click", (event) => {
		hideSongChooser();
	})

	body.appendChild(song_list_container)

	let song_list = document.createElement("div")
	song_list.classList.add("choose-song")
	song_list.classList.add("card")

	song_list_container.appendChild(song_list)

	let h2 = document.createElement("h2")
	h2.classList.add("card-header")
	h2.innerHTML = "Choose the song you want to sing:"
	song_list.appendChild(h2)

	let card_body = document.createElement("div")
	card_body.classList.add("card-body")

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
		node.classList.add("btn")
		node.classList.add("btn-primary")
		node.classList.add("m-2")

		node.appendChild(title)
		node.appendChild(artist)

		node.addEventListener("click", (event) => {

			song.sing()

			WORLD.teleportUser(WORLD.username, vec3.fromValues(-54, 0, 195), vec3.fromValues(0.001, 0,-1))
			freeze = true
			hideSongChooser()

		})
		card_body.appendChild(node)
	}
		song_list.appendChild(card_body)
}

/**
 * Hide the song choosing interface
 */
function hideSongChooser() {
	let song_chooser = document.querySelector(".blurred-background")
	song_chooser?.remove()
}