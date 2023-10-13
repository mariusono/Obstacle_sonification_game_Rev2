let player;
let playerSpeed = 1.2; // m/s 
let squareSize = 50;
let rotationAngle = 0;

let canvasWidth = 1000;
let canvasHeight = mapMetersToPixels(2.8, 6, 1000);
let fr = 30; // frame rate

let noObjects = 2;
let objects = [];
let sizeSliders = [];
let sizeLabels = [];
let flagCollision = false;

let walls = [];
let noOfWalls = 4;


// Limit distances
let wallLimitDistance = 0.7;
let obstacleLimitDistance = 1.5;

// let objects_xArray = [width/2, 3*width/4,width/4];
// let objects_yArray = [height/2, height/4,3*height/4];

let objects_xArray = [mapMetersToPixels(0.5,6,1000) + canvasWidth/2, 
                     -mapMetersToPixels(1.75,6,1000) + canvasWidth/2];
let objects_yArray = [mapMetersToPixels(0.0,6,1000) + canvasHeight/2, 
                     mapMetersToPixels(0.45,6,1000) + canvasHeight/2];


// Exp mapping factors
let expMappingFactor_playbackRate = 8;
let expMappingFactor_harmonicity = 8;

let gainSlider;

let button_1;
let button_2;

let frameCounter = 0;

// let flagCollision = Array(noObjects).fill(false);

// Checks whether an element is even
const checkTrue = (element) => element === true;
const checkFalse = (element) => element === false;

// Slider location parameters
let pixels_under_canvas = 70;
let slider_pixel_offset = 50;
let slider_label_pixel_offset = 30;

