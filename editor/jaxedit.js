
// copyright (c) 2011-2012 JaxEdit project

if (!window.console) console = {log : function() {}};

var jaxedit = {
  highlight: false,
  hasParser: false,
  autoScroll: false,
  canPresent: true,
  useDrive: null
};

jaxedit.childs = {
  html : document.documentElement,
  body : document.body,
  header : document.getElementById("header"),
  newbtn : document.getElementById("newbtn"),
  openbtn : document.getElementById("openbtn"),
  savebtn : document.getElementById("savebtn"),
  presbtn : document.getElementById("presbtn"),
  loginbtn : document.getElementById("loginbtn"),
  drivesel: document.getElementById("drivesel"),
  left : document.getElementById("left"),
  //ltop : document.getElementById("ltop"),
  source : document.getElementById("source"),
  codearea : document.getElementById("codearea"),
  lbot : document.getElementById("lbot"),
  right : document.getElementById("right"),
  //rtop : document.getElementById("rtop"),
  preview : document.getElementById("preview"),
  showarea : document.getElementById("showarea"),
  rbot : document.getElementById("rbot")
};

jaxedit.scrollers = {
  codelength : 0,
  codechange : 0,
  codescroll : 0,
  showscroll : 0,
  showheight : 1,
  divheights : [] 
};

jaxedit.textdata = {
  oldtextvalue : "", oldtextsize : 0, oldselstart : 0, oldselend : 0, oldseltext : "",
  newtextvalue : "", newtextsize : 0, newselstart : 0, newselend : 0, newseltext : ""
};

if (jaxedit.highlight) {
  jaxedit.cmChange = function(editor, change) {
    console.log(change.from, change.to, change.text);
    var textvalue = editor.getValue(),
        textsize = textvalue.length,
        delstart = editor.indexFromPos(change.from),
        delend = editor.indexFromPos(change.to),
        deltext = editor.getRange(change.from, change.to),
        instext = change.text.join('\n');
    console.log(delstart, delend, deltext, instext, textsize);
    typejax.updater.puttask(delstart, delend, deltext, instext, textsize, jaxedit.childs.showarea);
  };

  jaxedit.addCodeMirror = function() {
    jaxedit.editor = CodeMirror.fromTextArea(jaxedit.childs.codearea, {
      lineNumbers: true,
      lineWrapping: true,
      matchBrackets: true,
      onChange : function(editor, change) {jaxedit.cmChange(editor, change);}
    });
  };

  corejax.loadStyles("codemirror/lib/codemirror.css");
  corejax.loadScript("codemirror/lib/codemirror.js", function(){
    corejax.loadScript("codemirror/mode/stex/stex.js", function(){
      jaxedit.addCodeMirror();
    });
  });
}

jaxedit.doResize = function() {
  var childs = jaxedit.childs,
      html = childs.html,
      body = childs.body,
      header = childs.header,
      left = childs.left,
      ltop = childs.ltop,
      source = childs.source,
      codearea = childs.codearea,
      lbot = childs.lbot,
      right = childs.right,
      rtop = childs.rtop,
      preview = childs.preview,
      showarea = childs.showarea,
      rbot = childs.rbot;  

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
  
  var halfwidth = pageWidth / 2 - 8;
  if (corejax.browser.msie && corejax.browser.msie <= 6)
    var realheight = pageHeight - 11;
  else
    var realheight = pageHeight - 4;
  var headheight = 42;
  var topheight = 0;
  var botheight = 24;
 
  html.style.width = pageWidth - 8 + "px";
  body.style.width = pageWidth - 8 + "px";

  header.style.width = pageWidth - 12 + "px";
  left.style.width = halfwidth + "px";
  left.style.height = realheight - headheight + "px";
  //ltop.style.width = halfwidth - 6 + "px";
  source.style.width = halfwidth - 2 + "px";
  source.style.height = realheight - headheight - topheight - botheight + "px";
  if (jaxedit.editor) {
    jaxedit.editor.getScrollerElement().style.height = realheight - headheight - topheight - botheight - 20 + "px";
  } else {
    codearea.style.width = halfwidth - 8 + "px";
    codearea.style.height = realheight - headheight - topheight - botheight - 10 + "px";
  }
  lbot.style.width = halfwidth - 6 + "px";
  
  right.style.width = halfwidth + "px";
  right.style.height = realheight - headheight + "px";
  //rtop.style.width = halfwidth - 6 + "px";  
  preview.style.width = halfwidth - 6 + "px";
  preview.style.height = realheight - headheight - topheight - botheight - 8 + "px";
  showarea.style.width = halfwidth - 6 + "px";
  showarea.style.height = realheight - headheight - topheight - botheight - 10 + "px";
  rbot.style.width = halfwidth - 6 + "px";  
};

