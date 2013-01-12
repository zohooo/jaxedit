
/* JaxEdit: online LaTeX editor with live preview
 * Copyright (c) 2011-2013 JaxEdit project
 * License: GNU General Public License, Version 3
 *
 * Website: http://jaxedit.com
 * Source:  https://github.com/zohooo/jaxedit
 * Release: http://code.google.com/p/jaxedit/
 */

var showjax = {
  frameall: [],
  framedone: [],
  frameidx: 0,
  showarea: null,
};

showjax.startPresent = function() {
  var showarea = this.showarea;
  var i, node;
  this.frameall = [], this.frameidx = 0;
  for (i = 0; i < showarea.childNodes.length; i++) {
    node = showarea.childNodes[i];
    if (/\bframe|maketitle\b/.test(node.className)) {
      this.frameall.push(i);
    } else {
      node.style.display = "none";
    }
  }
  //console.log(this.frameall);
  if (this.frameall.length == 0) {
    alert("There isn't any beamer frame!");
    jaxedit.doResize();
  } else {
    this.initShow();
    this.resizeShow();
    MathJax.Hub.config.showProcessingMessages = false;
    MathJax.Hub.Rerender(showarea); //"Rerender" vs "Reprocess"
    MathJax.Hub.Queue([showjax, function(){
      var showarea = document.getElementById("showarea");
      this.frameidx = 0;
      this.framedone[0] = true;
      for (i = 1; i < this.frameall.length; i++) {
        showarea.childNodes[this.frameall[i]].style.display = "none";
      }
      showarea.style.overflow = "hidden";
    }]);
    window.onresize = function(){showjax.resizeShow()};
    document.onclick = document.onkeydown = document.onmousemove = function(event){showjax.navigateShow(event)};
  }
};

showjax.initShow = function() {
  var body = document.body, showarea = this.showarea;
  var preview = document.getElementById("preview");
  var parent, childs, chd, i, node = showarea;
  do {
    parent = node.parentNode;
    childs = parent.childNodes;
    for (var i = 0; i < childs.length; i++) {
      chd = childs[i];
      if (chd.nodeType != 1) continue;
      if (chd == node) {
        chd.style.height = chd.style.width = "100%";
        chd.style.margin = chd.style.padding = "0px";
        chd.style.border = "none";
      } else {
        chd.style.display = "none";
      }
    }
    node = parent;
  } while (parent != body);

  body.style.backgroundColor = "black";

  var browser = jsquick.browser, prefix;
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
    preview.style.background = prefix + "linear-gradient(top, #000 0%, #141428 50%, #514C60 100%)";
  }

  showarea.style.position = "static";
  showarea.style.width = showarea.style.height = "96%";
  showarea.style.padding = "2%";
};

showjax.resizeShow = function() {
  var preview = document.getElementById("preview");
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

  preview.style.width = showWidth + "px"; preview.style.height = showHeight + "px";
  preview.style.marginLeft = preview.style.marginRight = (pageWidth - showWidth) / 2 + "px";
};

showjax.navigateShow = function(event) {
  var ev = event ? event : window.event;
  var k = showjax.frameidx;
  var showarea = showjax.showarea;
  switch (ev.type) {
    case "click":
      showjax.frameidx = (k + 1 == showjax.frameall.length) ? 0 : k + 1;
      ev.preventDefault ? ev.preventDefault() : ev.returnValue = false;
      break;
    case "keydown":
      switch(ev.keyCode) {
        case 27: // escape
          jaxedit.doResize();
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
      if (jsquick.browser.msie) {
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
  //if (!showjax.framedone[showjax.frameidx]) {
    MathJax.Hub.Rerender(showarea);
    showjax.framedone[showjax.frameidx] = true;
  //}
};

showjax.addInfotip = function() {
  var shortcut, fullinfo;
  switch (jsquick.system) {
    case 'windows':
    case 'linux':
      shortcut = 'F11';
      break;
    case 'macos':
      if (jsquick.browser.safari) {
        return;
      } else {
        shortcut = 'Cmd+Shift+F';
      }
      break;
  }
  fullinfo = "Press Esc to quit";
  if (shortcut) {
    fullinfo += ". Press " + shortcut + " for fullscreen";
  }
  var fulldiv = document.createElement("div");
  fulldiv.innerHTML = "<span>" + fullinfo + "</span>";
  fulldiv.style.cssText = "position:absolute; top:0; right: 0; padding:6px; border-radius:4px; font-size:16px; font-family:arial; background-color:white;";
  document.body.appendChild(fulldiv);
  setTimeout(function(){document.body.removeChild(fulldiv);}, 5000);
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
    if (jsquick.browser.msie) {
      document.execCommand("SaveAs", false, "showjax.html");
    } else {
      var text = encodeURIComponent("<!DOCTYPE html><html>" + document.documentElement.innerHTML + "</html>");
      var data = "data:x-application/text;charset=utf-8," + text;
      location.href = data;
    }
    ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
  }
};

showjax.doPresent = function(showarea){
  this.showarea = showarea;
  this.startPresent();
  if (jsquick.browser.msie) {
    this.addExport();
  } else {
    this.addInfotip();
  }
};
