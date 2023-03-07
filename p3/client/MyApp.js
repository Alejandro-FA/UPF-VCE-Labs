let WORLD;

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
    	this.chat.firstConnection(username, room_name)

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
			