jaxedit.loadParser = function() {
  var script = document.createElement("script");
  script.type = "text/x-mathjax-config";
  script[(window.opera ? "innerHTML" : "text")] =
    "MathJax.Hub.Config({\n" +
    "  skipStartupTypeset: true,\n" +
    "  TeX: { extensions: ['color.js', 'extpfeil.js'] },\n" +
    "  'HTML-CSS': { imageFont: null }\n" +
    "});"
  document.body.appendChild(script);

  corejax.loadStyles("typejax/typejax.css");
  corejax.loadScript("typejax/typejax.js", function(){
    corejax.loadScript("mathjax/MathJax.js?config=TeX-AMS_HTML", function(){
      MathJax.Hub.processUpdateTime = 200;
      MathJax.Hub.processUpdateDelay = 15;
      jaxedit.initParser();
      jaxedit.hasParser = true;
      jaxedit.autoScroll = true;
    });
  });
};

jaxedit.initParser = function() {
  var childs = jaxedit.childs,
      codearea = childs.codearea,
      lbot = childs.lbot,
      showarea = childs.showarea;
  var data = jaxedit.textdata;

  data.newtextvalue = codearea.value;
  data.newtextsize = codearea.value.length;
  data.newselstart = codearea.selectionStart;
  data.newselend = codearea.selectionEnd;

  lbot.innerHTML = "size: " + data.newtextsize + "; textarea: initialized";  
  this.scrollers.codelength = data.newtextsize;
  this.scrollers.codechange = 0;
  this.scrollers.codescroll = 0;
  this.scrollers.showscroll = 0;
  this.scrollers.showheight = 1;
  this.scrollers.divheights = [];
  typejax.updater.init(data.newtextvalue, data.newtextsize, showarea);
};

jaxedit.doLoad = function() {
  var codearea = jaxedit.childs.codearea,
      showarea = jaxedit.childs.showarea;

  jaxedit.autoScroll = false;
  jaxedit.doResize();
  
  if (window.localStorage) {
    if (localStorage.getItem("texcode")) {
      codearea.value = localStorage.getItem("texcode");
    }
    if (localStorage.getItem("scroll")) {
      codearea.scrollTop = parseInt(localStorage.getItem("scroll"));
    }
  }

  document.body.style.visibility = "visible";
  showarea.innerHTML = '<div style="font-size:1em;margin-top:6em;text-align:center;">Loading TypeJax and MathJax...</div>';
 
  jaxedit.loadParser();
  jaxedit.addButtons();
  jaxedit.addHandler();

  if (!jaxedit.editor && corejax.browser.msie) codearea.setActive();
};

