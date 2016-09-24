dimensions={
  w:$(window).innerWidth(),
  h:$(window).innerHeight(),
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
allBars=[];
var drawBar = function(pt){
  return new Path.Rectangle({
    topLeft:pt,
    bottomRight:[pt[0]+dimensions.w/1024,pt[1]+dimensions.h/255]
  });
}
var updateBar=function(pt){

}

var drawBars=function(points){
  for (i in points){
    allBars.push(drawBar(points[i]));
  }
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
    stops: ['red', 'black'],
    radial:true
  },
  origin:gradientBg.position,
  destination: gradientBg.bounds.rightCenter
};

function onFrame(event){
  var currentSpec=fft.analyze();
  drawBars(getAllBarPos(currentSpec,dimensions.w,dimensions.h));
  if(event.count%5==0){
    var newHue=getColorFromAmplitude(255);
    console.log(newHue);
    var colour= gradientBg.fillColor;
    for(clr in colour.gradient.stops){
      colour.gradient.stops[clr].color.hue=newHue;
    }
  }
}
$(window).resize(function(e){
    console.log("resize");
    var oldPos= gradientBg.bottomRight;
    resizeDimensions(gradientBg,$(window).innerWidth(),$(window).innerHeight())
});