function setup() {
    createCanvas(canvasWidth, canvasHeight);
    // player = new Player(width / 2, height / 2, squareSize);
    player = new Player(canvasWidth * Math.random(), canvasHeight * Math.random(), squareSize);

    // Create a slider for controlling speed
    speedSlider = createSlider(1, 20, mapMetersToPixels(playerSpeed,6,1000)/fr); // Min speed = 1, Max speed = 10, Initial speed = 3
    speedSlider.position(20, height + pixels_under_canvas + slider_pixel_offset * 0); // Position the slider beneath the canvas
    // Create a label for the slider
    // speedLabel = createP('Speed Control:');
    // speedLabel.position(20, height + pixels_under_canvas - slider_label_pixel_offset + slider_label_pixel_offset * 0); // Position the label above the slider

    // Create a slider 
    rotationSpeedSlider = createSlider(0.01, 0.15, 0.1,0.001); // Min speed = 1, Max speed = 10, Initial speed = 3
    rotationSpeedSlider.position(20, height + pixels_under_canvas + slider_pixel_offset * 1); // Position the slider beneath the canvas
    // Create a label for the slider
    // rotationSpeedLabel = createP('Rotation Speed Control:');
    // rotationSpeedLabel.position(20, height + slider_label_pixel_offset + slider_label_pixel_offset * 1); // Position the label above the slider

    // Create a slider for controlling gain
    gainSlider = createSlider(0, 1, 0.3, 0.001); 
    gainSlider.position(20, height + pixels_under_canvas + slider_pixel_offset * 2); // Position the slider beneath the canvas
    // Create a label for the slider
    // gainLabel = createP('Gain Control:');
    // gainLabel.position(20, height + slider_label_pixel_offset + slider_label_pixel_offset * 2); // Position the label above the slider

    // Create a slider for controlling gain
    expMappingFac_PR_slider = createSlider(0.01, 15, 8, 0.01); 
    expMappingFac_PR_slider.position(20, height + pixels_under_canvas + slider_pixel_offset * 3); // Position the slider beneath the canvas
 
    // Create a slider for controlling gain
    expMappingFac_HAR_slider = createSlider(0.01, 15, 8, 0.01); 
    expMappingFac_HAR_slider.position(20, height + pixels_under_canvas + slider_pixel_offset * 4); // Position the slider beneath the canvas

        
    for (let iObj = 0; iObj<noObjects;iObj++){
        // Create a slider for controlling size of Object 1
        sizeSliders.push(createSlider(1, 100, 30, 1)); // Min size = 1, Max size = 100, Initial size = 30, Interval = 1
        sizeSliders[iObj].position(20, height + pixels_under_canvas + slider_pixel_offset * (5+iObj)); // Position the slider beneath the canvas
        // Create a label for the slider
        // sizeLabels.push(createP('Size Control Obj '+(iObj+1) + ':'));
        // sizeLabels[iObj].position(20, height + pixels_under_canvas + slider_pixel_offset  * (3+iObj) - slider_label_pixel_offset + slider_label_pixel_offset); // Position the label above the slider
    }


    //attach a click listener to a play button
    button_1 = document.getElementById("button_1");
    button_2 = document.getElementById("button_2");

    // sonifiedObjects['this_is_an_id_123'] = new droneSonification(7, 110, "triangle", 1); 
    // sonifiedObjects['this_is_an_id_123'].freeverb.connect(gainNode);




    // Create random objects (circle, square, triangle)
    for (let i = 0; i < noObjects; i++) {
        // let objectType = floor(random(3)); // Randomly choose an object type
        let objectType = i; // Randomly choose an object type
        // let x = random(width);
        // let y = random(height);
        let x = objects_xArray[i];
        let y = objects_yArray[i];        
        let size = 30;
        let objectColor = color(random(255), random(255), random(255));

        if (objectType === 0) {

            objects.push(new CircleObject(x, y, size, objectColor));
            // sonifiedObjects[i] = new droneSonification(7, 110, "triangle", 1);
            let fileName = "glass_3.wav";
            let urlName = "https://mariusono.github.io/Vis-a-Vis/audio_files/";

            sonifiedObjects[i] = new samplerLoopSonification(fileName, urlName, 440, Tone.Time('16n').toSeconds() * 2); // * 2 cause I will change the bpm value.. 
            sonifiedObjects[i].freeverb.connect(gainNode);

        } else if (objectType === 1) {

            objects.push(new SquareObject(x, y, size, objectColor));
            let fileName = "glass_1.wav";
            let urlName = "https://mariusono.github.io/Vis-a-Vis/audio_files/";
            sonifiedObjects[i] = new samplerLoopSonification(fileName, urlName, 440, Tone.Time('16n').toSeconds() * 2);
            sonifiedObjects[i].freeverb.connect(gainNode);


        } else {

            objects.push(new TriangleObject(x, y, size, objectColor));

            let fileName = "glass_1.wav";
            let urlName = "https://mariusono.github.io/Vis-a-Vis/audio_files/";
            sonifiedObjects[i] = new samplerLoopSonification(fileName, urlName, 440, Tone.Time('16n').toSeconds());
            sonifiedObjects[i].freeverb.connect(gainNode);

        }
    }

    walls.push(new RectangleObject(canvasWidth/2,10,canvasWidth,20,'black'));
    walls.push(new RectangleObject(10,canvasHeight/2,20,canvasHeight,'black'));
    walls.push(new RectangleObject(canvasWidth/2,canvasHeight-10,canvasWidth,20,'black'));
    walls.push(new RectangleObject(canvasWidth-10,canvasHeight/2,20,canvasHeight,'black'));

    let sonifiedObjects_keys = Object.keys(sonifiedObjects);
    let sonifiedObjects_len = sonifiedObjects_keys.length;
    // Display objects

    let typeArray = ['sine','square','sawtooth','triangle']
    for (const [index, wall] of walls.entries()) {

        sonifiedObjects[sonifiedObjects_len + index] = new droneSonification(7, 110, typeArray[index], 1);
        sonifiedObjects[sonifiedObjects_len + index].freeverb.connect(gainNode);

        // sonifiedObjects[sonifiedObjects_len + index].volumesArray = this.volumesArray.map(n => mag2db(n)); // db values to mag

    }

    sonifiedObjects_keys = Object.keys(sonifiedObjects);
    sonifiedObjects_len = sonifiedObjects_keys.length;

    console.log(sonifiedObjects_keys);

    button_1.addEventListener("click", async () => {
        await Tone.start();
        console.log("audio is ready");

        Tone.Transport.bpm.value = 60;

        // start the transport (i.e. the "clock" that drives the loop)
        Tone.Transport.start();

        for (let i = 0; i<sonifiedObjects_len; i++){
            if (sonifiedObjects[sonifiedObjects_keys[i]] instanceof samplerLoopSonification){
                // sonifiedObjects[sonifiedObjects_keys[i]].restartLoop();
                sonifiedObjects[sonifiedObjects_keys[i]].flagOn = false;
            }
        }


        // loopGlobal.start();
    });

    button_2.addEventListener("click", async () => {
        console.log("stopping all sounds!");
        Tone.Transport.stop(); // this just stops the master time.. 
    });

    // // Create the walls
    // for (let i = 0; i < noOfWalls; i++) {
    //     console.log("canvasWidth is: " + canvasWidth);
    //     walls.push(new RectangleObject(0,0,canvasWidth*2,height/8,'black'));
    // }
}

