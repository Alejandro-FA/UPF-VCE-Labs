let WORLD;

class MyApp {
  constructor() {
    this.chat = MYCHAT;
    this.chat.init();
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
			