var freqProximity;

fft = new p5.FFT();
function preload(){
	sound = loadSound('media/sound/wilhelm.mp3');
}
//returns a hue (0-360) based on the frequency closest to chosen amplitude
function getColorFromAmplitude(amplitude)
{
	//initialize proximity to chosen amplitude
	var proximity = 255;

	var spectrum = fft.analyze();
	freq=0;
	for (f = 0; f < 1024; f++)
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

var getBarPos= function(freq,amplitude,maxW,maxH){// based on frequency and amplitude, I make a paper Point for the top left of each rect
	x=maxW/1024 * freq;
	y=maxH/255 * amplitude;
	return [x,y];
}

var getAllBarPos=function(spectrum,w,h){
	var positions=[]
	for(var i=0; i<1024; i++){
		var amp=spectrum[i]
		positions.push(getBarPos(i,amp,w,h));
	}
	return positions;
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
