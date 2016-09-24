dimensions={
  w:parseInt($(window).innerWidth()),
  h:parseInt($(window).innerHeight()),
}

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

var crv=new Path();
console.log(crv);
crv.strokeColor = 'white';
crv.strokeWidth = 10;
for(var i=0; i<257; i++){
  crv.add(new Point(i*(dimensions.w/256),0));
}
crv.segments[10].point.y=10;
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
    stops: ['red', 'red','red'],
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

crv.bringToFront();
crv.translate(new Point(0,dimensions.h/2));
  crv.smooth({ type: 'catmull-rom', factor: 0.5 });

gradientBg.onFrame= function(event){
  var currentSpec=fft.analyze();
  var newHue=[ getColorFromAmplitude(0),getColorFromAmplitude(60),getColorFromAmplitude(122)];
  var colour= this.fillColor;
  for(clr in colour.gradient.stops){
    colour.gradient.stops[clr].color.hue=newHue[clr];
  }
}

crv.onFrame=function(event){
  if(event.count==200){
    console.log(crv.segments)
  }
  var currentSpec=fft.analyze();
  for(var i in crv.segments){
    crv.segments[i].point.y=currentSpec[i];
  }
  crv.translate(new Point(0,dimensions.h/2));
}
$(window).resize(function(e){
    //var oldPos= gradientBg.bottomRight;
    dimensions.w=$(window).innerWidth();
    dimensions.h=$(window).innerWidth();
    resizeDimensions(gradientBg,$(window).innerWidth(),$(window).innerHeight());
    crv.translate(new Point(0,dimensions.h/2));

});
