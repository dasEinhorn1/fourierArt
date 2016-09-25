var freqProximity;
var mainS;

fftBins = 256;

fft = new p5.FFT(0.8,fftBins);
peakDetect = new p5.PeakDetect(0, 7000, 0.23);

function preload(){
	mainS = loadSound('media/sound/guillotine.mp3');
}

function setup(){
	try{
		mainS.setVolume(.1);
		mainS.play();
	}catch(e){
		setTimeout(setup,1000);
	}
}

/*function setup()
{
	background(0);
	createCanvas(windowWidth,windowHeight);
	noStroke();
	fill(255);
	textAlign(CENTER);
	ellipseWidth = 50;
}

function mouseClicked()
{
	if(mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height)
	{
		togglePlay();
	}
}
*/

//returns a hue (0-360) based on the frequency closest to chosen amplitude
//accepts a buffer range (for smoothing) and a start and end point
function getColorFromAmplitude(amplitude, buffer=0, start=0, end=fftBins-1)
{
	//initialize proximity
	var proximity = 255;

	var spectrum = fft.analyze();
	freq = 0;
	for (f = start + buffer; f < end - buffer; f++)
	{
		//average amplitude over buffer area
		averageAmplitude = spectrum[f];
		for(b = 1; b <= buffer; b++)
		{
			averageAmplitude += spectrum[f+b];
			averageAmplitude += spectrum[f-b];
		}
		averageAmplitude = averageAmplitude / (2*buffer + 1);
		var freqProximity = Math.abs(averageAmplitude - amplitude);
		//check if frequency is closer to amplitude than the previous best
		if(freqProximity < proximity)
		{
			var freq = f;
			var proximity = freqProximity;
		}
	}
	var hueValue = (freq/(end-start))*360;
	return hueValue;
}

function getWaveform(scale=1)
{
	var waveform = fft.waveform();
	var scaledWaveform = waveform.map(function(height){
		height *= scale;
		return height;
	});
	return scaledWaveform;
}

//returns a hue (0-360) based on the waveform value at chosen index
function getColorFromWaveform(index)
{
	var waveform = fft.waveform();
	//get a lower and upper bound for the waveform
	var waveMin = Math.min.apply(null,waveform);
	var waveMax = Math.max.apply(null,waveform);

	var waveAbsolute = waveform[index] - waveMin;
	var waveColor = (waveAbsolute / (waveMax - waveMin))*360;
	return waveColor;
}

//returns an array of 256 hue values (0-360) for waveform
function getColorArrayFromWaveform()
{
	var waveColor = [];
	var waveAbsolute = [];

	var waveform = fft.waveform();
	//get lower and upper bound
	var waveMin = Math.min.apply(null,waveform);
	var waveMax = Math.max.apply(null,waveform);

	var waveAbsolute = waveform.map(function(waveVal){
		var absolute = waveVal - waveMin;
		return absolute;
	});

	console.log(waveform);
	console.log(waveAbsolute);

	var waveColor = waveAbsolute.map(function(absVal){
		var col = (absVal / (waveMax - waveMin))*360;
		return col;
	});

	return waveColor;
}



function detectPeak()
{
	fft.analyze();
	peakDetect.update(fft);
	if(peakDetect.isDetected)
	{
		return 1;
	}
	else
	{
		return 0;
	}
}

function draw()
{
}

var getBarPos= function(freq,amplitude,maxW,maxH){// based on frequency and amplitude, I make a paper Point for the top left of each rect
	x=maxW/fftBins * freq;
	y=maxH/255 * amplitude;
	return [x,y];
}

var getAllBarPos=function(spectrum,w,h){//gets all positions
	var positions=[]
	for(var i=0; i<fftBins; i++){
		var amp=spectrum[i]
		positions.push(getBarPos(i,amp,w,h));
	}
	return positions;
}

function togglePlay()
{
	if(mainS.isPlaying())
	{
		mainS.pause();
	}
	else
	{
		mainS.play();
	}
}
