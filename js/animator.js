dimensions={
  w:parseInt($(window).innerWidth()),
  h:parseInt($(window).innerHeight()),
  circle: 20
}

Animator = function(){
  this.paused = false;
  this.toggle=function(){
    this.paused= !this.paused;
  };
  this.play=function(){
    this.paused=false;
  };
  this.pause=function(){
    this.paused=true;
  };
  this.reset=function(){
    resetFftCircles(anim);
  };
}

function sanityCheck() {
  var loader = q.now();
  if (loader) {
    if (loader._playing == loader._paused) {
      console.log("INSANITY!");
      loader._playing = !loader._paused;
    }
  }
}

anim = new Animator();

function resizeDimensions(elem,width,height){
    //calc scale coefficients and store current position
    var scaleX = width/elem.bounds.width;
    var scaleY = height/elem.bounds.height;
    var prevPos = new Point(elem.bounds.x,elem.bounds.y);
    //apply calc scaling
    elem.scale(scaleX,scaleY);
    //reposition the elem to previous pos(scaling moves the elem so we reset it's position);
    var newPos = prevPos + new Point(elem.bounds.width/2,elem.bounds.height/2);
    elem.position = newPos;
}

var durationLoop = new Group();
durationLoop.bringToFront();
var previousTime = 0;
durationLoop.onFrame = function(e) {
  var timeObj = q.time();
  if (Math.round(previousTime) != Math.round(timeObj.current) && !scrubbing) {
    $('.time.time-current').html(timeToStringFormat(timeObj.current, TIME_FORMAT));
    q.updateProgressBars(timeObj);
    $('.time.time-left').html(timeToStringFormat(timeObj.diff, TIME_FORMAT));
  }
  previousTime = timeObj.current;
}

var fftCircles=new Group();
for(var i = 0; i < 16; i++){ // i(totalwidth/32)+totalwidth/16
  c1= new Path.Circle(new Point((i*dimensions.w/16), dimensions.h/2), dimensions.circle);
  c1.fillColor="white";
  c2=c1.clone();
  c1.fillColor="black";
  var tempG=new Group();
  tempG.addChildren([c1,c2]);
  fftCircles.addChild(tempG);

}
var resetFftCircles = function(anim) {
  for(var i=0; i<fftCircles.children.length;i++){
    var cG=fftCircles.children[i];
    for(var j=0;j<2;j++){
      cG.children[j].position.y=dimensions.h/2;
    }
  }
}
var waveFormCrv = new Path();
waveFormCrv.strokeColor = 'black';
waveFormCrv.strokeWidth = 5;
for (var i=0; i<256; i++) {
  waveFormCrv.add(new Point(i*(dimensions.w/255),0));
}

// Define two points which we will be using to construct
// the path and to position the gradient color:
var topLeft =[0,0];
var bottomRight = [$("#visualizer").width(),$("#visualizer").height()];

// Create a rectangle shaped path between
// the topLeft and bottomRight points:
var gradientBg = new Path.Rectangle({
    topLeft: topLeft,
    bottomRight: bottomRight
});
    // Fill the path with a gradient of three color stops
    // that runs between the two points we defined earlier:
gradientBg.fillColor= {
  gradient: {
    stops: ['blue', 'blue','blue'],
    radial:true
  },
  origin:gradientBg.position,
  destination: gradientBg.bounds.rightCenter
};

fftCircles.bringToFront();
waveFormCrv.bringToFront();
waveFormCrv.smooth({ type: 'catmull-rom', factor: 0.8 });

var bright=0;
gradientBg.onFrame = function(event){
  if(anim.paused) return;
  if(event.count % 1 == 0){
    var currentSpec=fft.analyze();
    peaking = detectPeak();
    if(peaking){
      console.log('pk');
      bright = 1;
    } else {
      bright *= .99;
    }
    var c1 = getColorFromAmplitude(255,1,0,50),
        c2 = getColorFromAmplitude(255,1,50,150),
        c3 = getColorFromAmplitude(255,1,150,255);
    var newHue=[c1, c2, c3];
    var colour= this.fillColor;
    for (clr in colour.gradient.stops) {
      colour.gradient.stops[clr].color.hue=newHue[clr] * 60 + 180;
      colour.gradient.stops[clr].color.brightness=bright;
    }
  }
}
// the directions of the circles
var dirs=[1,-1];
var gravity = 5;
fftCircles.onFrame = function(event) {
  sanityCheck();
  if(anim.paused) return;
  var currentAvgs = getSubdividedAvg(trimZeroes(fft.analyze()));//get averages
  for (var i in fftCircles.children) {
    var currChild = fftCircles.children[i];
    for (var j = 0; j < 2; j++){
      var currCircle=currChild.children[j];
      if (currCircle.position.y <= fftCircles.bounds.center.y - 300
        && dirs[j] == -1) {
        currCircle.bringToFront();
        dirs[0]*=-1;
        dirs[1]*=-1;
      }
      if(currCircle.position.y>fftCircles.bounds.center.y+300 && dirs[j]==1){
        dirs[0]*=-1;
        dirs[1]*=-1;
      }
      var dy=((currentAvgs[i]/40));

      //currCircle.(currentAvgs[i]/currCircle.scaling, currCircle.bounds.center);;
      currCircle.translate(new Point(0,dy*dirs[j]));// here I set all my y values. for half they are positive.
    }
    currChild.position.y=dimensions.h/2;
  }
  fftCircles.bringToFront();
  fftCircles.position=new Point(waveFormCrv.bounds.width/2,dimensions.h/2)
  if(!q.isPlaying()) {
    anim.reset();
  }
}
waveFormCrv.onFrame=function(event){
  if(anim.paused) return;
  if(event.count%4==0){
    var currentWave=getWaveform(200);
    for(var i in waveFormCrv.segments){
      waveFormCrv.segments[i].point.y=currentWave[i];
    }
    waveFormCrv.position=new Point(waveFormCrv.bounds.width/2,dimensions.h*2/3);
  }
}
var wv2=waveFormCrv.clone();
wv2.strokeColor='white';
wv2.position=new Point(waveFormCrv.bounds.width/2,dimensions.h/3);
wv2.onFrame=function(event){
  if(anim.paused) return;
  if(event.count%4==0){
    var currentWave=getWaveform(200);
    for(var i in wv2.segments){
      wv2.segments[i].point.y=currentWave[i];
    }
    wv2.position=new Point(wv2.bounds.width/2,dimensions.h/3);
  }
};

$(window).resize(function(e){
    //var oldPos= gradientBg.bottomRight;
    dimensions.w= $(window).innerWidth();
    dimensions.h= $(window).innerWidth();
    resizeDimensions(gradientBg,$(window).innerWidth(),$(window).innerHeight());
    waveFormCrv.position=new Point(waveFormCrv.width/2,dimensions.h/2);
    fftCircles.position=new Point(fftCircles.bounds.width/2,dimensions.h/2);
});
