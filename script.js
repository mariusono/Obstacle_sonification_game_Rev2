let player;
let playerSpeed = 0.85; // m/s 
let rotationSpeed = 0.1;
let objectSize = 50; // in pixels.. 
let squareSize = 50;
let rotationAngle = 0;

let canvasWidth = 1000;
let canvasHeight = mapMetersToPixels(2.8, 6, 1000);
let fr = 30; // frame rate

let noObjects = 2;
let objects = {};
objects['object'] = [];
objects['unique_id'] = [];
let sizeSliders = [];
let sizeLabels = [];

let walls = {};
walls['wall'] = [];
walls['unique_id'] = [];
let noOfWalls = 4;


// FLAGS
let flagUseSynthLoop = true;
let flagUseSampleLoop = false;
let flagSonifyObstacles  = true;
let flagSonifyWalls  = true;

// Limit distances
let wallLimitDistance = 0.75;
let obstacleLimitDistance = 1.2;

// Exp mapping factors
let expMappingFactor_playbackRate = 5.03165;
let expMappingFactor_harmonicity = 5.03165;

setWall_Limit_Dist(1000); // this is equiv to 0.75..
setObstacle_Limit_Dist(2000); // this is equiv to 1.2..
setPlayerSpeed(2500); // this is equiv to 0.85..
setPlayerRotationSpeed(6500);
setExpMapFactor_PlaybackRate(3350);
setExpMapFactor_Harmonicity(3350);

// let objects_xArray = [width/2, 3*width/4,width/4];
// let objects_yArray = [height/2, height/4,3*height/4];

let objects_xArray = [mapMetersToPixels(0.5,6,1000) + canvasWidth/2, 
                     -mapMetersToPixels(1.75,6,1000) + canvasWidth/2];
let objects_yArray = [mapMetersToPixels(0.0,6,1000) + canvasHeight/2, 
                     mapMetersToPixels(0.45,6,1000) + canvasHeight/2];


let frameCounter = 0; // what is this for ? 

// let flagCollision = Array(noObjects).fill(false);

// Checks whether an element is even
const checkTrue = (element) => element === true;
const checkFalse = (element) => element === false;

// // Slider location parameters
// let pixels_under_canvas = 150;
// let slider_pixel_offset = 50;
// let slider_label_pixel_offset = 30;


// Slider functions
function setObstacle_Limit_Dist(v) {
    obstacleLimitDistance = linearMapping(0.5, 4, 0, 10000, v); // db linear Scale
    document.getElementById('ObstLimitDist').innerText = parseFloat(obstacleLimitDistance).toFixed(4);
}

function setWall_Limit_Dist(v) {
    wallLimitDistance = linearMapping(0.5, 3, 0, 10000, v); // db linear Scale
    document.getElementById('WallLimitDist').innerText = parseFloat(wallLimitDistance).toFixed(4);
}


function setExpMapFactor_PlaybackRate(v) {
    expMappingFactor_playbackRate = linearMapping(0.01, 15.0, 0, 10000, v); // db linear Scale
    document.getElementById('ExpMapFact_Obstacle').innerText = parseFloat(expMappingFactor_playbackRate).toFixed(4);
}


function setExpMapFactor_Harmonicity(v) {
    expMappingFactor_harmonicity = linearMapping(0.01, 15.0, 0, 10000, v); // db linear Scale
    document.getElementById('ExpMapFact_Wall').innerText = parseFloat(expMappingFactor_harmonicity).toFixed(4);
}

function setPlayerSpeed(v) {
    playerSpeed = linearMapping(0.3, 2.5, 0, 10000, v); // db linear Scale
    document.getElementById('PlayerSpeed').innerText = parseFloat(playerSpeed).toFixed(4);
}


function setPlayerRotationSpeed(v) {
    rotationSpeed = linearMapping(0.01, 0.15, 0, 10000, v); // db linear Scale
    document.getElementById('PlayerRotation').innerText = parseFloat(rotationSpeed).toFixed(4);
}


// SONIFICATION FUNCTION

// Prep doSonification 
let unique_ids_playing = [];
const baseNotePossibilities = [392,440]
const baseNotePossibilities_drone = [55, 75, 110,155.56,196]

