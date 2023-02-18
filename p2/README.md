# Personal data

- **email**: `luka.chabaud@estudiant.upf.edu`
- **NIA**: `241824`

## How does the chat work

When entering the application, you will start on the login page. From here you can choose your avatar and enter into your account if it already exists. You can try with the User `Lego` and password `Funny`. You can also register if you want. Once you are logged in, you will enter the room where you last were. You can move by clicking on the screen. When close enough to the left or right side of the room, you will change rooms. You can only communicate with the users that are connected to the room you are in.

## Features implemented

The code is divided in 2 parts: the server code and the client code.

### Server

The most important file here is the MySever.js file. This is where the class MyServer is implemented, which will accept the connections and manage all the messages that are sent. It will also store everything into database.json, using the functions defined in the Database.js module.

For the database I opted for a simple approach using a local json file, which will store the usernames and their respective passwords.

The script that will be run on the server is Main.js. There we will create an instance of MyServer and listen into our wanted port.

### Client

In here we have the code of the first assignment into the MyChat.js file, with some slight modifications. 

We also have the MyClient.js file which is a simplified and modified replacement of the Sillyclient file. It is adapted to also communicate information about the World and the Users.

Inside the view folder we have the MyCanvas.js file 

## Final remarks

I would like to finish by saying I would have liked to implement more features and improve the webpage even further. But as I said before, I've already spent much more time with this project than I should have. I hope that it is reflected in the final work. All in all, I feel that I've learned a lot.