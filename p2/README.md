# Personal data

- **email**: `luka.chabaud@estudiant.upf.edu`
- **NIA**: `241824`

## How does the chat work

When entering the application, you will start on the login page. From here you can choose your avatar and enter into your account if it already exists. You can try with the User `Lego` and password `Funny`. You can also register if you want. Once you are logged in, you will enter the room where you last were. You can move by clicking on the screen. When close enough to the left or right side of the room, you will change rooms. You can only communicate with the users that are connected to the room you are in.

## Features implemented

The code is divided in 2 parts: the server code and the client code.

### Server

The most important file here is the `MySever.js` file. This is where the class MyServer is implemented, which will accept the connections and manage all the messages that are sent. It will also store everything into database.json, using the functions defined in the `Database.js` module.

For the database I opted for a simple approach using a local json file, which will store the usernames and their respective passwords.

The script that will be run on the server is `Main.js`. There we will create an instance of MyServer and listen into our wanted port.

### Client

In here we have the code of the first assignment into the `MyChat.js` file, with some slight modifications. 

We also have the `MyClient.js` file which is a simplified and modified replacement of the Sillyclient file. It is adapted to also communicate information about the World and the Users.

Inside the view folder we have the `MyCanvas.js` file, which will manage the canvas of the page. For drawing it will use the information of the MyWorld class defined into the `CanvasWorld.js` file. 

In the same folder we also have the `ImageManager.js` file, wich has implemented an image loader which will cache the images.

Inside the model folder we have the already mentioned `CanvasWorld.js` file. This file will have all the information of the world inside, loading at the beginning the world.json file that has the info of all the rooms of the world and how they are connected.

In this folder we also have the `WorldCoords.js` file, which will contain all the information about the canvas coordinates and some useful transformation functions.

Finally in the controller directory we have the `InputState.js` file, which has a class of the same name that will manage all the info of the inputs.

The main class that will initialize everything is the MyApp class in the `MyApp.js` file. This is where the Chat and the canvas are stored, and has some functions that manage the registering and the login.

## Final remarks

I would like to finish by saying that there are a lot of things that could be improved, but due to the limitation of being only one student in the group, most of the functionalities could be a lot better. Visually the page is lacking appeal. The camera is fixed and the messages only appear in the chat, when they could appear on the top of the characters, for example. Also the Database is the simplest it could be. But my aim knowing my situation was to make everything functional, which I think I have achieved.