// let audioSamples_array = ["glass_1.wav",
//                           "glass_2.wav",
//                           "glass_3.wav",
//                           "knock.wav",
//                           "drone.wav",
//                           "violin_1.wav"];

let audioSamples_array = ["glass_1.wav",
"knock.wav"];                          

let urlName = "https://mariusono.github.io/Vis-a-Vis/audio_files/";



function doSonification(received_msg) {

    // console.log(received_msg);

    var JsonString = JSON.parse(received_msg);

    // console.log(JsonString);

    let JsonString_keys = Object.keys(JsonString);

    let unique_ids_current = new Array(JsonString_keys.length).fill('init');
    for (var iKeys = 0; iKeys < JsonString_keys.length; iKeys++) {
        unique_ids_current[iKeys] = JsonString[JsonString_keys[iKeys]]['unique_id'];
    }

    let diff = unique_ids_playing.filter(x => !unique_ids_current.includes(x));


    // console.log('unique_ids_current = ' + unique_ids_current);
    // console.log('unique_ids_playing = ' + unique_ids_playing);
    // // console.log(sonifiedObjects);

    // console.log('diff is ' + diff);

    // Stop sonified objects that are playing but are not in current frame
    for (var iDiff = 0; iDiff < diff.length; iDiff++) {
        let index = unique_ids_playing.indexOf(diff[iDiff]);

        // Just set the playing flag to false
        sonifiedObjects[unique_ids_playing[index]].playingFlag = false;
        console.log('HERE!');

        // remove "playing" unique ids that are not in current frame
        unique_ids_playing.splice(index, 1);
    }

    // loop over objects detected in current json frame
    for (var iKeys = 0; iKeys < JsonString_keys.length; iKeys++) {
        let unique_id = JsonString[JsonString_keys[iKeys]]['unique_id'];
        let type_obj = JsonString[JsonString_keys[iKeys]]['type'];
        let timestamp = JsonString[JsonString_keys[iKeys]]['ros_timestamp'];

        // console.log(timestamp);

        if (!unique_ids_playing.includes(unique_id)) { // if current unique Id is not in already playing unique ids 

            unique_ids_playing.push(unique_id); // adding it..

            if (type_obj.includes('wall')) {
                let randomNoteIdx_drone = Math.floor(0 + Math.random() * (baseNotePossibilities_drone.length - 0));
                let baseNoteFreq = baseNotePossibilities_drone[randomNoteIdx_drone];

                if (!sonifiedObjects.hasOwnProperty(unique_id)) { // only create a new sonification if it hasn't already been created
                    sonifiedObjects[unique_id] = new droneSonification(7, baseNoteFreq, "triangle", 1); 
                }

                // connect the panner of the sonified Object to the freereverb (last in chain before audio out)
                sonifiedObjects[unique_id].freeverb.connect(gainNode);
            }
            else if (type_obj.includes('obstacle')) {
                if (flagUseSynthLoop){
                    let randomNoteIdx = Math.floor(0 + Math.random() * (baseNotePossibilities.length - 0));
                    let baseNote = baseNotePossibilities[randomNoteIdx];
                    let notePattern = [baseNote]; 

                    // console.log('NOTE IS + ', notePattern);

                    if (!sonifiedObjects.hasOwnProperty(unique_id)) { // only create a new sonification if it hasn't already been created
                        sonifiedObjects[unique_id] = new synthLoopSonification("sawtooth", notePattern, 0); 
                    }
                    sonifiedObjects[unique_id].freeverb.connect(gainNode);
                }
                else if (flagUseSampleLoop){

                    // Add random sample selection !!!  
                    // let fileName = "glass_3.wav";

                    let randomNoteIdx_sample = Math.floor(0 + Math.random() * (audioSamples_array.length - 0));
                    let fileName = audioSamples_array[randomNoteIdx_sample];
                    // let fileName = "glass_1.wav";
                    // let urlName = "https://mariusono.github.io/Vis-a-Vis/audio_files/";
                    let noteVal = 440;
                    // console.log(Tone.Transport.bpm.value);
                    let interval_sound = Tone.Time('16n').toSeconds();

                    if (!sonifiedObjects.hasOwnProperty(unique_id)) { // only create a new sonification if it hasn't already been created
                        sonifiedObjects[unique_id] = new samplerLoopSonification(fileName,urlName, noteVal, interval_sound);
                    }
                    sonifiedObjects[unique_id].freeverb.connect(gainNode);
                }
            }

            // setting the playing flag to true for this unique id..  why here ? 
            sonifiedObjects[unique_id].playingFlag = true;
            console.log('HERE! SETTING FLAG TO TRUE');
        }

        // // setting the playing flag to true for this unique id.. why here ? 
        // sonifiedObjects[unique_id].playingFlag = true;

        // UPDATE PANNERS 
        let T_map_cam_mat = JSON.parse(JsonString[JsonString_keys[iKeys]]['T_map_cam']);
        let center_3d_sel = [0, 0, 0];
        if (sonifiedObjects[unique_id] instanceof synthLoopSonification) {
            // center_3d_sel = JSON.parse(JsonString[JsonString_keys[iKeys]]['center_3d']);
            center_3d_sel = JSON.parse(JsonString[JsonString_keys[iKeys]]['center_3d']); // taking the center 3d point from the cluster insteat of the center point
        }
        else if (sonifiedObjects[unique_id] instanceof droneSonification) {
            center_3d_sel = JSON.parse(JsonString[JsonString_keys[iKeys]]['nearest_3d']);
        }
        else if (sonifiedObjects[unique_id] instanceof samplerLoopSonification) {
            // center_3d_sel = JSON.parse(JsonString[JsonString_keys[iKeys]]['nearest_3d']); // should I take the center_3d instead ?? 
            center_3d_sel = JSON.parse(JsonString[JsonString_keys[iKeys]]['center_3d']); // should I take the center_3d instead ?? 
        }

        center_3d_sel.push(1); // in the Python script, I forgot to add the 1 at the end .. 

        // let center_reshuffle = [0,0,0,1];
        // center_reshuffle[0] = center_3d_sel[0];
        // center_reshuffle[1] = center_3d_sel[2];
        // center_reshuffle[2] = -center_3d_sel[1];
        // center_3d_sel = center_reshuffle;

        let center_3d_new = [0, 0, 0]; // just initializing a list of new coordinates. 

        // IMPORTANT ! NEEDS TO BE INVERTED.. 
        T_map_cam_mat = math.inv(T_map_cam_mat);

        // Applying the rotation from map to camera ! 
        center_3d_new[0] = T_map_cam_mat[0][0] * center_3d_sel[0] + T_map_cam_mat[0][1] * center_3d_sel[1] + T_map_cam_mat[0][2] * center_3d_sel[2] + T_map_cam_mat[0][3] * center_3d_sel[3];
        center_3d_new[1] = T_map_cam_mat[1][0] * center_3d_sel[0] + T_map_cam_mat[1][1] * center_3d_sel[1] + T_map_cam_mat[1][2] * center_3d_sel[2] + T_map_cam_mat[1][3] * center_3d_sel[3];
        center_3d_new[2] = T_map_cam_mat[2][0] * center_3d_sel[0] + T_map_cam_mat[2][1] * center_3d_sel[1] + T_map_cam_mat[2][2] * center_3d_sel[2] + T_map_cam_mat[2][3] * center_3d_sel[3];

        // IMPORTANT ! RIGHT HANDED COORD SYSTEM !! SEE https://developer.mozilla.org/en-US/docs/Web/API/PannerNode
        center_3d_new[2] = -center_3d_new[2]; 

        // if (unique_id === 'Obj0'){
        //     console.log(center_3d_new);
        // }

        // Computing the distance to the new point
        // let distance_comp = Math.sqrt(center_3d_new[0] * center_3d_new[0] + center_3d_new[1] * center_3d_new[1] + center_3d_new[2] * center_3d_new[2]);
        
        // IMPORTANT - COMPUTE DISTANCE ONLY IN 2D PLANE.. 
        let distance_comp = Math.sqrt(center_3d_new[0] * center_3d_new[0] + center_3d_new[1] * center_3d_new[1]);
        sonifiedObjects[unique_id].distance = distance_comp; // not really needed.. 
        


        // do tha actual update of the panner
        // sonifiedObjects[unique_id].panner.setPosition(center_3d_new[0], center_3d_new[1], center_3d_new[2]);

        // FOR GAME CASE : 
        sonifiedObjects[unique_id].panner.setPosition(center_3d_new[1], center_3d_new[2], -center_3d_new[0]);

        // update the panning 3d point of the sonified object - for debugging purposes
        // sonifiedObjects[unique_id].panning_3d_point = [center_3d_new[0], center_3d_new[1], center_3d_new[2]];
        // sonifiedObjects[unique_id].panning_3d_point = [center_3d_new[0], center_3d_new[1], center_3d_new[2]];

        // FOR GAME CASE : 
        sonifiedObjects[unique_id].panning_3d_point = [center_3d_new[1], center_3d_new[2], -center_3d_new[0]];

        // // if (sonifiedObjects[unique_id] instanceof samplerLoopSonification) {
        // if (sonifiedObjects[unique_id] instanceof droneSonification && type_obj.includes('wall-back')) {
        //     console.log(sonifiedObjects[unique_id].distance);
        //     console.log(sonifiedObjects[unique_id].panning_3d_point);
        // }

        // console.log(type_obj + ' ' + distance_comp);


        if (sonifiedObjects[unique_id] instanceof synthLoopSonification) {
            // update playback rate!         
            sonifiedObjects[unique_id].expMappingFactor_playbackRate = expMappingFactor_playbackRate;   
            sonifiedObjects[unique_id].setPlaybackRate(distance_comp, [0.01, obstacleLimitDistance]); // mapInterval is [lowerBound, upperBound]
            sonifiedObjects[unique_id].setRoomSize(distance_comp, [0.5, 1.5]); // input distance.. 

            // sonifiedObjects[unique_id].playingFlag = false;
            // console.log("synth object distance is: " + distance_comp);

            if (flagSonifyObstacles){
                if (distance_comp > obstacleLimitDistance){ // just some very large value here but this can be a failsafe thing about the radius of the human workspace.. 
                    sonifiedObjects[unique_id].playingFlag = false;
                    console.log('HERE!');
                }
                else if (distance_comp <= obstacleLimitDistance && unique_ids_current.includes(unique_id)){
                    sonifiedObjects[unique_id].playingFlag = true;
                }                
            }else{
                sonifiedObjects[unique_id].playingFlag = false;
            }
            // IDEA ! ADD DISTANCE TO OBJECT ALSO AS A VARIABLE INSIDE THE CLASSES !!

        }
        else if (sonifiedObjects[unique_id] instanceof droneSonification) {

            // sonifiedObjects[unique_id].playingFlag = false;

            // update harmonicity.. 
            sonifiedObjects[unique_id].expMappingFactor_harmonicity = expMappingFactor_harmonicity;   
            sonifiedObjects[unique_id].setHarmonicity(distance_comp, [0.2, wallLimitDistance]);
            sonifiedObjects[unique_id].setRoomSize(distance_comp, [0.3, 1.0]);

            if (flagSonifyWalls){
                if (distance_comp > wallLimitDistance) { // Only play the object if the distance to it is smaller than 2.0 !! this number can be changed.. 
                    sonifiedObjects[unique_id].playingFlag = false;
                    // console.log('HERE!');
                }
                else if (distance_comp <= wallLimitDistance && unique_ids_current.includes(unique_id)){
                    sonifiedObjects[unique_id].playingFlag = true;
                }
            }else{
                sonifiedObjects[unique_id].playingFlag = false;
                // console.log('HERE!');
            }

            // // HARDCODED STOP OF SONIFICATION OF CERTAIN WALLS.. FOR DEBUG!
            // if (type_obj.includes('wall-right') || type_obj.includes('wall-front') || type_obj.includes('wall-left')){
            //     sonifiedObjects[unique_id].playingFlag = false;
            // }
        }
        else if (sonifiedObjects[unique_id] instanceof samplerLoopSonification) {

            // console.log(center_3d_sel);

            // update playback rate.. 
            sonifiedObjects[unique_id].expMappingFactor_playbackRate = expMappingFactor_playbackRate;   
            sonifiedObjects[unique_id].setPlaybackRate(distance_comp, [0.01, obstacleLimitDistance]); // mapInterval is [lowerBound, upperBound]
            sonifiedObjects[unique_id].setRoomSize(distance_comp, [1.0, 2.0]);

            // console.log("sampler object distance is: " + distance_comp);


            if (flagSonifyObstacles){
                // if (distance_comp > 2.0) { // Only play the object if the distance to it is smaller than 2.0 !! this number can be changed.. 
                if (distance_comp > obstacleLimitDistance){ // just some very large value here but this can be a failsafe thing about the radius of the human workspace.. 
                    sonifiedObjects[unique_id].playingFlag = false;
                }
                else if (distance_comp <= obstacleLimitDistance && unique_ids_current.includes(unique_id)){
                    sonifiedObjects[unique_id].playingFlag = true;
                }  
            }else{
                sonifiedObjects[unique_id].playingFlag = false;
            }
        }
    }
}



