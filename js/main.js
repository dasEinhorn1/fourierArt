dimensions={
  w:parseInt($(window).innerWidth()),
  h:parseInt($(window).innerHeight()),
  circle: 10
}

Animator=function(){
  this.paused=false,

  this.toggle=function(){
    this.paused= !this.paused;
  }
  this.trimPath=function(pth){// constructs path, but trims of trailing zeros and scales as necessary.
    count=0;
    for(var i=pth.segments.length-1; i>-1; i-=1){//loop from last to first.
      if(pth.segments[i].point.y == dimensions.h/3 || pth.segments[i].point.y==NaN){
        console.log("Slowly but surely")
        count+=1;
      }else{
        break;
      }
    }
    return 256-count;
  }
}
anim=new Animator()

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

/*var allBars=new Group({});
var drawBar = function(pt){
  var bar= new Path.Rectangle({
    topLeft:pt,
    bottomRight:[pt[0]+(1.875),pt[1]+(1920/255)],
  });
  bar.fillColor="green";
  bar.strokeColor="green";
  allBars.addChild(bar);
  return bar;
}
var updateBar=function(id,pt){
  resizeDimensions(allBars.children[id],pt[0],pt[1]);// resize bar existing at this points
}
var updateBars=function(points){
  for(i in points){
    updateBar(i,points[i]);
  }
}
var drawBars=function(points){
  for (i in points){
    drawBar(points[i]);
  }
}
*/

var fftCircles=new Group();
for(var i=0; i<16; i++){ // i(totalwidth/32)+totalwidth/16
  c1= new Path.Circle(new Point((i*dimensions.w/16),dimensions.h/2), dimensions.circle);
  c1.fillColor="white"
  c2=c1.clone();
  fftCircles.addChildren([c1,c2]);
}

var waveFormCrv=new Path();
waveFormCrv.strokeColor='black';
waveFormCrv.strokeWidth= 20;
for(var i=0; i<256; i++){
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
    stops: ['red', 'red','blue'],
    radial:true
  },
  origin:gradientBg.position,
  destination: gradientBg.bounds.rightCenter
};

//initialize bars to populate stuff
/*
drawBars(getAllBarPos(fft.analyze(),dimensions.w,dimensions.h));
allBars.bringToFront();
allBars.position=new Point(dimensions.w/2,dimensions.h/2);
allBars.onFrame=function(event){
  if(event.count%10==0){
    var currentSpec=fft.analyze();
    updateBars(getAllBarPos(currentSpec));
  }
}
console.log(allBars.position)
*/
fftCircles.bringToFront();
waveFormCrv.bringToFront();
waveFormCrv.smooth({ type: 'catmull-rom', factor: 0.5 });

var bright=0;
gradientBg.onFrame= function(event){
  if(anim.paused) return;
  if(event.count%1==0){
    var currentSpec=fft.analyze();
    if (bright>0){
      bright-=.01;
    }
    if(detectPeak()){
      bright=1;
    }
    var newHue=[ getColorFromAmplitude(256,0,0,25),getColorFromAmplitude(122,0,0,15),getColorFromAmplitude(0,0,0,15)];
    var colour= this.fillColor;
    for(clr in colour.gradient.stops){
      colour.gradient.stops[clr].color.hue=newHue[clr];
      colour.gradient.stops[clr].color.brightness=bright;
    }
  }
}

fftCircles.onFrame=function(event){
  if(anim.paused) return;
  var currentAvgs=fft.analyze();//get averages
  for(var i in fftCircles.children){
    neg= -1;
    if(i%2==0) neg*=-1;
    fftCircles.children[i].position.y=currentAvgs[i]*neg;// here I set all my y values. for half they are positive.
  }
  fftCircles.position=new Point(waveFormCrv.bounds.width/2,dimensions.h/2)
}
waveFormCrv.onFrame=function(event){
  if(anim.paused) return;
  if(event.count%4==0){
    var currentWave=getWaveform(200);
    for(var i in waveFormCrv.segments){
      waveFormCrv.segments[i].point.y=currentWave[i];
    }
    waveFormCrv.position=new Point(waveFormCrv.bounds.width/2,dimensions.h/2);
  }
}

$(window).resize(function(e){
    //var oldPos= gradientBg.bottomRight;
    dimensions.w= $(window).innerWidth();
    dimensions.h= $(window).innerWidth();
    resizeDimensions(gradientBg,$(window).innerWidth(),$(window).innerHeight());
    waveFormCrv.position=new Point(0,dimensions.h/2);
    fftCrv.position=new Point(fftCrv.bounds.width/2,dimensions.h/2);
});
