let scene = null;
let renderer = null;
let camera = null;
let character = null;

let animations = {};
let animation = null;

let sphere_cursor = null

//load some animations
function loadAnimation( name, url )
{
	let anim = animations[name] = new RD.SkeletalAnimation();
	anim.load(url);
	return anim;
}

function init(username)
{
	//create the rendering context
	let context = GL.create({width: window.innerWidth, height:window.innerHeight});

	//setup renderer
	renderer = new RD.Renderer(context);
	renderer.setDataFolder("view/data");
	renderer.autoload_assets = true;

	//attach canvas to DOM
	document.body.appendChild(renderer.canvas);

	//create a scene
	scene = new RD.Scene();

	//create camera
	camera = new RD.Camera();
	camera.perspective( 60, gl.canvas.width / gl.canvas.height, 0.1, 1000 );
	camera.lookAt( [0,40,100],[0,20,0],[0,1,0] );

	//global settings
	let bg_color = [0.1,0.1,0.1,1];

	//create material for the girl
	let mat = new RD.Material({
		textures: {
			color: "girl/girl.png" }
		});
	mat.register("girl");

	//create pivot point for the girl
	let girl_pivot = new RD.SceneNode({
		position: [-40,0,0],
		name: "girl"
	});

	//create a mesh for the girl
	let girl = new RD.SceneNode({
		scaling: 0.3,
		mesh: "girl/girl.wbin",
		material: "girl",
	});
	girl_pivot.addChild(girl);
	girl.skeleton = new RD.Skeleton();

	WORLD.setUserSceneNode(username, girl_pivot);
	scene.root.addChild( girl_pivot );

	//Create a selector for the character
	let girl_selector = new RD.SceneNode({
		position: [0, 0, 0],
		mesh: "cube",
		material: "girl",
		scaling: [10, 80, 10],
		name: "girl_selector",
		layers: 0b1000
	})
	girl_pivot.addChild(girl_selector);

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

	loadAnimation("girl_idle","view/data/girl/idle.skanim");
	loadAnimation("girl_walking","view/data/girl/walking.skanim");
	loadAnimation("girl_dance","view/data/girl/dance.skanim");

	//load a GLTF for the room
	let room = new RD.SceneNode({scaling:40});
	room.loadGLTF("view/data/room.gltf");
	scene.root.addChild( room );

	// main loop ***********************

	//main draw function
	context.ondraw = function(){
		gl.canvas.width = document.body.offsetWidth;
		gl.canvas.height = document.body.offsetHeight;
		gl.viewport(0,0,gl.canvas.width,gl.canvas.height);

		//find where to place the camera based
		let campos = character.localToGlobal([0,100,-80]);

		//find where to point at the camera
		let camtarget = character.localToGlobal([0,50,-10]);

		let smoothtarget = vec3.lerp(vec3.create(), camera.target, camtarget, 0.02)

		//use to set up camera
		camera.lookAt( campos, smoothtarget, [0,1,0] );


		if(fastClick) {
			sphere_cursor.flags.visible = true
		} else {
			sphere_cursor.flags.visible = false
		}

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
		let t = getTime();
		let anim = animations.idle;
		let time_factor = 1;

		//control with keys
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


		camera.perspective( 60, gl.canvas.width / gl.canvas.height, 0.1, 1000 );

		//move bones in the skeleton based on animation
		//anim.assignTime( t * 0.001 * time_factor );
		//copy the skeleton in the animation to the character
		//character.skeleton.copyFrom( anim.skeleton );
	}

	//user input ***********************

	configureInputs(context, girl_pivot)

	//launch loop
	context.animate();

}

/* example of computing movement vector
	let delta = vec3.sub( vec3.create(), target, sprite.position );
	vec3.normalize(delta,delta);
	vec3.scaleAndAdd( sprite.position, sprite.position, delta, dt * 50 );
	sprite.updateMatrices();
	sprite.flags.flipX = delta[0] < 0;
*/
