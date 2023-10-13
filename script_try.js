let player;
let squareSize = 50;
let rotationAngle = 0;

let scalePixelsToMeters = 7/1000; // 5 meters to 1000 pixels
let scaleMetersToPixels = 1 / scalePixelsToMeters; // x pixels to 1 meter

let baseSpeed = 1; // m/s

let canvasWidthMeters = 7;
let canvasHeightMeters = 3;

let canvasWidth = canvasWidthMeters * scaleMetersToPixels;
let canvasHeight = canvasHeightMeters * scaleMetersToPixels;

let noObjects = 3;
let objects = [];
let flagCollision = false;

let walls = [];
let noOfWalls = 4;



let gainSlider;

let button_1;
let button_2;

let frameCounter = 0;

// let flagCollision = Array(noObjects).fill(false);

// Checks whether an element is even
const checkTrue = (element) => element === true;
const checkFalse = (element) => element === false;

function setup() {
    createCanvas(canvasWidth, canvasHeight);
    player = new Player(width / 2 - width/4, height / 2, squareSize);

    // Create a slider for controlling speed
    speedSlider = createSlider(1, 10, 3); // Min speed = 1, Max speed = 10, Initial speed = 3
    speedSlider.position(20, height + 70); // Position the slider beneath the canvas
    // Create a label for the slider
    speedLabel = createP('Speed Control:');
    speedLabel.position(20, height + 30); // Position the label above the slider

    // Create a slider for controlling gain
    gainSlider = createSlider(0, 1, 0.3, 0.001); 
    gainSlider.position(20, height + 120); // Position the slider beneath the canvas
    // Create a label for the slider
    gainLabel = createP('Gain Control:');
    gainLabel.position(20, height + 80); // Position the label above the slider

    // Create a slider for controlling size of Object 1
    sizeSlider = createSlider(1, 100, 30, 1); // Min size = 1, Max size = 100, Initial size = 30, Interval = 1
    sizeSlider.position(20, height + 170); // Position the slider beneath the canvas
    // Create a label for the slider
    sizeLabel = createP('Size Control Obj 1:');
    sizeLabel.position(20, height + 130); // Position the label above the slider

    // Create a slider for controlling size of Object 2
    sizeSlider_2 = createSlider(1, 100, 30, 1); // Min speed = 1, Max speed = 10, Initial speed = 3
    sizeSlider_2.position(20, height + 220); // Position the slider beneath the canvas
    // Create a label for the slider
    sizeLabel_2 = createP('Size Control Obj 2:');
    sizeLabel_2.position(20, height + 180); // Position the label above the slider

    // Create a slider for controlling size of Object 2
    sizeSlider_3 = createSlider(1, 100, 30, 1); // Min speed = 1, Max speed = 10, Initial speed = 3
    sizeSlider_3.position(20, height + 270); // Position the slider beneath the canvas
    // Create a label for the slider
    sizeLabel_3 = createP('Size Control Obj 3:');
    sizeLabel_3.position(20, height + 230); // Position the label above the slider

    // Create a slider 
    rotationSpeedSlider = createSlider(0.01, 0.1, 0.03,0.001); // Min speed = 1, Max speed = 10, Initial speed = 3
    rotationSpeedSlider.position(20, height + 320); // Position the slider beneath the canvas
    // Create a label for the slider
    rotationSpeedLabel = createP('Rotation Speed Control:');
    rotationSpeedLabel.position(20, height + 280); // Position the label above the slider


    //attach a click listener to a play button
    button_1 = document.getElementById("button_1");
    button_2 = document.getElementById("button_2");

    // sonifiedObjects['this_is_an_id_123'] = new droneSonification(7, 110, "triangle", 1); 
    // sonifiedObjects['this_is_an_id_123'].freeverb.connect(gainNode);



    button_1.addEventListener("click", async () => {
        await Tone.start();
        console.log("audio is ready");

        Tone.Transport.bpm.value = 60;

        // start the transport (i.e. the "clock" that drives the loop)
        Tone.Transport.start();

        // loopGlobal.start();
    });

    button_2.addEventListener("click", async () => {
        console.log("stopping all sounds!");
        Tone.Transport.stop(); // this just stops the master time.. 
    });

    let xArray = [width/2, 3*width/4,width/4];
    let yArray = [height/2, height/4,3*height/4];

    // Create random objects (circle, square, triangle)
    for (let i = 0; i < 3; i++) {
        // let objectType = floor(random(3)); // Randomly choose an object type
        let objectType = i; // Randomly choose an object type
        // let x = random(width);
        // let y = random(height);
        let x = xArray[i];
        let y = yArray[i];        
        let size = 30;
        let objectColor = color(random(255), random(255), random(255));

        if (objectType === 0) {

            objects.push(new CircleObject(x, y, size, objectColor));
            sonifiedObjects[i] = new droneSonification(7, 110, "triangle", 1);
            sonifiedObjects[i].freeverb.connect(gainNode);

        } else if (objectType === 1) {

            objects.push(new SquareObject(x, y, size, size, objectColor));
            let fileName = "glass_3.wav";
            let urlName = "https://mariusono.github.io/Vis-a-Vis/audio_files/";
            sonifiedObjects[i] = new samplerLoopSonification(fileName, urlName, 440, Tone.Time('16n').toSeconds());
            sonifiedObjects[i].freeverb.connect(gainNode);

        } else {

            objects.push(new TriangleObject(x, y, size, objectColor));

            let fileName = "glass_1.wav";
            let urlName = "https://mariusono.github.io/Vis-a-Vis/audio_files/";
            sonifiedObjects[i] = new samplerLoopSonification(fileName, urlName, 440, Tone.Time('16n').toSeconds());
            sonifiedObjects[i].freeverb.connect(gainNode);

        }
    }

    // walls.push(new SquareObject(canvasWidth/2,10,canvasWidth,20,'black'));
    // walls.push(new SquareObject(10,canvasHeight/2,20,canvasHeight,'black'));
    // walls.push(new SquareObject(canvasWidth/2,canvasHeight-10,canvasWidth,20,'black'));
    // walls.push(new SquareObject(canvasWidth-10,canvasHeight/2,20,canvasHeight,'black'));


    // // Create the walls
    // for (let i = 0; i < noOfWalls; i++) {
    //     console.log("canvasWidth is: " + canvasWidth);
    //     walls.push(new RectangleObject(0,0,canvasWidth*2,height/8,'black'));
    // }
}

