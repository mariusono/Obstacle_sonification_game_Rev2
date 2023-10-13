//---------------------------------------------------------------------------------------------------------------
// const { dbToGain } = require("tone"); // dafuq is this ? 

// TONE.JS PART
let flag_audio_on_off = false; // initialize global audio on/off flag
let flagAllSounds = false;
let flagAllSounds_reset = false;

// create a gain node
const gainNode = new Tone.Gain(db2mag(-12.0));

// send gain to audio destination (audio out)
gainNode.toDestination();

// Initialize sonifiedObjects
let sonifiedObjects = {};

let loopGlobal;
loopGlobal = new Tone.Loop(loopStep, "1n");  // '1n' here sets the speed of our loop -- every 1th note
count = 0; // counter for number of objects currently playing.

loopGlobal.interval = 1;

let gainValue = gainNode.gain.value;
let intervalVal = loopGlobal.interval;
let silenceTimePerc = 10; // default value
let silenceTime = intervalVal * silenceTimePerc / 100;

console.log('INSIDE SCRIPT_TONE_JS.JS')

// console.log(gainSlider);

// Set sliders.
console.log(parseFloat(mag2db(gainValue)).toFixed(4));

// gainSlider.value(parseFloat(mag2db(gainValue)).toFixed(4));
// document.getElementById('Interval').innerText = parseFloat(intervalVal).toFixed(4);
// document.getElementById('Silence').innerText = parseFloat(silenceTimePerc).toFixed(4);
// document.getElementById('Gain').value = 1500;

function loopStep(time){
    let sonifiedObjects_keys = Object.keys(sonifiedObjects);
    let objectsPlaying = [];
    let objectsNotPlaying = [];

    // console.log(sonifiedObjects);

    for (let i = 0; i<sonifiedObjects_keys.length;i++)
    {
        if (sonifiedObjects[sonifiedObjects_keys[i]].playingFlag)
        {
            // objectsPlaying[sonifiedObjects_keys[i]] = sonifiedObjects[sonifiedObjects_keys[i]];
            objectsPlaying.push(sonifiedObjects[sonifiedObjects_keys[i]]);
        }
        else
        {
            objectsNotPlaying.push(sonifiedObjects[sonifiedObjects_keys[i]]);
        }
    }

    // console.log(flagAllSounds);
    // console.log(objectsPlaying);
    // console.log(objectsNotPlaying);

    // make sure objects that are not playing are stopped.. 
    for (let i = 0;i<objectsNotPlaying.length;i++)
    {
        if (objectsNotPlaying[i] instanceof droneSonification)
        {
            objectsNotPlaying[i].envelope.triggerRelease();
        }
        else if (objectsNotPlaying[i] instanceof synthLoopSonification)
        {
            objectsNotPlaying[i].loop.stop(); // stop the synthSonification loop
        }
        else if (objectsNotPlaying[i] instanceof samplerLoopSonification)
        {
            objectsNotPlaying[i].stopLoop(); 
        }
    }   

    // if there has just been a change, stop all objects.. 
    if (flagAllSounds_reset)
    {
        // make sure objects that are not playing are stopped.. 
        for (let i = 0;i<objectsPlaying.length;i++)
        {
            if (objectsPlaying[i] instanceof droneSonification)
            {
                objectsPlaying[i].envelope.triggerRelease();
            }
            else if (objectsPlaying[i] instanceof synthLoopSonification)
            {
                objectsPlaying[i].loop.stop(); // start the synthSonification loop
            }
            else if (objectsNotPlaying[i] instanceof samplerLoopSonification)
            {
                objectsNotPlaying[i].stopLoop(); 
            }
        }   
        flagAllSounds_reset = false;
    }

    // console.log(objectsPlaying);
    if (flagAllSounds)
    {
        // OBSERVATION: THIS LOOP IS KINDA BAD. IT STARTS SOUNDS EVEN IF SOUNDS ARE ALREADY ON.. ? 
        for (let i = 0;i<objectsPlaying.length;i++)
        {
            if (objectsPlaying[i] instanceof droneSonification)
            {
                objectsPlaying[i].envelope.triggerAttack();
                // objectsPlaying[i].envelope.triggerRelease(('+'+String(loopGlobal.interval/2)));
            }
            else if (objectsPlaying[i] instanceof synthLoopSonification)
            {
                objectsPlaying[i].loop.start(); // start the synthSonification loop
                // objectsPlaying[i].loop.stop('+'+String(loopGlobal.interval/2)); // start the synthSonification loop
            }
            else if (objectsPlaying[i] instanceof samplerLoopSonification)
            {
                console.log(objectsPlaying[i].flagOn);
                if (objectsPlaying[i].flagOn == false){
                    objectsPlaying[i].restartLoop(); // start the synthSonification loop
                }
                // objectsPlaying[i].loop.stop('+'+String(loopGlobal.interval/2)); // start the synthSonification loop
            }
        }     
    }
    else
    {
        // console.log('here');
        if (objectsPlaying.length > 0)
        {
            if (count>=objectsPlaying.length) {count = 0;};
    
            if (objectsPlaying[count] instanceof droneSonification)
            {
                // objectsPlaying[count].envelope.triggerAttackRelease('1n',time);
                // objectsPlaying[count].envelope.triggerAttackRelease(String(intervalVal-silenceTime),time);
                objectsPlaying[count].envelope.triggerAttackRelease(String(intervalVal-silenceTime));
                // console.log(silenceTime);
            }
            else if (objectsPlaying[count] instanceof synthLoopSonification)
            {
                objectsPlaying[count].loop.start('+0'); // start the synthSonification loop
                // objectsPlaying[count].loop.stop('+1n'); // close it at a future time.. 
                objectsPlaying[count].loop.stop('+'+String(intervalVal-silenceTime)); // close it at a future time.. 
                // console.log(silenceTime);
            }
            else if (objectsPlaying[count] instanceof samplerLoopSonification)
            {
                // objectsPlaying[count].startLoop('+0'); // start the synthSonification loop
                // console.log(objectsPlaying[count].flagOn);
                if (objectsPlaying[count].flagOn == false){
                    objectsPlaying[count].restartLoop(); // start the synthSonification loop
                }   
                objectsPlaying[count].stopLoop(1000 * (intervalVal-silenceTime));

            }
            count = count + 1;
        }
    }
}


