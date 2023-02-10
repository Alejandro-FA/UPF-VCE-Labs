class MyApp {
  constructor() {
    this.chat = MYCHAT;
    this.chat.init();
  }

	firstConnection() {
    	this.chat.firstConnection();
		
		let user_name = this.chat.user_name
		this.canvas = new MyCanvas("room1", user_name);
		
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
			