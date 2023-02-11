class MyApp {
  constructor() {
    this.chat = MYCHAT;
    this.chat.init();
  }

	firstConnection(username, room_name) {
		document.getElementById(0).id = room_name
    	this.chat.firstConnection(username, room_name);
		
		let user_name = username || this.chat.user_name
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
}
			