function draw() {
    background(220);

    frameRate(fr);

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
        object.updateSize(sizeSliders[index].value());

        object.display();
    }
    // Check collisions for objects
    // for (let object of objects) {
    for (const [index, object] of objects.entries()) {
        player.checkCollision_object(object, player, index);
        if (flagCollision === true) {
            break;
        }
    }

    for (const [index, wall] of walls.entries()) {
        player.checkCollision_wall(wall, player, index+objects.length);
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


function closestPointOnSquare(x, y, top_left_corner, top_right_corner, bottom_left_corner, bottom_right_corner) {
    // Function to calculate the Euclidean distance between a point and a line segment
    function distanceToLineSegment(x, y, x1, y1, x2, y2) {
        const A = x - x1;
        const B = y - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const len_sq = C * C + D * D;
        let param = -1;

        if (len_sq !== 0) // Avoid division by zero
            param = dot / len_sq;

        let xx, yy;

        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }

        return [Math.sqrt((x - xx) ** 2 + (y - yy) ** 2),{ x: xx, y: yy }];
    }

    // Calculate the distances from the point to each side of the square
    const distances_and_points = [
        distanceToLineSegment(x, y, top_left_corner[0], top_left_corner[1], top_right_corner[0], top_right_corner[1]),
        distanceToLineSegment(x, y, top_left_corner[0], top_left_corner[1], bottom_left_corner[0], bottom_left_corner[1]),
        distanceToLineSegment(x, y, bottom_left_corner[0], bottom_left_corner[1], bottom_right_corner[0], bottom_right_corner[1]),
        distanceToLineSegment(x, y, top_right_corner[0], top_right_corner[1], bottom_right_corner[0], bottom_right_corner[1])
    ];

    let distances = distances_and_points.map(function(subArray) {
        return subArray[0];
    });

    let points = distances_and_points.map(function(subArray) {
        return subArray[1];
    });

    // Find the minimum distance and its corresponding point
    const minDistance = Math.min(...distances);
    const minIndex = distances.indexOf(minDistance);


    const closestPoint = points[minIndex];

    return closestPoint;
}


class Player {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = mapMetersToPixels(playerSpeed,6,1000)/fr;

        ;
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
        if (keyIsDown(107) || keyIsDown(187)) { // plus key
            squareSize += 1;
            player.updateSize(squareSize);
        }

