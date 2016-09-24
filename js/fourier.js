function preload()
{
	//initialize sound asset
	console.log("Should have set loadedFile");
	wilhelm = loadSound('media/sound/wilhelm.mp3');
}

function setup()
{

}

function draw()
{
	if(mouseIsPressed)
	{
		if (typeof(soundEffect) != 'undefined' && element != null)
		{
		  soundEffect.play();
		}
		else
		{
			wilhelm.play();
		}
	}
}
