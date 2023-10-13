class samplerLoopSonification{
    constructor(fileName,urlName, noteVal, interval_sound){ // file needs to be mapped to A4 ! modify later.. more flexibility
        
        this.noteVal = noteVal;
        this.interval_sound = interval_sound;
        this.interval_sound_init = interval_sound;
        this.fileName = fileName;
        this.urlName = urlName;
        this.eventId = 0; // initialize an event id.. 
        this.flagOn = false;
        this.playingFlag = false; // initialize an event id.. 

        this.expMappingFactor_playbackRate = 8;
        this.expMappingFactor_roomSize = -1.5;

        this.valPlayback = 1;
        this.valPlaybackPrev = 1;

        this.distance = 1000; // some very large value to begin with.. 
        this.panning_3d_point = [0,0,0]; // initial value

        this.sampler = new Tone.Sampler({
            urls: {
                A4: this.fileName, 
            },
            baseUrl: this.urlName,
        });

        this.panner = new Tone.Panner3D();
        this.panner.panningModel = 'HRTF';
        this.panner.setPosition(0, 0, 0);
        this.panner.refDistance = 0.1; // IMPORTANT!

        this.sampler.volume.value = -6;

        this.sampler.connect(this.panner);

        // this.freeverb = new Tone.Reverb(1.0);
        this.freeverb = new Tone.Freeverb(0.3,5000);
        this.panner.connect(this.freeverb);

    }
 

    startLoop(time){    
        // console.log('here');
        // console.log(time);
        if (Tone.Transport.state == 'started')
        {
            // console.log(this.noteVal);
            // console.log(this.interval_sound);
            if (this.flagOn)
            {
                // console.log(time);
                this.sampler.triggerAttackRelease(this.noteVal, this.interval_sound, time); // '8n' plays every 8th note at a default bpm (120).. 
    
                //schedule the next event relative to the current time by prefixing "+"
                // .bind(this) is REALLY IMPORTANT to bind the scheduleNext function to the original instance.. !! 
    
                this.eventId = Tone.Transport.scheduleOnce(this.startLoop.bind(this), "+" + this.interval_sound); // VERY IMPORTANT TO USE scheduleOnce instead of schedule because it will remove the event after it's been invoked ! 
            }
            // console.log(eventIDs);
            // Tone.Transport.schedule(scheduleNext, "+" + random(1, 3)); // add some randomness
        }
    }

    updateNote(noteIn){
        this.noteVal = noteIn;
    }

    updateInterval(interval_sound_in){
        this.interval_sound = interval_sound_in;
    }

    stopLoop(timeToStop){
        // let timeAtClick = time;
        // console.log(timeAtClick);
        delay(timeToStop).then(() => {
            // console.log(Tone.now());
            this.flagOn = false;
        });
    }

    restartLoop(){
        this.flagOn = true;
        this.startLoop();
    }

    setPlaybackRate(v,mapInterval) {
        if (v < mapInterval[0]) v = mapInterval[0];
        if (v > mapInterval[1]) v = mapInterval[1];

        let rangeSize = mapInterval[1] - mapInterval[0];
        let perc_interval = 5;

        v = Math.floor(v / (perc_interval * rangeSize / 100)) * (perc_interval * rangeSize / 100);
        if (v < mapInterval[0]) v = mapInterval[0];
        if (v > mapInterval[1]) v = mapInterval[1];

        this.valPlayback = exponentialMapping(0.5, 3.0, mapInterval[1], mapInterval[0], this.expMappingFactor_playbackRate, v);

        if (this.valPlayback !== this.valPlaybackPrev) {
            // console.log(this.valPlayback );
            let newVal = this.interval_sound_init / this.valPlayback; // do not overwrite the onld interval_sound.. 
            this.updateInterval(newVal);
        }
        this.valPlaybackPrev = this.valPlayback;
    }

    setRoomSize(v, mapInterval) {
        if (v < mapInterval[0]) v = mapInterval[0];
        if (v > mapInterval[1]) v = mapInterval[1];

        let roomSize = exponentialMapping(0.05, 0.75, mapInterval[0], mapInterval[1], this.expMappingFactor_roomSize, v); // params : exponentialMapping(rangeOut_bottom, rangeOut_top, rangeIn_bottom, rangeIn_top, fac, val)
        
        // console.log(roomSize);
        this.freeverb.roomSize.value = roomSize;
        // this.freeverb.roomSize.value = 0.7;
        // this.freeverb.wet.value = 0.5;
        this.freeverb.wet.value = 0.0;

        // let roomSize = exponentialMapping(0.5, 3.0, mapInterval[0], mapInterval[1], 2.0, v); // params : exponentialMapping(rangeOut_bottom, rangeOut_top, rangeIn_bottom, rangeIn_top, fac, val)
        // this.freeverb.decay = 5.0;
    }

    setNote(v,mapInterval) { // TO DO ?! 

    }


    // playSample(){
    //     // this.player.start();
    //     console.log(this.sampler);
    //     console.log(this.sampler.baseUrl);
    //     this.sampler.triggerAttackRelease(["A4"], 0.5);
    // }   
}