        // 109 and 189 are keyCodes for "-"
        if (keyIsDown(109) || keyIsDown(189)) { // minus key
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

    checkCollision_object(object, player, index) {
        let d = dist(this.x, this.y, object.x, object.y);
        // console.log(d);
        // console.log(mapPixelsToMeters(d,6,1000) );
        if (mapPixelsToMeters(d,6,1000) < obstacleLimitDistance) {
            // console.log(index);
            if (sonifiedObjects[index] instanceof samplerLoopSonification) {

                sonifiedObjects[index].expMappingFactor_playbackRate = expMappingFac_PR_slider.value();
                sonifiedObjects[index].setPlaybackRate(d, [mapMetersToPixels(0.01,6,1000), mapMetersToPixels(1.5,6,1000)]);

                let xObj_rel_to_player = object.x - player.x;
                let yObj_rel_to_player = object.y - player.y;

                // console.log(xObj_rel_to_player, yObj_rel_to_player);

                let xObj_rel_to_player_rot = Math.cos(rotationAngle) * xObj_rel_to_player + Math.sin(rotationAngle) * yObj_rel_to_player;
                let yObj_rel_to_player_rot = - Math.sin(rotationAngle) * xObj_rel_to_player + Math.cos(rotationAngle) * yObj_rel_to_player;

                // console.log(xObj_rel_to_player_rot, yObj_rel_to_player_rot);

                // // Why 30 ?? 
                // xObj_rel_to_player_rot = 30 * xObj_rel_to_player_rot / canvasWidth;
                // yObj_rel_to_player_rot = 30 * yObj_rel_to_player_rot / canvasHeight;


                // xObj_rel_to_player_rot = xObj_rel_to_player_rot / canvasWidth;
                // yObj_rel_to_player_rot = yObj_rel_to_player_rot / canvasHeight;

                sonifiedObjects[index].panning_3d_point = [mapPixelsToMeters(yObj_rel_to_player_rot, 6, 1000),
                    mapPixelsToMeters(linearMapping(-1000,1000,1,100,object.size),6,1000),
                    mapPixelsToMeters(-xObj_rel_to_player_rot,6,1000)];
                    
                sonifiedObjects[index].panning_3d_point_raw = [yObj_rel_to_player_rot,
                    linearMapping(-5,5,1,100,object.size),
                    -xObj_rel_to_player_rot];
                                        
                sonifiedObjects[index].distance = mapPixelsToMeters(d,6,1000);

                // console.log(sonifiedObjects[index].panning_3d_point_raw);
                // console.log(sonifiedObjects[index].panning_3d_point);
                // console.log(sonifiedObjects[index].distance);

                // sonifiedObjects[index].panner.setPosition(yObj_rel_to_player_rot,
                //     linearMapping(-5,5,1,100,object.size),
                //     xObj_rel_to_player_rot); // the panner is flipped compared to the screen.. MEH
    

                sonifiedObjects[index].panner.setPosition(mapPixelsToMeters(yObj_rel_to_player_rot, 6, 1000),
                mapPixelsToMeters(linearMapping(-5,5,1,100,object.size),6,1000),
                mapPixelsToMeters(-xObj_rel_to_player_rot,6,1000)); // the panner is flipped compared to the screen.. MEH
    

                // if (index == 0){
                //     console.log(yObj_rel_to_player_rot,
                //                 linearMapping(-5,5,1,100,object.size),
                //                 xObj_rel_to_player_rot);
                // }    


                if (sonifiedObjects[index].flagOn == false) {
                    sonifiedObjects[index].restartLoop(); // start the synthSonification loop
                    console.log('here!');
                }
            }
        } else if (mapPixelsToMeters(d,6,1000) > obstacleLimitDistance) {
            if (sonifiedObjects[index] instanceof samplerLoopSonification) {
                console.log('stopping!');
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


    checkCollision_wall(wall, player, index) {

        let closestPoint = closestPointOnSquare(this.x, this.y, 
            [wall.top_left_corner.x,wall.top_left_corner.y], 
            [wall.top_right_corner.x,wall.top_right_corner.y], 
            [wall.bottom_left_corner.x,wall.bottom_left_corner.y], 
            [wall.bottom_right_corner.x,wall.bottom_right_corner.y]);


        let d = dist(this.x, this.y, closestPoint.x, closestPoint.y);


        // if (index == 3){
        //     console.log(closestPoint);    
        //     console.log(d);    
        // }

        if (mapPixelsToMeters(d,6,1000) < wallLimitDistance) {
        // if (mapPixelsToMeters(d,6,1000) < wallLimitDistance*(-1)) {
                // console.log(index);
            if (sonifiedObjects[index] instanceof droneSonification) {
                sonifiedObjects[index].expMappingFactor_harmonicity = expMappingFac_HAR_slider.value();
                sonifiedObjects[index].setHarmonicity(mapPixelsToMeters(d,6,1000), [0.2,0.7]);

                let xObj_rel_to_player = closestPoint.x - player.x;
                let yObj_rel_to_player = closestPoint.y - player.y;

                // console.log(xObj_rel_to_player, yObj_rel_to_player);


                let xObj_rel_to_player_rot = Math.cos(rotationAngle) * xObj_rel_to_player + Math.sin(rotationAngle) * yObj_rel_to_player;
                let yObj_rel_to_player_rot = - Math.sin(rotationAngle) * xObj_rel_to_player + Math.cos(rotationAngle) * yObj_rel_to_player;

                // console.log(xObj_rel_to_player_rot, yObj_rel_to_player_rot);

                // console.log(xObj_rel_to_player_rot, yObj_rel_to_player_rot);

                // sonifiedObjects[index].panner.setPosition(yObj_rel_to_player_rot,
                //     xObj_rel_to_player_rot, 
                //     linearMapping(-5,5,1,100,object.size)); // the panner is flipped compared to the screen.. MEH

                sonifiedObjects[index].panner.setPosition(mapPixelsToMeters(yObj_rel_to_player_rot,6,1000),
                    0, // this is the elevation..
                    mapPixelsToMeters(-xObj_rel_to_player_rot,6,1000)); // the panner is flipped compared to the screen.. MEH
    

                sonifiedObjects[index].envelope.triggerAttack();
            }
            
        } else if (d > 100) {
            if (sonifiedObjects[index] instanceof droneSonification) {
                sonifiedObjects[index].envelope.triggerRelease();
            }
        }

        // if (d < this.size / 2 + Math.min(...[wall.width,wall.height]) / 2) {
        //     // Handle collision 

        //     // console.log('collision');
        //     player.updateSpeed(-player.speed); // bounce from it.. ? 

        //     // console.log(player.speed);
        //     flagCollision = true;
        // } else {
        //     flagCollision = false;
        //     // sonifiedObjects['this_is_an_id_123'].envelope.triggerRelease();
        // }
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

class SquareObject {
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



class RectangleObject {
    constructor(x, y, width, height,wallColor) { // Use a different name for color variable
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height; 
        this.wallColor = wallColor;


        this.top_left_corner = { x: this.x - this.width / 2, y: this.y - this.height / 2 };
        this.top_right_corner = { x: this.x + this.width / 2, y: this.y - this.height / 2 };
        this.bottom_left_corner = { x: this.x - this.width / 2, y: this.y + this.height / 2 };
        this.bottom_right_corner = { x: this.x + this.width / 2, y: this.y + this.height / 2 };
    }

    // Function to draw the rectangle
    display() {
        rectMode(CENTER);
        fill(this.wallColor); // Use the renamed variable
        rect(this.x, this.y, this.width, this.height);
    }
}

