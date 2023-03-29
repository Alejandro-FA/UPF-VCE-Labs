let scene = null;
let renderer = null;
let camera = null;
let character = null;

let animations = {};
let animation = null;

let sphere_cursor = null

let loading = true

//Mapping the characters to their appropriate scaling
let character_scalings = {"cat": 5, "girl": 0.4, "ninja": 0.4}

//load some animations
function loadAnimation( name, url )
{
	let anim = animations[name] = new RD.SkeletalAnimation();
	anim.load(url);
	return anim;
}
function init(username, room_url, character_name, position)
{


	//create the rendering context
	let context = GL.create({width: window.innerWidth, height:window.innerHeight});

	//setup renderer
	renderer = new RD.Renderer(context);
	renderer.setDataFolder("view/data");
	renderer.autoload_assets = true;
	renderer.loadShaders("../shaders.txt")

	//attach canvas to DOM
	let main = document.querySelector("main")
	main.appendChild(renderer.canvas);
	//create a scene
	scene = new RD.Scene();

	//create camera
	camera = new RD.Camera();
	camera.perspective( 60, gl.canvas.width / gl.canvas.height, 0.01, 1000 );
	camera.lookAt( [0,40,100],[0,20,0],[0,1,0] );

	//global settings
	let bg_color = [0.1,0.1,0.1,1];

	//Create character
	let girl_pivot = WORLD.createCharacter(character_name, username, position, character_scalings[character_name])

	character = girl_pivot;

	//Create a cursor

	sphere_cursor = new RD.SceneNode({
		position: [0, 0, 0],
		mesh: "sphere",
		color: [0, 255, 0, 0],
		scaling: 5,
		name: "sphere_cursor",
		layers: 0b100
	})

	scene.root.addChild(sphere_cursor)

	//load a GLTF for the room
	let room = new RD.SceneNode({scaling:10, name: "room"});
	room.loadGLTF(room_url);
	scene.root.addChild( room );

	//Attach selectors to the interactive objects ***************************

	//Create a selector for the micro - Done

	let micro_selector = new RD.SceneNode({
		position: [-54, 0, 166],
		mesh: "cube",
		material: "girl",
		scaling: [15, 125, 15],
		name: "micro_selector",
		layers: 0b1000
	})
	scene.root.addChild(micro_selector);

	//Create a selector for the door - Done

	let door_selector = new RD.SceneNode({
		position: [100, 0, -42],
		mesh: "cube",
		material: "girl",
		scaling: [10, 160, 50],
		name: "door_selector",
		layers: 0b1000
	})
	scene.root.addChild(door_selector);

	//Create a selector for the closet - Done

	let closet_selector = new RD.SceneNode({
		position: [-182, 0, 39],
		mesh: "cube",
		material: "girl",
		scaling: [20, 130, 42],
		name: "closet_selector",
		layers: 0b1000
	})
	scene.root.addChild(closet_selector);

	// main loop ***********************

	//We want the height of the main section but the width of the whole screen
	gl.canvas.width = main.offsetWidth;
	gl.canvas.height = main.offsetHeight;
	//main draw function
	context.ondraw = function(){
		gl.canvas.width = main.offsetWidth;
		gl.viewport(0,0,gl.canvas.width,gl.canvas.height);

		//find where to place the camera based
		let campos = character.localToGlobal([0, 180, -120]);

		let smoothpos = vec3.lerp(vec3.create(), camera.position, campos, 0.02)

		//find where to point at the camera
		let camtarget = character.localToGlobal([0,65,-10]);

		let smoothtarget = vec3.lerp(vec3.create(), camera.target, camtarget, 0.02)

		if (!loading) {
			//use to set up camera
			camera.lookAt( smoothpos, smoothtarget, [0,1,0] );
		} else {
			camera.lookAt( campos, camtarget, [0,1,0] );
			//let user = WORLD.users[WORLD.username]; //RAQUEL LUKA
			//user.target = user.position;
		}

		for (let node in SCENE_NODES) {
			let pivot = SCENE_NODES[node]
			//Because sometimes at loading the SceneNode the character is flipped
			if(pivot._local_matrix[5] === -1 ) pivot._local_matrix[5] *= -1
			if(pivot._local_matrix[10] === -1) pivot._local_matrix[10] *= -1
		}

		sphere_cursor.flags.visible = fastClick;

		//clear
		renderer.clear(bg_color);
		//render scene
		renderer.render(scene, camera, null, 0b111);
	}

	//main update
	context.onupdate = function(dt)
	{
		//not necessary but just in case...
		scene.update(dt);

		WORLD.update(dt);

		camera.perspective( 60, gl.canvas.width / gl.canvas.height, 100, 1000 );

	}

	//user input ***********************

	configureInputs(context, girl_pivot)

	//launch loop
	context.animate();

}

setTimeout(() => {
	loading = false
}, 1000)