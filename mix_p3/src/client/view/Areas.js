const SpanishWalkArea = new WalkArea()
const JapaneseWalkArea = new WalkArea()

//Add limits to the room
const roomShape = [
    [95, 0, 257],
    [-193, 0, 257],
    [-193, 0, 68],
    [-162, 0, 68],
    [-162, 0, 9],
    [-193, 0, 9],
    [-193, 0, -120],
    [-165, 0, -120],
    [-165, 0, -211],
    [67, 0, -211],
    [67, 0, -111],
    [95, 0, -111]
];

const tableShape = [
    [23, 0, -121],
    [23, 0, -164],
    [-111, 0, -164],
    [-111, 0, -121]
];

const guitarShape = [
    [100, 0, 40],
    [80, 0, 40],
    [80, 0, 83],
    [100, 0, 83]
];

const microShape = [
    [-40, 0, 185],
    [-40, 0, 145],
    [-70, 0, 145],
    [-70, 0, 185],
]

//Room
SpanishWalkArea.addShape(roomShape)
JapaneseWalkArea.addShape(roomShape)

//Table
SpanishWalkArea.addShape(tableShape)
JapaneseWalkArea.addShape(tableShape)

//Guitar
SpanishWalkArea.addShape(guitarShape)

//Micro
SpanishWalkArea.addShape(microShape)
JapaneseWalkArea.addShape(microShape)