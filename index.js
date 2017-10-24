$(document).ready(function() {
  var DOMURL = window.URL || window.webkitURL || window;

  //var c = document.getElementById("c");
  //var ctx = c.getContext("2d");
  var text = 'Hello World';
  var x = 0;
  var y = 30;
  var fontSize = '24';
  var useKerning = true;
  var githubCDN = 'https://cdn.rawgit.com/themnd/dumb-font-cdn';
  var branch = 'master';
  var cdnPrefix = githubCDN + '/' + branch;
  
  var fontUrls = {
    'Roboto': {
      'regular': 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
      'bold': 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
      'italic': 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-italic-webfont.ttf',
      'bolditalic': 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bolditalic-webfont.ttf'
    },
    'Times New Roman': {
      'regular': cdnPrefix + '/fonts/Times%20New%20Roman.ttf',
      'bold': cdnPrefix + '/fonts/Times%20New%20Roman%20Bold.ttf',
      'italic': cdnPrefix + '/fonts/Times%20New%20Roman%20Italic.ttf',
      'bolditalic': cdnPrefix + '/fonts/Times%20New%20Roman%20Bold%20Italic.ttf'
    },
    'Georgia': {
      'regular': cdnPrefix + '/fonts/Georgia.ttf',
      'bold': cdnPrefix + '/fonts/Georgia%20Bold.ttf',
      'italic': cdnPrefix + '/fonts/Georgia%20Italic.ttf',
      'bolditalic': cdnPrefix + '/fonts/Georgia%20Bold%20Italic.ttf'
    },
  };

  var fontMap = {};

  function getFontUrl() {
    
    var fontType = '';
    var isBold = $('#btnBold').is(':checked');
    var isItalic = $('#btnItalic').is(':checked');
    if (isBold) {
      fontType = 'bold';
    }
    if (isItalic) {
      fontType += 'italic';
    }
    if (fontType === '') {
      fontType = 'regular';
    }
    var selected = $('#fontSelect').val();
    return fontUrls[selected][fontType];
  }

  $('#btnBold').change(function() {
    drawText(text);
  });
  $('#btnItalic').change(function() {
    drawText(text);
  });
  $('#rotate').change(function() {
    drawText(text);
  });
  $('#fontSelect').change(function() {
    drawText(text);
  });
  $('#fontSize').change(function() {
    drawText(text);
  });

  var previousPath;

  function drawTextWithFontGlyphs(font, text, maxWidth) {
    var glyphs = font.stringToGlyphs(text);
    //console.log(glyphs);

    var fontSize = $('#fontSize').val();

    var path = null;
    var fontPx = font.unitsPerEm / fontSize;

    var drawData = [];
    var x = 0;
    var len = text.length;
    /*
    for (var idx = 0; idx < len; idx++) {
      if (idx > 0) {
        var w = glyphs[idx - 1].advanceWidth ;
        var kern = font.getKerningValue(glyphs[idx - 1], glyphs[idx]);
        if (useKerning) {
          w += kern;
        }
        x += (w / fontPx);
      }
      var curPath = glyphs[idx].getPath(x, y + 5, fontSize);
      if (path == null) {
       path = curPath;
      } else {
        for (var i = 0; i < curPath.commands.length; i++) {
          path.commands.push(curPath.commands[i]);
        }
      }
    }
    */
    for (var idx = 0; idx < len; idx++) {
      var data = {};
      data.idx = idx;
      data.w = glyphs[idx].advanceWidth;
      var kern = (idx > 0 ? font.getKerningValue(glyphs[idx - 1], glyphs[idx]) : 0);
      data.kern = kern;
      if (useKerning) {
        data.w = data.w + kern;
      }
      data.x = x;
      data.y = y + 5;
      x += (data.w / fontPx);
      data.nextX = x;
      drawData.push(data);
    }

    var compressX = null;
    if (len > 0) {
      var endX = drawData[len - 1].nextX;
      if (endX < maxWidth) {
        var spaceTotal = maxWidth - endX;
        var spaceEach = spaceTotal / (len - 1);
        for (var idx = 1; idx < len; idx++) {
          drawData[idx].x += spaceEach * idx;
          drawData[idx].nextX += spaceEach * (idx + 1);
        }
      } else if (endX > maxWidth) {
        var spaceTotal = endX - maxWidth;
        var spaceEach = spaceTotal / (len - 1);
        if (spaceEach >= 2.4) {
          spaceEach = 2.4;
        }
        for (var idx = 1; idx < len; idx++) {
          drawData[idx].x -= spaceEach * idx;
          drawData[idx].nextX -= spaceEach * (idx + 1);
        }
        var newEndX = drawData[len - 1].nextX + 2;
        spaceTotal = newEndX - maxWidth;
        var pct = 100 / ((newEndX * 100) / maxWidth);
        console.log('pct', pct);
        if (spaceTotal > 0) {
          compressX = pct;
        }
      }
    }

    for (var idx = 0; idx < len; idx++) {
      var data = drawData[idx];
      var curPath = glyphs[idx].getPath(data.x, data.y, fontSize);
      if (path == null) {
       path = curPath;
      } else {
        for (var i = 0; i < curPath.commands.length; i++) {
          path.commands.push(curPath.commands[i]);
        }
      }
    }

    if (len > 0) {
      var svgPath = path.toSVG();
      $('#s2').html(svgPath);

      var scale = '';
      var r = $('#rotate').val();
      var tx = 0;
      var ty = 10;
      if (compressX) {
        scale = ' scale(' + compressX + ', 1)';
        $('#stretch').val(compressX * 100);
      }
      var translate = 'translate(' + tx + ',' + ty + ') ';
      if (r != 0) {
        $('#s2').attr('transform', translate + ' rotate(' + r + ' 50 50)' + scale);
      } else {
        $('#s2').attr('transform', translate + scale);
      }
    } else {
      $('#s2').html('');
    }
  }

  function drawTextWithFont(font, text) {
    //    ctx.scale(3, .5);
    // Use your font here.
    //font.draw(ctx, text, x, y, fontSize);

    /*
    var path = font.getPath(text, x, y + 5, fontSize);
    //path.stroke = 'black';
    //path.strokeWidth = 2;

    //ctx.transform(1, 0.5, -0.5, 1, 30, 10);
    //path.draw(ctx);
    var svgPath = path.toSVG();
    $('#s').html(svgPath);
    */
    var curWidth = $('#canvasWrapper2').width();
    $('#canvasWrapper2 svg').width(curWidth);
    drawTextWithFontGlyphs(font, text, curWidth);
    //previousPath = path;
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

  $('#text').on('keypress', function(e) {
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

  $('#canvasWrapper2')
    .draggable()
    .resizable({
      resize: function(event, ui) {
        drawText(text);
      }
    });
});
