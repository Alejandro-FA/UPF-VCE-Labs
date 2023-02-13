#· Personal data

- **email**: `luka.chabaud@estudiant.upf.edu`
- **NIA**: `241824`

## How does the chat work

When entering the application, you will start on the login page. From here you can choose your avatar and enter into your account if it already exists. You can try with the User `Lego` and password `hello`. You can also register if you want. Once you are logged in, you will enter the room where you last were. You can move by clicking on the screen. When close enough to the left or right side of the room, you will change rooms.

### Features implemented

The chat has the most basic functionalities, like being able to send messages and receiving a log with the history of the channel upon connection. Furthermore, I've also implemented an option to select any of the available rooms using the sidebar, as well as creating new rooms on the fly. Each time the room is changed, the previous connection to the server is closed and a new one is created with the new room.

![](Screenshot.png)

For a better readability, I've divided my code in 3 classes:

- `MyChat`: main class that controls how the webpage works.
- `HtmlFactory`: auxiliary class to dynamically create new HTML elements.
- `Message`: auxiliary class to define the protocol used by the messages and to parse messages from a String.

## Final remarks

I would like to finish by saying I would have liked to implement more features and improve the webpage even further. But as I said before, I've already spent much more time with this project than I should have. I hope that it is reflected in the final work. All in all, I feel that I've learned a lot.