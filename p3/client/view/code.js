var scene = null;
var renderer = null;
var camera = null;
var character = null;

var animations = {};
var animation = null;

var sphere_cursor = null
function init(username)
{
	//create the rendering context
	var context = GL.create({width: window.innerWidth, height:window.innerHeight});

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
	var bg_color = [0.1,0.1,0.1,1];

	//create material for the girl
	var mat = new RD.Material({
		textures: {
			color: "girl/girl.png" }
		});
	mat.register("girl");

	//create pivot point for the girl
	var girl_pivot = new RD.SceneNode({
		position: [-40,0,0]
	});

	//create a mesh for the girl
	var girl = new RD.SceneNode({
		scaling: 0.3,
		mesh: "girl/girl.wbin",
		material: "girl"
	});
	girl_pivot.addChild(girl);
	girl.skeleton = new RD.Skeleton();
	world.setUserSceneNode(username, girl_pivot);
	scene.root.addChild( girl_pivot );

	//Create a selector for the character
	var girl_selector = new RD.SceneNode({
		position: [0, 0, 0],
		mesh: "cube",
		material: "girl",
		scaling: [20, 80, 20],
		name: "girl_selector",
		layers: 0b1000
	})
	girl_pivot.addChild(girl_selector);

	character = girl;

	//load some animations
	function loadAnimation( name, url )
	{
		var anim = animations[name] = new RD.SkeletalAnimation();
		anim.load(url);
		return anim;
	}
	loadAnimation("idle","view/data/girl/idle.skanim");
	loadAnimation("walking","view/data/girl/walking.skanim");
	loadAnimation("dance","view/data/girl/dance.skanim");

	//load a GLTF for the room
	var room = new RD.SceneNode({scaling:40});
	room.loadGLTF("view/data/room.gltf");
	scene.root.addChild( room );

	// main loop ***********************

	//main draw function
	context.ondraw = function(){
		gl.canvas.width = document.body.offsetWidth;
		gl.canvas.height = document.body.offsetHeight;
		gl.viewport(0,0,gl.canvas.width,gl.canvas.height);

		let campos = character_pivot.localToGlobal([0, 70, 40])
		let camtarget = camera.target
		camera.lookAt( camera.position, character_pivot.localToGlobal(), [0, 1, 0])
		//clear
		renderer.clear(bg_color);
		//render scene
		renderer.render(scene, camera);
	}

	//main update
	context.onupdate = function(dt)
	{
		//not necessary but just in case...
		scene.update(dt);

		world.update(dt);
		var t = getTime();
		var anim = animations.idle;
		var time_factor = 1;

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
	var delta = vec3.sub( vec3.create(), target, sprite.position );
	vec3.normalize(delta,delta);
	vec3.scaleAndAdd( sprite.position, sprite.position, delta, dt * 50 );
	sprite.updateMatrices();
	sprite.flags.flipX = delta[0] < 0;
*/