function draw() {
    background(220);
    frameRate(60);

    if (frameCounter === 180) {
        frameCounter = 0;
    }

    gainNode.gain.value = gainSlider.value();

    // if (flagCollision.some(checkTrue)){
    if (!flagCollision) {
        // console.log('here');
        // console.log(flagCollision);
        player.updateSpeed(speedSlider.value());
    } // Update player's speed based on the slider

    player.update();
    player.display();

    // Draw walls
    for (const [index, wall] of walls.entries()) { // accessing index also.. 
        wall.display();
    }

    // Display objects
    for (const [index, object] of objects.entries()) {
        if (index === 0) {
            object.updateSize(sizeSlider.value());
        }
        else if (index === 1) {
            object.updateHeight(sizeSlider_2.value());
            object.updateWidth(sizeSlider_2.value());
        }
        else if (index === 2) {
            object.updateSize(sizeSlider_3.value());
        }
        object.display();
    }
    // Check collisions for objects
    // for (let object of objects) {
    for (const [index, object] of objects.entries()) {
        player.checkCollision(object, player, index);
        if (flagCollision === true) {
            break;
        }
    }

    frameCounter++;
}

function mousePressed() {
    if ((mouseY < canvasHeight) && (mouseX < canvasWidth)) {
        // Calculate the angle between the player's position and the mouse position
        let dx = mouseX - player.x;
        let dy = mouseY - player.y;
        rotationAngle = atan2(dy, dx);
        // console.log(rotationAngle * 180 / Math.PI);chiarotto35mm@gmail.com
    }
}

function mouseDragged() {
    if ((mouseY < canvasHeight) && (mouseX < canvasWidth)) {
        // Calculate the angle between the player's position and the mouse position
        let dx = mouseX - player.x;
        let dy = mouseY - player.y;
        rotationAngle = atan2(dy, dx);
        // console.log(rotationAngle * 180 / Math.PI);
    }
}