jaxedit.doChange = function(event) {
  var ev = event ? event : window.event; // standard or ie
  var browser = corejax.browser;
  var childs = jaxedit.childs,
      codearea = childs.codearea,
      lbot = childs.lbot,
      showarea = childs.showarea;
  var data = jaxedit.textdata;
  var oldtextvalue = data.oldtextvalue,
      oldtextsize  = data.oldetextsize, 
      oldselstart  = data.oldselstart,
      oldselend    = data.oldselend,
      oldseltext   = data.oldseltext,
      newtextvalue = data.newtextvalue, 
      newtextsize  = data.newtextsize, 
      newselstart  = data.newselstart, 
      newselend    = data.newselend,
      newseltext   = data.newseltext;
  
  oldselstart  = newselstart;
  oldselend    = newselend;
  oldtextvalue = newtextvalue;
  oldtextsize  = newtextsize;
  oldseltext   = newseltext;

  newtextvalue = codearea.value;
  newtextsize  = codearea.value.length;
  
  if (browser.msie && browser.msie <= 8) {
    var range1 = document.selection.createRange();
    var range2 = range1.duplicate();
    range2.moveToElementText(codearea);
    range2.setEndPoint('EndToEnd',range1);
    newselstart = range2.text.length - range1.text.length;
    newselend = newselstart + range1.text.length;
    newseltext = range1.text;
  } else {
    newselstart  = codearea.selectionStart;
    newselend    = codearea.selectionEnd;
    newseltext   = newtextvalue.substring(newselstart,newselend);
  }
  
  var omitted = false;
  
  if (ev.type == "mousemove" && document.activeElement.id != "codearea") { // codearea unused
    omitted = true;
  } else if ( ev.type == "mousemove" && oldselstart == newselstart && oldselend == newselend ) { // codearea in use
    omitted = true;    
  } else if (ev.type == "focus"){
    omitted = true;
  } else if (ev.type == "mousedown"){ // click to clear old selection
    omitted = true;
  } else if (ev.type == "mouseup" && newselstart == newselend) {
    omitted = true; 
  } else if (ev.type == "keydown" && ev.keyCode == 229 && browser.webkit){
    // todo: iuput method in chrome
    // note: keydown event is also used when pressing a key for some time
  }
  
  if (omitted) return;

  var delstart = 0, delend = 0, /*delsize = 0,*/ deltext = "";
  var insstart = 0, insend = 0, /*inssize = 0,*/ instext = "";
  
  delstart = (oldselstart < newselstart) ? oldselstart : newselstart;
  delend = (oldtextsize-oldselend < newtextsize-newselend) ? oldselend : oldtextsize - newtextsize + newselend;
  
  if (browser.firefox && oldselstart < oldselend && newselstart == newselend) {
    // fix for draging selection leftward in firefox
    var tempstart = newselstart - (oldselend - oldselstart);
    if ( newselend < oldselend && tempstart >= 0 && delstart > tempstart)
      delstart = tempstart;
  }

  if (browser.webkit || browser.opera) {
    // fix for input method in chrome browser
    // this way is dirty, rewrite it another time
    delstart = (delstart - 64 > 0) ? delstart - 64 : 0;
    delend = (delend + 64 < oldtextsize) ? delend + 64 : oldtextsize;
  }
  //console.log(delstart,delend);

  // we should always keep these two equalities
  insstart = delstart;
  insend = newtextsize - oldtextsize + delend;
  
  while (newtextvalue.charAt(delstart) == oldtextvalue.charAt(delstart) && delstart < delend && insstart < insend){
    delstart += 1;
    insstart += 1;
  }
  while (newtextvalue.charAt(delend-1) == oldtextvalue.charAt(delend-1) && delstart < delend && insstart < insend){
    delend -= 1;
    insend -= 1;
  }
  
  deltext = oldtextvalue.substring(delstart, delend);
  instext = newtextvalue.substring(insstart, insend);

  //console.log("textsize:" + newtextsize + "; selection:" + oldselstart + "-" + oldselend + " to " +  newselstart + "-" + newselend + "; change: " + delstart + " to " + delend + "; event:" + ev.type + "; deltext:" + deltext + " ;instext:" + instext);
  lbot.innerHTML = "size: " + newtextsize + "; selection: " + oldselstart + "-" + oldselend + " to " + newselstart + "-" + newselend;

  data.oldtextvalue = oldtextvalue;
  data.oldetextsize = oldtextsize;
  data.oldselstart  = oldselstart;
  data.oldselend    = oldselend;
  data.oldseltext   = oldseltext;
  data.newtextvalue = newtextvalue;
  data.newtextsize  = newtextsize;
  data.newselstart  = newselstart;
  data.newselend    = newselend;
  data.newseltext   = newseltext;
      
  if (window.localStorage) {
    if (deltext != "" || instext != "") {
      //IE8 sometimes crashes when writing empty value to a localStorage item
      if (codearea.value != "") {
        localStorage.setItem("texcode", codearea.value);
      } else {
        localStorage.removeItem("texcode");
      }
    }
  }
  
  if (jaxedit.hasParser) {
    jaxedit.scrollers.codelength = newtextsize;
    jaxedit.scrollers.codechange = delstart;
    jaxedit.scrollers.codescroll = codearea.scrollTop;
    typejax.updater.puttask(delstart, delend, deltext, instext, newtextsize, showarea);
  }
};

