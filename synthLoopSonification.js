class synthLoopSonification{
    constructor(type,notePattern,initVolume){
        this.notePattern = notePattern;
        this.type = type;
        this.initVolume = initVolume;
        this.valPlayback = 1;
        this.valPlaybackPrev = 1;

        this.expMappingFactor_playbackRate = 8;
        this.expMappingFactor_roomSize = -1.5;

        this.playingFlag = false;
        this.distance = 1000; // some very large value to begin with..  NOT NEEDED ! 
        this.panning_3d_point = [0,0,0]; // initial value

        this.synth = new Tone.Synth({
            oscillator: {
                type: this.type,
                volume: this.initVolume,
            }
        });

        // this.loop = new Tone.Loop((time) => {
        //     this.synth.triggerAttackRelease(220, "8n", time); // '8n' plays every 8th note at a default bpm (120).. 
        // },"8n");
        // this.loop.interval = '8n';


        this.loop = new Tone.Pattern((time, note) => {
            this.synth.triggerAttackRelease(note, "16n", time); // '8n' plays every 8th note at a default bpm (120).. 
        },this.notePattern, "upDown");
        this.loop.interval = '16n';
        // this.loop.interval = '8n';

        this.panner = new Tone.Panner3D();
        this.panner.panningModel = 'HRTF';
        this.panner.setPosition(0, 0, 0);
        this.panner.refDistance = 0.1; // IMPORTANT!

        this.synth.connect(this.panner);

        // create reverb node
        this.freeverb = new Tone.Freeverb(0.3,5000);
        this.panner.connect(this.freeverb);

        // this.freeverb = new Tone.Reverb(1.0);
        // this.panner.connect(this.freeverb);
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
            this.loop.playbackRate = this.valPlayback;
        }
        this.valPlaybackPrev = this.valPlayback;
    }

    setRoomSize(v, mapInterval) {
        if (v < mapInterval[0]) v = mapInterval[0];
        if (v > mapInterval[1]) v = mapInterval[1];

        let roomSize = exponentialMapping(0.05, 0.75, mapInterval[0], mapInterval[1], this.expMappingFactor_roomSize, v); // params : exponentialMapping(rangeOut_bottom, rangeOut_top, rangeIn_bottom, rangeIn_top, fac, val)
        
        console.log(roomSize);
        this.freeverb.roomSize.value = roomSize;
        // this.freeverb.roomSize.value = 0.7;
        // this.freeverb.wet.value = 0.5;
        this.freeverb.wet.value = 0.0;

        // let roomSize = exponentialMapping(0.5, 3.0, mapInterval[0], mapInterval[1], 2.0, v); // params : exponentialMapping(rangeOut_bottom, rangeOut_top, rangeIn_bottom, rangeIn_top, fac, val)
        // this.freeverb.decay = roomSize;
    }
}