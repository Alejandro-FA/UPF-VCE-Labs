class MyApp {
  constructor() {
    this.chat = MYCHAT;
    this.chat.init();

	let button = document.querySelector("button[name='register']")
	button.addEventListener("click", this.register.bind(this))

	button = document.querySelector("button[name='register-page']")
	button.addEventListener("click", ( event ) => {
		let connecting = document.querySelector(".connecting")
		let register = document.querySelector(".register")

		connecting.style.display = "none"
		register.style.display = "flex"
	})

	button = document.querySelector("button[name='login-page']")
	button.addEventListener("click", ( event ) => {
		let connecting = document.querySelector(".connecting")
		let register = document.querySelector(".register")

		connecting.style.display = "flex"
		register.style.display = "none"
	})
  }

	firstConnection(username, room_name) {
		let window = document.getElementById(0)
		if(window){
			window.id = room_name
		}
    	this.chat.firstConnection(username, room_name);
		
		let user_name = username || this.chat.user_name
		this.canvas = new MyCanvas(room_name, user_name);
		
		let url
   		switch (this.chat.avatar) {
			case 1:
				url = "img/spritesheet_1.png";
				break;
			case 2:
				url = "img/spritesheet_2.png";
				break;
			case 3:
				url = "img/spritesheet_3.png";
				break;
			case 4:
				url = "img/spritesheet_4.png";
				break;
		}

		this.canvas.world.user_avatar = url
	}

	register() {
		let username = document.querySelector("input[name='Username']").value
		let password = document.querySelector("input[name='Password']").value

		if(!username) {
			alert("Username missing")
			return
		}

		if(!password) {
			alert("Password missing")
			return
		}

		this.chat.server.register(username, password)

	}
}
			