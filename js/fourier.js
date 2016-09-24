function preload(){
	sound = loadSound('media/sound/wilhelm.mp3');
}


function setup()
{
	var cnv = createCanvas(100,100);
	fft = new p5.FFT();
	cnv.mouseClicked(togglePlay());
	sound.amp(0.2);
}

//returns a hue (0-360) based on the frequency closest to chosen amplitude
function getColorFromAmplitude(amplitude)
{
	//initialize proximity to chosen amplitude
	proximity = 255;

	spectrum = fft.analyze();
	for (f = 0; f < 1023; f++)
	{
		freqProximity = Math.abs(spectrum[f] - amplitude);
		//check if frequency is closer to amplitude than the previous best
		if(freqProximity < proximity)
		{
			freq = f;
			proximity = freqProximity;
		}
	}
	hueValue = (freq/1023)*360;
	return hueValue;
}

function draw()
{
	background(0);
	noStroke();
}

function togglePlay()
{
	if(sound.isPlaying())
	{
		sound.pause();
	}
	else
	{
		sound.play();
	}
}
