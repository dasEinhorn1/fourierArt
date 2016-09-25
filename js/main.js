dimensions={
  w:parseInt($(window).innerWidth()),
  h:parseInt($(window).innerHeight()),
}

Animator=function(){
  this.trimmer={
    time: 10, // loops which may pass before zeros are trimmed
    startTime: 0,
    currentTPath: null
  }
  this.paused=false,
  this.toggle=function(){
    this.paused= !this.paused;
  }
  this.trimPath=function(pth,time){// constructs path, but trims of trailing zeros and scales as necessary.
    count=0;
    if(this.trimmer.startTime==0){
      this.trimmer.startTime=time;
    }
    for(var i=pth.segments-1; i>0; i--){//loop from last to first.
      if(pth.segments[segments.length-i].point.y==0){
        count+=1;
      }else{
        break;
      }
    }
    if(trimdex<pth.segments.length){
      //then i need to remove segments from trimmedPath
      trimmedPath=pth.clone();
      trimdex=pth.segments.length-count;
      trimmedPath.removeSegments[trimdex];
    }else{
      return pth;
    }
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

var fftCrv=new Path();
console.log(fftCrv);
fftCrv.strokeColor = 'white';
fftCrv.strokeWidth = 10;
for(var i=0; i<257; i++){
  fftCrv.add(new Point(i*(dimensions.w/256),0));
}

var waveFormCrv=new Path();
waveFormCrv.strokeColor='black';
waveFormCrv.strokeWidth= 20;
for(var i=0; i<257; i++){
  waveFormCrv.add(new Point(i*(dimensions.w/256),0));
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
waveFormCrv.bringToFront();
waveFormCrv.smooth({ type: 'catmull-rom', factor: 0.5 });
fftCrv.bringToFront();
fftCrv.translate(new Point(0,dimensions.h/2));
fftCrv.smooth({ type: 'catmull-rom', factor: 0.5 });
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

fftCrv.onFrame=function(event){
  if(anim.paused) return;
  if(event.count==200){
    console.log(fftCrv.segments)
  }
  var currentSpec=fft.analyze();
  for(var i in fftCrv.segments){
    fftCrv.segments[i].point.y=currentSpec[i];
  }
  //trimmedFftCrv=anim.trimPath(fftCrv,event.time);
  fftCrv.translate(new Point(0,dimensions.h/3));
}

waveFormCrv.onFrame=function(event){
  if(anim.paused) return;
  if(event.count%4==0){
    var currentWave=getWaveform(100);
    for(var i in waveFormCrv.segments){
      waveFormCrv.segments[i].point.y=currentWave[i];
    }
    waveFormCrv.translate(new Point(0,dimensions.h/2));
  }
}

$(window).resize(function(e){
    //var oldPos= gradientBg.bottomRight;
    dimensions.w=$(window).innerWidth();
    dimensions.h=$(window).innerWidth();
    resizeDimensions(gradientBg,$(window).innerWidth(),$(window).innerHeight());
    fftCrv.translate(new Point(0,dimensions.h/2));

});