class Player {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = 3;
    }


    update() {
        // Movement controls
        if (keyIsDown(65)) {
            // // Move left
            // let speed_x = - this.speed * Math.sin(rotationAngle);
            // let speed_y = + this.speed * Math.cos(rotationAngle);

            // this.x = this.x - speed_x;
            // this.y = this.y - speed_y;

            // Rotate left
            rotationAngle = rotationAngle - rotationSpeedSlider.value();
        }
        if (keyIsDown(68)) {
            // // // Move left
            // let speed_x = - this.speed * Math.sin(rotationAngle);
            // let speed_y = + this.speed * Math.cos(rotationAngle);

            // this.x = this.x + speed_x;
            // this.y = this.y + speed_y;

            // Rotate right
            rotationAngle = rotationAngle + rotationSpeedSlider.value();
        }
        if (keyIsDown(87)) {
            // console.log(this.speed);
            let speed_x = this.speed * Math.cos(rotationAngle);
            let speed_y = this.speed * Math.sin(rotationAngle);

            this.x = this.x + speed_x;
            this.y = this.y + speed_y;
        }
        if (keyIsDown(83)) {
            let speed_x = this.speed * Math.cos(rotationAngle);
            let speed_y = this.speed * Math.sin(rotationAngle);

            this.x = this.x - speed_x;
            this.y = this.y - speed_y;
            // this.x = x_preRot * Math.cos(rotationAngle) - y_preRot * Math.sin(rotationAngle);
            // this.y = x_preRot * Math.sin(rotationAngle) + y_preRot * Math.cos(rotationAngle);
        }
        if (keyIsDown(107) || keyIsDown(187)) {
            squareSize += 1;
            player.updateSize(squareSize);
        }

        // 109 and 189 are keyCodes for "-"
        if (keyIsDown(109) || keyIsDown(189)) {
            squareSize -= 1;
            player.updateSize(squareSize);
        }


        // Constrain player within the canvas
        this.x = constrain(this.x, this.size / 2, width - this.size / 2);
        this.y = constrain(this.y, this.size / 2, height - this.size / 2);
    }

    updateSize(newSize) {
        this.size = newSize;
    }

    updateSpeed(newSpeed) {
        this.speed = newSpeed;
    }

    checkCollision(object, player, index) {
        let d = dist(this.x, this.y, object.x, object.y);
        if (d < 200) {
            // console.log(index);
            if (sonifiedObjects[index] instanceof droneSonification) {
                sonifiedObjects[index].setHarmonicity(d, [1, 200]);

                let xObj_rel_to_player = object.x - player.x;
                let yObj_rel_to_player = object.y - player.y;

                // console.log(xObj_rel_to_player, yObj_rel_to_player);


                let xObj_rel_to_player_rot = Math.cos(rotationAngle) * xObj_rel_to_player + Math.sin(rotationAngle) * yObj_rel_to_player;
                let yObj_rel_to_player_rot = - Math.sin(rotationAngle) * xObj_rel_to_player + Math.cos(rotationAngle) * yObj_rel_to_player;

                // console.log(xObj_rel_to_player_rot, yObj_rel_to_player_rot);

                xObj_rel_to_player_rot = 30 * xObj_rel_to_player_rot / canvasWidth;
                yObj_rel_to_player_rot = 30 * yObj_rel_to_player_rot / canvasHeight;

                // console.log(xObj_rel_to_player_rot, yObj_rel_to_player_rot);

                // sonifiedObjects[index].panner.setPosition(yObj_rel_to_player_rot,
                //     xObj_rel_to_player_rot, 
                //     linearMapping(-5,5,1,100,object.size)); // the panner is flipped compared to the screen.. MEH

                sonifiedObjects[index].panner.setPosition(yObj_rel_to_player_rot,
                    linearMapping(-5,5,1,100,object.size),
                    xObj_rel_to_player_rot); // the panner is flipped compared to the screen.. MEH
    

                sonifiedObjects[index].envelope.triggerAttack();
            }
            else if (sonifiedObjects[index] instanceof samplerLoopSonification) {
                sonifiedObjects[index].setPlaybackRate(d, [1, 200]);

                let xObj_rel_to_player = object.x - player.x;
                let yObj_rel_to_player = object.y - player.y;

                // console.log(xObj_rel_to_player, yObj_rel_to_player);

                let xObj_rel_to_player_rot = Math.cos(rotationAngle) * xObj_rel_to_player + Math.sin(rotationAngle) * yObj_rel_to_player;
                let yObj_rel_to_player_rot = - Math.sin(rotationAngle) * xObj_rel_to_player + Math.cos(rotationAngle) * yObj_rel_to_player;

                // console.log(xObj_rel_to_player_rot, yObj_rel_to_player_rot);

                xObj_rel_to_player_rot = 30 * xObj_rel_to_player_rot / canvasWidth;
                yObj_rel_to_player_rot = 30 * yObj_rel_to_player_rot / canvasHeight;


                // sonifiedObjects[index].panner.setPosition(yObj_rel_to_player_rot,
                //     xObj_rel_to_player_rot, 
                //     linearMapping(-5,5,1,100,object.size)); // the panner is flipped compared to the screen.. MEH
                sonifiedObjects[index].panner.setPosition(yObj_rel_to_player_rot,
                    linearMapping(-5,5,1,100,object.size),
                    xObj_rel_to_player_rot); // the panner is flipped compared to the screen.. MEH
    


                if (sonifiedObjects[index].flagOn == false) {
                    sonifiedObjects[index].restartLoop(); // start the synthSonification loop
                }
            }
        } else if (d > 200) {
            if (sonifiedObjects[index] instanceof droneSonification) {
                sonifiedObjects[index].envelope.triggerRelease();
            }
            else if (sonifiedObjects[index] instanceof samplerLoopSonification) {
                sonifiedObjects[index].stopLoop(); // start the synthSonification loop
            }
        }

        if (d < this.size / 2 + object.size / 2) {
            // Handle collision 

            // console.log('collision');
            player.updateSpeed(-player.speed); // bounce from it.. ? 

            // console.log(player.speed);
            flagCollision = true;
        } else {
            flagCollision = false;
            // sonifiedObjects['this_is_an_id_123'].envelope.triggerRelease();
        }
    }

    display() {
        let halfSize = this.size / 2;

        push(); // Save the current drawing state
        translate(this.x, this.y); // Move the origin to the player's position
        rotate(rotationAngle); // Apply rotation

        // Draw the first half (green)
        fill(0, 150, 0);
        rectMode(CENTER);
        rect(0, 0, halfSize, this.size);

        // Draw the second half (red)
        fill(150, 0, 0);
        rect(-halfSize, 0, halfSize, this.size);


        pop(); // Restore the previous drawing state
    }
}



