$(document).ready(function() {
  var DOMURL = window.URL || window.webkitURL || window;

  var c = document.getElementById("c");
  //var ctx = c.getContext("2d");
  var text = 'Hello World';
  var x = 0;
  var y = 30;
  var fontSize = '24';

  var fontMap = {};

  function getFontUrl() {
    var robotoUrl = 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto_condensed/robotocondensed-light-webfont.ttf';
    var robotoBoldUrl = 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf';
    
    if (($('#btnBold').is(':checked'))) {
      return robotoBoldUrl;
    } else {
      return robotoUrl;
    }

    return robotoUrl;
  }

  $('#btnBold').change(function() {
    drawText(text);
  });

  var previousPath;

  function drawTextWithFont(font, text) {
    //    ctx.scale(3, .5);
    // Use your font here.
    //font.draw(ctx, text, x, y, fontSize);

    var path = font.getPath(text, x, y + 5, fontSize);
    //path.stroke = 'black';
    //path.strokeWidth = 2;

    //ctx.transform(1, 0.5, -0.5, 1, 30, 10);
    //path.draw(ctx);
    var svgPath = path.toSVG();
    $('#s').html(svgPath);
    previousPath = path;
  }

  function drawText(text) {
    var fontUrl = getFontUrl();
    var font = fontMap[fontUrl];
    if (!font) {
      console.log('loading font from ' + fontUrl);
      
      opentype.load(getFontUrl(), function(err, font) {
        if (err) {
          alert('Could not load font: ' + err);
        } else {
          fontMap[fontUrl] = font;
          drawTextWithFont(font, text);
        }
      });  
    } else {
      drawTextWithFont(font, text);
    }
  }

  drawText(text);

  $(window).on('keypress', function(e) {
    e.preventDefault();
    //var bbox = previousPath.getBoundingBox();
    //ctx.clearRect(bbox.x1 - 1, bbox.y1 - 1, bbox.x2 + 1, bbox.y2 + 1);
    text = text + String.fromCharCode(e.which);
    drawText(text);
    return false;
  }).on('keydown', function(e) {
    // allow backspace
    if (e.which == 8) {
      text = text.substring(0, text.length - 1);
      drawText(text);
    }
  });
});