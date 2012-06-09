
// copyright (c) 2012 JaxEdit project

var showjax = {
  frameall: [],
  frameidx: 0
};

showjax.loadParser = function() {
  var script = document.createElement("script");
  script.type = "text/x-mathjax-config";
  script[(window.opera ? "innerHTML" : "text")] =
    "MathJax.Hub.Config({\n" +
    //"  skipStartupTypeset: true,\n" +
    "  TeX: { extensions: ['color.js', 'extpfeil.js'] },\n" +
    "  'HTML-CSS': { imageFont: null }\n" +
    "});"
  document.body.appendChild(script);

  corejax.loadScript("mathjax/MathJax.js?config=TeX-AMS_HTML", function(){
    MathJax.Hub.processUpdateTime = 200;
    MathJax.Hub.processUpdateDelay = 15;
    MathJax.Hub.Queue(["Process", MathJax.Hub, document.body]);
    MathJax.Hub.Queue(["initShow", showjax]);
  });
};

showjax.initShow = function() {
  var body = document.body, showarea = document.getElementById("showarea");
  var browser = corejax.browser, prefix, i, node;
  
  this.frameall = [], this.frameidx = 0;
  for (i = 0; i < showarea.childNodes.length; i++) {
    node = showarea.childNodes[i];
    node.style.display = "none";
    if (/\bframe|maketitle\b/.test(node.className)) {
      this.frameall.push(i);
    }
  }
  //console.log(this.frameall);
  if (this.frameall.length == 0) {
    alert("There isn't any beamer frame!");
    window.close();
  } else {
    this.frameidx = 0;
    body.style.overflow = "hidden";
    body.style.backgroundColor = "black";
    body.style.margin = "0";
    body.style.border = "0 none";
    body.style.padding = "0";
    showarea.childNodes[this.frameall[0]].style.display = "block";
    showarea.style.margin = "0";
    showarea.style.border = "0 none";
    showarea.style.padding = "0.8em";
    showarea.style.backgroundColor = "#141428";
    if (browser.firefox >= 3.6) {
      prefix = "-moz-";
    } else if (browser.chrome >= 10 || browser.safari >= 5.1) {
      prefix = "-webkit-";
    } else if (browser.msie >= 10) {
      prefix = "-ms-";
    } else if (browser.opera >= 11.10) {
      prefix = "-o-";
    }
    if (prefix) {
      showarea.style.background = prefix + "linear-gradient(top, #000 0%, #141428 50%, #514C60 100%)";
    }
    showarea.style.color = "white";
    this.showResize();
  }
  window.onresize = showjax.showResize;
  document.onclick = showjax.showNavigate;
  document.onkeydown = showjax.showNavigate;
  document.onmousemove = showjax.showNavigate;
};

showjax.showResize = function() {
  var html = document.documentElement, body = document.body,
      showarea = document.getElementById("showarea");
  var pageWidth = window.innerWidth;
  var pageHeight = window.innerHeight;
  if (typeof pageWidth != "number" ){
     if (document.compatMode == "CSS1Compat"){
        pageWidth = document.documentElement.clientWidth;
        pageHeight = document.documentElement.clientHeight;
     } else {
        pageWidth = document.body.clientWidth;
        pageHeight = document.body.clientHeight; 
     } 
  }
  
  if (pageWidth > 4 * pageHeight / 3) {
    showHeight = pageHeight;
    showWidth = 4 * showHeight / 3;
  } else {
    showWidth = pageWidth;
    showHeight = 3 * showWidth / 4;
  }
  
  html.style.width = pageWidth + "px";
  body.style.width = pageWidth + "px";
  showarea.style.width = showWidth + "px";
  showarea.style.height = showHeight + "px";
  showarea.style.marginLeft = (pageWidth - showWidth) / 2 + "px";

  body.style.fontSize = "250%";
};
  
showjax.showNavigate = function(event) {
  var ev = event ? event : window.event;
  var k = showjax.frameidx;
  var showarea = document.getElementById("showarea");
  switch (ev.type) {
    case "click":
      showjax.frameidx = (k + 1 == showjax.frameall.length) ? 0 : k + 1;
      ev.preventDefault ? ev.preventDefault() : ev.returnValue = false;
      break;
    case "keydown":
      switch(ev.keyCode) {
        case 27: // escape
          window.close();
          break;
        case 37: case 63234:  // left arrow
        case 38: case 63232:  // up arrow
          showjax.frameidx = (k == 0) ? showjax.frameall.length - 1 : k - 1;
          ev.preventDefault ? ev.preventDefault() : ev.returnValue = false;
          break;
        case 39: case 63235:  // right arrow
        case 40: case 63233:  // down arrow
          showjax.frameidx = (k + 1 == showjax.frameall.length) ? 0 : k + 1;
          ev.preventDefault ? ev.preventDefault() : ev.returnValue = false;
          break;
      }
      break;
    case "mousemove":
      if (corejax.browser.msie) {
        var infodiv = document.getElementById("infodiv");
        if (ev.clientY < 50) {
          infodiv.style.display = "block";
        } else {
          setTimeout(function(){infodiv.style.display = "none";}, 3000);      
        }
      }
      break;
  }
  //console.log(k, showjax.frameidx);
  showarea.childNodes[showjax.frameall[k]].style.display = "none";
  showarea.childNodes[showjax.frameall[showjax.frameidx]].style.display = "block";
  showarea.childNodes[showjax.frameall[showjax.frameidx]].style.border = "none";
};

showjax.addExport = function() {
  var infodiv = document.createElement("div");
  infodiv.innerHTML = "<span>Export</span>";
  infodiv.id = "infodiv";
  infodiv.style.cssText = "position:absolute; left:0; top:0; padding:6px; border-radius:4px; font-size:16px; font-family:arial; background-color:white;";
  document.body.appendChild(infodiv);
  setTimeout(function(){infodiv.style.display = "none";}, 3000);
  infodiv.onclick = function(event) {
    var ev = event ? event : window.event;
    if (corejax.browser.msie) {
      document.execCommand("SaveAs", false, "showjax.html");
    } else {
      var text = encodeURIComponent("<!DOCTYPE html><html>" + document.documentElement.innerHTML + "</html>");
      var data = "data:x-application/text;charset=utf-8," + text;
      location.href = data;
    }
    ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
  }
};

window.onload = function(){
  var body = document.body;
  // firefox 10, chrome 15 and safari 5.1
  var requestFullScreen = body.requestFullScreen || body.mozRequestFullScreen || body.webkitRequestFullScreen;
  if (requestFullScreen) requestFullScreen.call(body);
  showjax.loadParser();
  if (corejax.browser.msie) {
    showjax.addExport();
  }
}