jaxedit.doScroll = function(isForward) {
  if (!jaxedit.autoScroll) return;
  var scrollers = this.scrollers, divheights = scrollers.divheights;
  if (!divheights.length) return;
  var codescroll = scrollers.codescroll, codelength = scrollers.codelength, codechange = scrollers.codechange,
      showscoll = scrollers.showscroll, showheight = scrollers.showheight;   
  var codearea = this.childs.codearea, showarea = this.childs.showarea,
      leftpos = codearea.scrollTop, rightpos = showarea.scrollTop,
      leftscroll = codearea.scrollHeight, rightscroll = showarea.scrollHeight,
      leftclient = codearea.clientHeight, rightclient = showarea.clientHeight,
      leftsize = leftscroll - leftclient, rightsize = rightscroll - rightclient;
  var length, height, data, h, i, newpos, thatpos, thatarea;
  
  //console.log("leftsize:", leftsize, "rightsize:", rightsize);
  // leftpos <--> length <--> height <--> rightpos
  if (isForward) { // left to right
    /* length = codelength * (leftpos / leftsize); */
    if (leftpos <= codescroll) {
      length = (codescroll <= 0) ? 0 : codechange * leftpos / codescroll;
    } else {
      length = (codescroll >= leftsize) ? codelength : codechange + (codelength - codechange) * (leftpos - codescroll) / (leftsize - codescroll)
    }
    height = 0;
    for (i = 0; i < divheights.length; i++) {
      data = divheights[i];
      if (length > data[1]) {
        height += data[2];
      } else {
        height += data[2] * (length - data[0]) / (data[1] - data[0]);
        break;
      }
    }
    newpos = rightsize * (height / showheight);
    //console.log("left2right:", leftpos, Math.round(length), Math.round(height), Math.round(newpos));
    thatpos = rightpos, thatarea = showarea;
  } else { // right to left
    h = height = showheight * rightpos / rightsize;
    for (i = 1; i < divheights.length; i++) {
      data = divheights[i];
      if (h > data[2]) {
        h -= data[2];
      } else {
        if (data[2] > 0) {
          length = data[0] + (data[1] - data[0]) * h / data[2];
        } else {
          length = data[0];
        }
        break;
      }
    }
    /* newpos = leftsize * length / codelength; */
    if (length <= codechange) {
      newpos = (codechange <= 0) ? 0 : codescroll * length / codechange;
    } else {
      newpos = (codechange >= codelength) ? leftsize : codescroll + (leftsize - codescroll) * (length - codechange) / (codelength - codechange);
    }
    //console.log("right2left:", rightpos, Math.round(height), Math.round(length), Math.round(newpos));
    thatpos = leftpos, thatarea = codearea;
  }
  
  if (Math.abs(newpos - thatpos) > 10) {
    jaxedit.autoScroll = false;
    thatarea.scrollTop = newpos;
    setTimeout(function(){jaxedit.autoScroll = true;}, 20);
  }
};