class CircleObject {
    constructor(x, y, size, objectColor) { // Use a different name for color variable
        this.x = x;
        this.y = y;
        this.size = size;
        this.objectColor = objectColor; // Rename variable
    }

    updateSize(newSize) {
        this.size = newSize;
    }

    display() {
        fill(this.objectColor); // Use the renamed variable
        ellipseMode(CENTER);
        ellipse(this.x, this.y, this.size);
    }
}

class SquareObject_old {
    constructor(x, y, size, objectColor) { // Use a different name for color variable
        this.x = x;
        this.y = y;
        this.size = size;
        this.objectColor = objectColor; // Rename variable
    }

    updateSize(newSize) {
        this.size = newSize;
    }

    display() {
        fill(this.objectColor); // Use the renamed variable
        rectMode(CENTER);
        rect(this.x, this.y, this.size);
    }
}


class SquareObject {
    constructor(x, y, width, height, objectColor) { // Use a different name for color variable
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.objectColor = objectColor; // Rename variable

        this.top_left_corner = { x: this.x - this.width / 2, y: this.y - this.height / 2 };
        this.top_right_corner = { x: this.x + this.width / 2, y: this.y - this.height / 2 };
        this.bottom_left_corner = { x: this.x - this.width / 2, y: this.y + this.height / 2 };
        this.bottom_right_corner = { x: this.x + this.width / 2, y: this.y + this.height / 2 };
    }

    updateWidth(newWidth) {
        this.width = newWidth;
    }

    updateHeight(newHeight) {
        this.height = newHeight;
    }

    // updateSize(newSize) {
    //     this.width = newSize;
    //     this.height = newSize;
    // }


    updatePosition(newX, newY) {
        this.x = newX;
        this.y = newY;

        this.top_left_corner = { x: this.x - this.width / 2, y: this.y - this.height / 2 };
        this.top_right_corner = { x: this.x + this.width / 2, y: this.y - this.height / 2 };
        this.bottom_left_corner = { x: this.x - this.width / 2, y: this.y + this.height / 2 };
        this.bottom_right_corner = { x: this.x + this.width / 2, y: this.y + this.height / 2 };
    }

    display() {
        fill(this.objectColor); // Use the renamed variable
        rectMode(CENTER);
        rect(this.x, this.y, this.width, this.height);
    }
}

class TriangleObject {
    constructor(x, y, size, objectColor) { // Use a different name for color variable
        this.x = x;
        this.y = y;
        this.size = size;
        this.objectColor = objectColor; // Rename variable
    }

    updateSize(newSize) {
        this.size = newSize;
    }

    display() {
        fill(this.objectColor); // Use the renamed variable
        triangle(
            this.x, this.y - this.size / 2,
            this.x - this.size / 2, this.y + this.size / 2,
            this.x + this.size / 2, this.y + this.size / 2
        );
    }
}


