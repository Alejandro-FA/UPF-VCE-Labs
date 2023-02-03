# Simple chat webpage

This is a project of the Virtual Communication Environments course at Universitat Pompeu Fabra. It is my first time using HTML, CSS and JavaScript. The goal is to build a chat that connects to a simple server and is able to send and receive messages from other students.

## Personal data

- **email**: `alejandro.fernandez07@estudiant.upf.edu`
- **NIA**: `242349`

## How does MyChat work

First of all, I would like to remark that my main effort has been to learn as much as possible. This means that I've spent *A LOT* of time reading tutorials and manuals about the best modern practices of web development. I hope that this is reflected in my code.

Second of all, I would like to add that I've prioritized having correct implementations of the desired functionalities instead of having as many features as possible.

### Features implemented

The chat has the most basic functionalities, like being able to send messages and receiving a log with the history of the channel upon connection. Furthermore, I've also implemented an option to select any of the available rooms using the sidebar, as well as creating new rooms on the fly. Each time the room is changed, the previous connection to the server is closed and a new one is created with the new room.

![](Screenshot.png)

For a better readability, I've divided my code in 3 classes:

- `MyChat`: main class that controls how the webpage works.
- `HtmlFactory`: auxiliary class to dynamically create new HTML elements.
- `Message`: auxiliary class to define the protocol used by the messages and to parse messages from a String.

## Final remarks

I would like to finish by saying I would have liked to implement more features and improve the webpage even further. But as I said before, I've already spent much more time with this project than I should have. I hope that it is reflected in the final work. All in all, I feel that I've learned a lot.