jaxedit.addButtons = function() {
  var browser = corejax.browser, codearea = this.childs.codearea, showarea = this.childs.showarea;
  var newbtn = document.getElementById("newbtn"),
      openbtn = document.getElementById("openbtn"),
      opensel = document.getElementById("opensel"),
      savebtn = document.getElementById("savebtn"),
      presbtn = document.getElementById("presbtn"),
      loginbtn = document.getElementById("loginbtn"),
      drivesel = document.getElementById("drivesel");

  var doOpen = function(evt) {
    var files = evt.target.files,
        reader = new FileReader();
    reader.onload = function() {
      //console.log(this.readyState);
      codearea.value = this.result;
      jaxedit.initParser(this.result, this.result.length, showarea);
    };
    reader.readAsText(files[0]);
  };
  
  var fileOpen = function(event) {
    var ev = event ? event : window.event;  
    switch (jaxedit.useDrive) {
      case "localdrive":
        opensel.click();
        ev.preventDefault();
        break;
      case "skydrive":
        skydrive.getFilesList("open");
        break;
    }
  };

  var doSave = function() {
    var BlobBuilder = window.BlobBuilder || window.MozBlobBuilder || window.WebKitBlobBuilder || window.MSBlobBuilder;
    var URL = window.URL || window.webkitURL;
    var bb = new BlobBuilder;
    bb.append(codearea.value);
    var blob = bb.getBlob("text/latex"); 
    var bloburl = URL.createObjectURL(blob);
    location.href = bloburl;
    //URL.revokeObjectURL(bloburl); // doesn't work in chrome
  };
  
  var fileSave = function() {
    switch (jaxedit.useDrive) {
      case "localdrive":
        doSave();
        break;
      case "skydrive":
        skydrive.getFilesList("save");
        break;
    }
  };

  var addFileHandler = function() {
    newbtn.style.display = "inline-block";
    newbtn.disabled = true;
    openbtn.style.display = "inline-block";
    savebtn.style.display = "inline-block";
    openbtn.onclick = fileOpen;
    savebtn.onclick = fileSave;
  };
  
  var changeDrive = function(event) {
    var ev = event ? event : window.event,
        sel = ev.target || ev.srcElement;
    var olddrive = jaxedit.useDrive,
        newdrive = sel.options[sel.selectedIndex].value;
    if (newdrive == olddrive) return;
    jaxedit.useDrive = newdrive; 
    switch (newdrive) {
      case "localdrive":
        skydrive.signUserOut();
        break;
      case "skydrive":
        skydrive.signUserIn();
    }
  };

  var dlgclose = document.getElementById("dlgclose");
  dlgclose.onclick = jaxedit.toggleModal;
  
  // chrome browser will prevent file reading and saving at local
  // unless --allow-file-access-from-files switch was added to it
  if ((browser.firefox && browser.firefox >= 6) ||
      (browser.chrome && browser.chrome >= 8 && location.protocol != "file:") ||
      (browser.msie && browser.msie >= 10)) {
    jaxedit.useDrive = "localdrive";
    opensel.addEventListener("change", doOpen, false);
    addFileHandler();
  } else {
    opensel.style.display = "none";
  }

  if (location.protocol != "file:") {
    corejax.loadScript("http://js.live.net/v5.0/wl.js", function(){
      corejax.loadScript("editor/skydrive.js", function(){
        skydrive.initDrive();
        if (jaxedit.useDrive == "localdrive") {
          drivesel.style.display = "inline-block";
          drivesel.onchange = changeDrive;
        } else {
          jaxedit.useDrive = "skydrive";
          addFileHandler();
          loginbtn.style.display = "inline-block";
          loginbtn.onclick = skydrive.signUserInOut;
        }
      });
    });
  }
  
  if ((browser.msie && browser.msie < 9 && location.protocol != "file:") || browser.opera) {
    jaxedit.canPresent = false;
  } else {
    presbtn.onclick = function() {
      var w, doc, showarea;
      if (document.exitFullscreen || document.mozCancelFullScreen || document.webkitCancelFullScreen) {
        w = window.open("", "showjax");
      } else {
        w = window.open("", "showjax", "fullscreen");
      }
      doc = w.document;
      showarea = jaxedit.childs.showarea;
      doc.write('<!DOCTYPE html><html><head><title>JaxEdit Beamer Presentation</title>');
      doc.write('<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />');
      doc.write('<link rel="stylesheet" type="text/css" href="typejax/showjax.css" />');
      doc.write('<script type="text/javascript" src="typejax/corejax.js"></scr' + 'ipt>');
      doc.write('<script type="text/javascript" src="typejax/showjax.js"></scr' + 'ipt></head><body>');
      doc.write('<div id="showarea">' + showarea.innerHTML + '</div>');
      doc.write('</body></html>');
      doc.close();
    }
  }
};

jaxedit.changeLoginButton = function(value) {
  document.getElementById("loginbtn").value = value;
};

jaxedit.toggleLogin = function() {
  var el = document.getElementById("loginbtn");
  el.value = (el.value == "Login") ? "Logout" : "Login";
};

jaxedit.toggleModal = function() {
  var ol = document.getElementById("overlay"),
      ct = document.getElementById("container");
  ol.style.visibility = (ol.style.visibility == "visible") ? "hidden" : "visible";
  ct.style.visibility = (ct.style.visibility == "visible") ? "hidden" : "visible";
};

jaxedit.addHandler = function() {
  var codearea = this.childs.codearea,
      showarea = this.childs.showarea;

  codearea.onkeydown = this.doChange;
  //codearea.onkeypress = this.doChange;
  codearea.onkeyup = this.doChange;

  //codearea.onfocus = this.doChange;
  //codearea.onblur = this.doChange;

  codearea.onmousedown = this.doChange;
  codearea.onmousemove = this.doChange;
  codearea.onmouseup = this.doChange;

  codearea.oncopy = this.doChange;
  codearea.oncut = this.doChange;
  codearea.onpaste = this.doChange;

  //codearea.oninput = this.doChange;
  //codearea.addEventListener("textInput", this.doChange, false);
  //codearea.addEventListener("textinput", this.doChange, false);
  //codearea.onchange = this.doChange;
  //codearea.onpropertychange = this.doChange;

  codearea.onscroll = function () {
    if (window.localStorage) {
      localStorage.setItem("scroll", codearea.scrollTop);
    }
    jaxedit.doScroll(true);
  };
  
  showarea.onscroll = function() {
    jaxedit.doScroll(false);
  };
};

window.onload = jaxedit.doLoad;
window.onresize = jaxedit.doResize;