// CANVAS FINALLY STARTS! 


function setup() {
    createCanvas(canvasWidth, canvasHeight);
    // player = new Player(width / 2, height / 2, squareSize);
    player = new Player(canvasWidth * Math.random(), canvasHeight * Math.random(), squareSize);

    // // Create a slider for controlling speed
    // speedSlider = createSlider(1, 20, mapMetersToPixels(playerSpeed,6,1000)/fr); // Min speed = 1, Max speed = 10, Initial speed = 3
    // speedSlider.position(20, height + pixels_under_canvas + slider_pixel_offset * 0); // Position the slider beneath the canvas
    // Create a label for the slider
    // speedLabel = createP('Speed Control:');
    // speedLabel.position(20, height + pixels_under_canvas - slider_label_pixel_offset + slider_label_pixel_offset * 0); // Position the label above the slider

    // // Create a slider 
    // rotationSpeedSlider = createSlider(0.01, 0.15, 0.1,0.001); // Min speed = 1, Max speed = 10, Initial speed = 3
    // rotationSpeedSlider.position(20, height + pixels_under_canvas + slider_pixel_offset * 1); // Position the slider beneath the canvas
    // // Create a label for the slider
    // // rotationSpeedLabel = createP('Rotation Speed Control:');
    // // rotationSpeedLabel.position(20, height + slider_label_pixel_offset + slider_label_pixel_offset * 1); // Position the label above the slider


    // for (let iObj = 0; iObj<noObjects;iObj++){
    //     // Create a slider for controlling size of Object 1
    //     sizeSliders.push(createSlider(1, 100, 30, 1)); // Min size = 1, Max size = 100, Initial size = 30, Interval = 1
    //     sizeSliders[iObj].position(20, height + pixels_under_canvas + slider_pixel_offset * (5+iObj)); // Position the slider beneath the canvas
    //     // Create a label for the slider
    //     // sizeLabels.push(createP('Size Control Obj '+(iObj+1) + ':'));
    //     // sizeLabels[iObj].position(20, height + pixels_under_canvas + slider_pixel_offset  * (3+iObj) - slider_label_pixel_offset + slider_label_pixel_offset); // Position the label above the slider
    // }


    // Create random objects (circle, square, triangle)
    for (let i = 0; i < noObjects; i++) {
        // let objectType = floor(random(3)); // Randomly choose an object type
        let objectType = i; // Randomly choose an object type
        // let x = random(width);
        // let y = random(height);
        let x = objects_xArray[i];
        let y = objects_yArray[i];        
        let size = 50;
        let objectColor = color(random(255), random(255), random(255));

        if (objectType === 0) {

            objects['object'].push(new CircleObject(x, y, size, objectColor));
            objects['unique_id'].push('Obj' + i);
            // sonifiedObjects[i] = new droneSonification(7, 110, "triangle", 1);
            let fileName = "glass_3.wav";
            let urlName = "https://mariusono.github.io/Vis-a-Vis/audio_files/";

        } else if (objectType === 1) {

            objects['object'].push(new SquareObject(x, y, size, objectColor));
            objects['unique_id'].push('Obj' + i);
            let fileName = "knock.wav";
            let urlName = "https://mariusono.github.io/Vis-a-Vis/audio_files/";

        } 
    }

    walls['wall'].push(new RectangleObject(canvasWidth/2,10,canvasWidth,20,'black'));
    walls['wall'].push(new RectangleObject(10,canvasHeight/2,20,canvasHeight,'black'));
    walls['wall'].push(new RectangleObject(canvasWidth/2,canvasHeight-10,canvasWidth,20,'black'));
    walls['wall'].push(new RectangleObject(canvasWidth-10,canvasHeight/2,20,canvasHeight,'black'));

    walls['unique_id'].push('Wall0');
    walls['unique_id'].push('Wall1');
    walls['unique_id'].push('Wall2');
    walls['unique_id'].push('Wall3');
}



