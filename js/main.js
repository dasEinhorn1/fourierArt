

// Define two points which we will be using to construct
// the path and to position the gradient color:
var topLeft =[0,0];
var bottomRight = [$("#visualizer").width(),$("#visualizer").height()];

// Create a rectangle shaped path between
// the topLeft and bottomRight points:
var gradientBg = new Path.Rectangle({
    topLeft: topLeft,
    bottomRight: bottomRight,
    // Fill the path with a gradient of three color stops
    // that runs between the two points we defined earlier:
    fillColor: {
        gradient: {
            stops: ['red', 'blue']
        },
        origin: topLeft,
        destination: bottomRight
    }
});