// Declare your Tone.js variables and functions here
let synth;

function initializeToneJS() {
  synth = new Tone.Synth({
    oscillator: {
      type: 'sine'
    },
    volume: -12 // Set initial volume in decibels
  }).toDestination();
}

function playSineWave(note) {
    synth.triggerAttackRelease(note, '8n');
}



// const checkbox_sounds = document.getElementById("checkbox_sounds");

// checkbox_sounds.addEventListener("change", () => {
//     flagAllSounds = !flagAllSounds;
//     flagAllSounds_reset = true;
//     console.log(flagAllSounds);
// });


// //attach a click listener to a play button
// const button_1 = document.getElementById("button_1");
// const button_2 = document.getElementById("button_2");

// button_1.addEventListener("click", async () => {
//     await Tone.start();
//     console.log("audio is ready");

//     Tone.Transport.bpm.value = 60;

//     // start the transport (i.e. the "clock" that drives the loop)
//     Tone.Transport.start();

//     loopGlobal.start();

// });

// button_2.addEventListener("click", async () => {
//     console.log("stopping all sounds!");

//     Tone.Transport.stop(); // this just stops the master time.. 
// });


// // ADD SLIDER FUNCTIONS

// function setGain(v) {
//     let gainVal = linearMapping(-30.0, 10.0, 0, 10000, v); // db linear Scale
//     // console.log("HERE!!" + v);
//     let gainVal_amp = 10 ** (gainVal / 20);
//     if (gainVal_amp < 0.0316 + 0.0001) { // equivalent of -30 dB + 0.0001
//         gainVal_amp = 0;
//     }
//     document.getElementById('Gain').innerText = parseFloat(gainVal).toFixed(4);
//     // gainNode.gain.value = gainVal;
//     gainNode.gain.rampTo(gainVal_amp, 0.1);
// }

// function setLoopTime(v) {
//     intervalVal = linearMapping(0.1, 5.0, 0, 10000, v); // db linear Scale

//     document.getElementById('Interval').innerText = parseFloat(intervalVal).toFixed(4);
//     // gainNode.gain.value = gainVal;
//     loopGlobal.interval = intervalVal;
// }


// function setSilenceTime(v) {
//     silenceTimePerc = linearMapping(0, 99, 0, 10000, v); // between 0 and 99%, do not use 100 as it is unstable...

//     document.getElementById('Silence').innerText = parseFloat(silenceTimePerc).toFixed(4);
//     // gainNode.gain.value = gainVal;
//     silenceTime = intervalVal * silenceTimePerc / 100;
//     // console.log(silenceTime);

// }


// Clear console after load.. 
// console.clear();
//---------------------------------------------------------------------------------------------------------------
