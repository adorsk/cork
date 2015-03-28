var canvas = document.getElementById('myCanvas');
var context = canvas.getContext('2d');

function drawImage(imageObj) {
    var imageWidth = imageObj.width;
    var imageHeight = imageObj.height;
    canvas.width = imageWidth;
    canvas.height = imageHeight;

    context.drawImage(imageObj, 0, 0);

    var imageData = context.getImageData(0, 0, imageWidth, imageHeight);
    var data = imageData.data;

    // iterate over all pixels
    for(var i = 0, n = data.length; i < n; i += 4) {
        var red = data[i];
        var green = data[i + 1];
        var blue = data[i + 2];
        var alpha = data[i + 3];
    }
}

var imageObj = new Image();
imageObj.onload = function() {
    drawImage(this);
};
imageObj.src = '/testImages/testImage.jpg';
