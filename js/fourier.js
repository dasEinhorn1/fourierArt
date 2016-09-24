function preload()
{
	//initialize sound asset
	wilhelm = loadSound('./media/sound/wilhelm.mp3');
}

function setup()
{

}

function draw()
{
	if(mouseIsPressed)
	{
		wilhelm.play();
	}
}