let sonificationMessage = {}; 
let sonificationMessage_string = ''; 

function draw() {
    background(220);

    frameRate(fr);

    if (frameCounter === 180) {
        frameCounter = 0;
    }

    player.updateSpeed(mapMetersToPixels(playerSpeed,6,1000));

    player.update();
    player.display();

    // Draw walls
    for (const [index, wall] of walls['wall'].entries()) { // accessing index also.. 
        wall.display();
    }

    // Display objects
    for (const [index, object] of objects['object'].entries()) {
        object.updateSize(objectSize);
        object.display();
    }


    // CREATE THE SONIFICATION JSON MESSAGE !!


    countSonificationEntries = 0;


    for (let i = 0; i < objects['object'].length; i++) {
        let objMessage = {};
        let d = dist(player.x, player.y, objects['object'][i].x, objects['object'][i].y);
        // console.log(mapPixelsToMeters(d,6,1000));

        objMessage['unique_id'] = objects['unique_id'][i];
        objMessage['ros_timestamp'] = JSON.stringify(Date.now());


        let T_map_cam = [[Math.cos(rotationAngle),Math.sin(rotationAngle),0, 0],
                         [-Math.sin(rotationAngle),Math.cos(rotationAngle),0,0],
                         [0,0,1,0],
                         [0,0,0,1]];

        let center_3d_new_2 = [0,0,0];      
        let center_3d_sel_2 = [mapPixelsToMeters(player.x,6,1000),mapPixelsToMeters(player.y,6,1000),0,1];
        // Applying the rotation from map to camera ! 
        center_3d_new_2[0] = T_map_cam[0][0] * center_3d_sel_2[0] + T_map_cam[0][1] * center_3d_sel_2[1] + T_map_cam[0][2] * center_3d_sel_2[2] + T_map_cam[0][3] * center_3d_sel_2[3];
        center_3d_new_2[1] = T_map_cam[1][0] * center_3d_sel_2[0] + T_map_cam[1][1] * center_3d_sel_2[1] + T_map_cam[1][2] * center_3d_sel_2[2] + T_map_cam[1][3] * center_3d_sel_2[3];

        T_map_cam = [[Math.cos(rotationAngle),Math.sin(rotationAngle),0, -center_3d_new_2[0]],
        [-Math.sin(rotationAngle),Math.cos(rotationAngle),0,-center_3d_new_2[1]],
        [0,0,1,0],
        [0,0,0,1]];

        T_map_cam = math.inv(T_map_cam); // because this is inverted again in doSonification.. DARGH 


        objMessage['T_map_cam'] = JSON.stringify(T_map_cam);
        
        objMessage['center_3d'] = JSON.stringify([mapPixelsToMeters(objects['object'][i].x,6,1000),
                                                  mapPixelsToMeters(objects['object'][i].y,6,1000),
                                                  mapPixelsToMeters(linearMapping(-1000,1000,1,100,objects['object'][i].size),6,1000)]);
        objMessage['nearest_3d'] = JSON.stringify([mapPixelsToMeters(objects['object'][i].x,6,1000),
                                                mapPixelsToMeters(objects['object'][i].y,6,1000),
                                                mapPixelsToMeters(linearMapping(-1000,1000,1,100,objects['object'][i].size),6,1000)]);
        objMessage['type'] = 'obstacle';

        sonificationMessage[countSonificationEntries] = objMessage;
        countSonificationEntries++;
    }


    for (let i = 0; i < walls['wall'].length; i++) {
        let wallMessage = {};

        let closestPoint = closestPointOnSquare(player.x, player.y, 
            [walls['wall'][i].top_left_corner.x,walls['wall'][i].top_left_corner.y], 
            [walls['wall'][i].top_right_corner.x,walls['wall'][i].top_right_corner.y], 
            [walls['wall'][i].bottom_left_corner.x,walls['wall'][i].bottom_left_corner.y], 
            [walls['wall'][i].bottom_right_corner.x,walls['wall'][i].bottom_right_corner.y]);


        let d = dist(player.x, player.y, closestPoint.x, closestPoint.y);


        wallMessage['unique_id'] = walls['unique_id'][i];
        wallMessage['ros_timestamp'] = JSON.stringify(Date.now());

        let T_map_cam = [[Math.cos(rotationAngle),Math.sin(rotationAngle),0, 0],
                         [-Math.sin(rotationAngle),Math.cos(rotationAngle),0,0],
                         [0,0,1,0],
                         [0,0,0,1]];

        let center_3d_new_2 = [0,0,0];      
        let center_3d_sel_2 = [mapPixelsToMeters(player.x,6,1000),mapPixelsToMeters(player.y,6,1000),0,1];
        // Applying the rotation from map to camera ! 
        center_3d_new_2[0] = T_map_cam[0][0] * center_3d_sel_2[0] + T_map_cam[0][1] * center_3d_sel_2[1] + T_map_cam[0][2] * center_3d_sel_2[2] + T_map_cam[0][3] * center_3d_sel_2[3];
        center_3d_new_2[1] = T_map_cam[1][0] * center_3d_sel_2[0] + T_map_cam[1][1] * center_3d_sel_2[1] + T_map_cam[1][2] * center_3d_sel_2[2] + T_map_cam[1][3] * center_3d_sel_2[3];

        T_map_cam = [[Math.cos(rotationAngle),Math.sin(rotationAngle),0, -center_3d_new_2[0]],
        [-Math.sin(rotationAngle),Math.cos(rotationAngle),0,-center_3d_new_2[1]],
        [0,0,1,0],
        [0,0,0,1]];

        T_map_cam = math.inv(T_map_cam); // because this is inverted again in doSonification.. DARGH 

        wallMessage['T_map_cam'] = JSON.stringify(T_map_cam);

        wallMessage['center_3d'] = JSON.stringify([mapPixelsToMeters(closestPoint.x,6,1000),
                                                mapPixelsToMeters(closestPoint.y,6,1000),
                                                0]);
        wallMessage['nearest_3d'] = JSON.stringify([mapPixelsToMeters(closestPoint.x,6,1000),
                                                mapPixelsToMeters(closestPoint.y,6,1000),
                                                0]);
        wallMessage['type'] = 'wall';

        sonificationMessage[countSonificationEntries] = wallMessage;
        countSonificationEntries++;
    }


    sonificationMessage_string = JSON.stringify(sonificationMessage);

    doSonification(sonificationMessage_string);

    // console.log(sonificationMessage);



    // // Check collisions for objects
    // // for (let object of objects) {
    // for (const [index, object] of objects['object'].entries()) {
    //     player.checkCollision_object(object, player, index);

    // }

    // for (const [index, wall] of walls['wall'].entries()) {
    //     player.checkCollision_wall(wall, player, index+objects.length);
    // }

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
        this.speed = mapMetersToPixels(playerSpeed,6,1000)/fr; // need to divide by frame rate..

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
            rotationAngle = rotationAngle - rotationSpeed;
        }
        if (keyIsDown(68)) {
            // // // Move left
            // let speed_x = - this.speed * Math.sin(rotationAngle);
            // let speed_y = + this.speed * Math.cos(rotationAngle);

            // this.x = this.x + speed_x;
            // this.y = this.y + speed_y;

            // Rotate right
            rotationAngle = rotationAngle + rotationSpeed;
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
        this.speed = newSpeed/fr;
    }

    checkCollision_object(object, player, index) {
        let d = dist(this.x, this.y, object.x, object.y);
        // console.log(d);
        // console.log(mapPixelsToMeters(d,6,1000) );
        if (mapPixelsToMeters(d,6,1000) < obstacleLimitDistance) {
            // console.log(index);
            if (sonifiedObjects[index] instanceof samplerLoopSonification) {

                sonifiedObjects[index].expMappingFactor_playbackRate = expMappingFactor_playbackRate;
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

        // if (d < this.size / 2 + object.size / 2) {
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
                sonifiedObjects[index].expMappingFactor_harmonicity = expMappingFactor_harmonicity;
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

