
// copyright (c) 2011-2012 JaxEdit project

if (!window.console) console = {log : function() {}};

var jaxedit = {
  hasEditor: false,
  hasParser: false,
  mathpath: '',
  mathname: 'MathJax.js?config=TeX-AMS_HTML',
  gatepath: '',
  shareurl: '',
  autoScroll: false,
  canPresent: true,
  fileid: 0,
  wcode: null,
  fileName: 'noname.tex',
  useDrive: null,
  localDrive: false,
  view: 'write',
  dialogMode: null
};

jaxedit.options = {
  highlight: false,
  localjs: false,
  debug: false
};

jaxedit.childs = {
  html : document.documentElement,
  body : document.body,
  wrap : document.getElementById("wrap"),
  head : document.getElementById("head"),
  newbtn : document.getElementById("newbtn"),
  openbtn : document.getElementById("openbtn"),
  savebtn : document.getElementById("savebtn"),
  presbtn : document.getElementById("presbtn"),
  loginbtn : document.getElementById("loginbtn"),
  drivesel: document.getElementById("drivesel"),
  main : document.getElementById("main"),
  left : document.getElementById("left"),
  ltop : document.getElementById("ltop"),
  source : document.getElementById("source"),
  codearea : document.getElementById("codearea"),
  lbot : document.getElementById("lbot"),
  resizer : document.getElementById("resizer"),
  right : document.getElementById("right"),
  rtop : document.getElementById("rtop"),
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

jaxedit.getOptions = function() {
  var options = this.options, browser = $.browser, computer = $.computer;

  if (browser.chrome || browser.firefox >= 3 || browser.msie >=8 || browser.safari >= 5.2 || browser.opera >= 9) {
    if (computer == 'desktop') {
      options.highlight = true;
    }
  }

  options.localjs = (location.protocol == 'file:');

  var qs = location.search.length > 0 ? location.search.substring(1) : '';
  var items = qs.split('&'), pair, name, value;

  for (var i=0; i<items.length; i++) {
    pair = items[i].split('=');
    name = decodeURIComponent(pair[0]);
    value = pair[1] ? decodeURIComponent(pair[1]) : "";
    switch (typeof options[name]) {
      case 'boolean':
        if (value == 'true' || value == '1') {
          options[name] = true;
        } else if (value == 'false' || value == '0') {
          options[name] = false;
        }
        break;
      case 'number':
        value = parseFloat(value);
        if (!isNaN(value)) {
          options[name] = value;
        }
        break;
      case 'string':
        options[name] = value;
        break;
    }
  }

  this.mathpath = options.localjs ? 'library/mathjax/unpacked/' : 'http://cdn.mathjax.org/mathjax/2.1-latest/';
  this.gatepath = (location.pathname == '/note/') ? 'http://jaxedit.com/gate/' : 'http://jaxedit.com/door/';
  this.shareurl = (location.pathname == '/note/') ? 'http://jaxedit.com/note/' : 'http://jaxedit.com/beta/';
};

jaxedit.fetchFile = function() {
  function checkVisit() {
    var scode = document.getElementById("share_scode").value;
    jaxedit.changeDialog('bodyload', 'footclose', 'Fetch File', 'Fetching file...');
    jaxedit.downloadContent(jaxedit.fileid, scode);
  };

  function checkPress() {
    var ev = event ? event : window.event;
    if (ev.keyCode == 13) checkVisit();
  }

  var i = parseInt(location.hash.substring(1));
  if (isFinite(i)) this.fileid = i;
  if (this.fileid > 0) {
    this.childs.codearea.value = '';
    this.view = 'load';
    document.getElementById("dbtnvisit").onclick = checkVisit;
    document.getElementById("dialog").onkeypress = checkPress;
    this.changeDialog('bodyvisit', 'footvisit', 'Enter Password');
    document.getElementById("share_scode").focus();
  }
};

jaxedit.doResize = function(clientX) {
  var childs = jaxedit.childs,
      html = childs.html,
      body = childs.body,
      head = childs.head,
      main = childs.main,
      left = childs.left,
      ltop = childs.ltop,
      source = childs.source,
      codearea = childs.codearea,
      lbot = childs.lbot,
      resizer = childs.resizer,
      right = childs.right,
      rtop = childs.rtop,
      preview = childs.preview,
      showarea = childs.showarea,
      rbot = childs.rbot;  
  var wsizes = [], hsizes = [];

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

  var headHeight = 42, topHeight = 26, botHeight = 24, halfBorder = 4;
  var mainWidth = pageWidth, mainHeight = pageHeight - headHeight,
      halfHeight = mainHeight - halfBorder, wrapHeight = halfHeight - topHeight - botHeight;
  var lHalfWidth, lWrapWidth, rHalfWidth, rWrapWidth;

  if (jaxedit.view == 'read') {
    wsizes.push([html, pageWidth]);
    wsizes.push([body, 802]);
    wsizes.push([head, 798]);
    wsizes.push([main, 802]); hsizes.push([main, mainHeight]);
    wsizes.push([right, 798]); hsizes.push([right, halfHeight]);
    wsizes.push([preview, 794]); hsizes.push([preview, halfHeight - 8]);
    wsizes.push([showarea, 694]); hsizes.push([showarea, halfHeight - 108]);
    jaxedit.resizeElements(wsizes, hsizes);
    body.style.height = '100%';
    left.style.display = resizer.style.display = 'none';
    rtop.style.display = rbot.style.display = 'none';
    showarea.style.padding = '50px';
    body.style.margin = 'auto';
    body.style.backgroundColor = 'gray';
    right.style.backgroundColor = 'white';
    return;
  };

  if (typeof clientX == 'number') {
    lHalfWidth = lWrapWidth = clientX - halfBorder,
    rHalfWidth = rWrapWidth = pageWidth - clientX - halfBorder;
  } else {
    lHalfWidth = lWrapWidth = Math.ceil(pageWidth / 2) - halfBorder,
    rHalfWidth = rWrapWidth = Math.floor(pageWidth / 2) - halfBorder;
  }
  if (lHalfWidth < 0) {
    left.style.display = 'none'; rHalfWidth = pageWidth - halfBorder - 2;
  } else {
    left.style.display = 'block';
  }
  if (rHalfWidth < 0) {
    right.style.display = 'none'; lHalfWidth = pageWidth - halfBorder - 2;
  } else {
    right.style.display = 'block';
  }

  wsizes.push([html, pageWidth]);
  wsizes.push([body, pageWidth]);
  wsizes.push([head, pageWidth - 4]);
  wsizes.push([main, mainWidth]); hsizes.push([main, mainHeight]);

  wsizes.push([left, lHalfWidth]); wsizes.push([right, rHalfWidth]);
  hsizes.push([left, halfHeight]); hsizes.push([right, halfHeight]);

  hsizes.push([resizer, halfHeight + 4]);
  resizer.style.left = ((lHalfWidth + 2 < 0) ? 0 : (lHalfWidth + 2)) + 'px';

  wsizes.push([ltop, lWrapWidth - 6]); wsizes.push([rtop, rWrapWidth - 6]);

  wsizes.push([source, lWrapWidth - 2]); hsizes.push([source, wrapHeight]);
  if (jaxedit.options.highlight && jaxedit.editor) {
    wsizes.push([jaxedit.editor.getWrapperElement(), lWrapWidth - 8]);
    hsizes.push([jaxedit.editor.getWrapperElement(), wrapHeight - 10]);
  } else {
    wsizes.push([codearea, lWrapWidth - 8]);
    hsizes.push([codearea, wrapHeight - 10]);
  }
  
  wsizes.push([preview, rWrapWidth - 6]); hsizes.push([preview, wrapHeight - 8]);
  wsizes.push([showarea, rWrapWidth - 6]); hsizes.push([showarea, wrapHeight - 10]);

  wsizes.push([lbot, lWrapWidth - 6]); wsizes.push([rbot, rWrapWidth - 6]);

  jaxedit.resizeElements(wsizes, hsizes);
};

jaxedit.resizeElements = function(wsizes, hsizes) {
  for (var i = 0; i < wsizes.length; i++) {
    wsizes[i][0].style.width = wsizes[i][1] + "px";
  };
  for (i = 0; i < hsizes.length; i++) {
    hsizes[i][0].style.height = hsizes[i][1] + "px";
  };
};

jaxedit.loadEditor = function() {
  if (this.options.highlight) {
    $.loadStyles("library/codemirror/lib/codemirror.css");
    $.loadScript("editor/textarea/colorful.js", function(){
      $.loadScript("library/codemirror/lib/codemirror.js", function(){
        $.loadScript("library/codemirror/mode/stex/stex.js", function(){
          $.loadScript("library/codemirror/lib/util/matchbrackets.js", function(){
            jaxedit.addEditor();
            jaxedit.hasEditor = true;
            jaxedit.initialize();
          });
        });
      });
    });
  } else {
    $.loadScript("editor/textarea/simple.js", function(){
      jaxedit.addEditor();
      jaxedit.hasEditor = true;
      jaxedit.initialize();
    });
  }
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

  $.loadStyles("typejax/typejax.css");
  $.loadScript("typejax/typejax.js", function(){
    $.loadScript(jaxedit.mathpath + jaxedit.mathname, function(){
      MathJax.Hub.processUpdateTime = 200;
      MathJax.Hub.processUpdateDelay = 15;
      jaxedit.hasParser = true;
      jaxedit.initialize();
      jaxedit.autoScroll = true;
    });
  });
};

jaxedit.initialize = function() {
  if (this.hasEditor && this.hasParser) {
    this.initEditor();
  }
};

jaxedit.initEditor = function(value) {
  var childs = this.childs,
      codearea = childs.codearea,
      lbot = childs.lbot,
      showarea = childs.showarea;
  var editor = this.editor,
      scrollers = this.scrollers,
      data = this.textdata;
  var highlight = this.options.highlight;

  if (!highlight && $.browser.msie) codearea.setActive();

  if (typeof value == 'string') {
    if (highlight) {
      value = value.replace(/\r\n?/g,'\n');
    }
    editor.setValue(value);
    data.newtextvalue = value;
  } else {
    data.newtextvalue = editor.getValue();
  }
  data.newtextsize = data.newtextvalue.length;
  if (!highlight) {
    data.newselstart = codearea.selectionStart;
    data.newselend = codearea.selectionEnd;
  }

  lbot.innerHTML = "size: " + data.newtextsize + "; textarea: initialized";
  scrollers.codelength = data.newtextsize;
  scrollers.codechange = 0;
  scrollers.codescroll = 0;
  scrollers.showscroll = 0;
  scrollers.showheight = 1;
  scrollers.divheights = [];

  editor.setReadOnly(true);
  typejax.updater.init(data.newtextvalue, data.newtextsize, showarea);
  this.addHandler();
  editor.setReadOnly(false);
};

jaxedit.doLoad = function() {
  var codearea = jaxedit.childs.codearea,
      showarea = jaxedit.childs.showarea;

  jaxedit.getOptions();
  jaxedit.bindCoreElements();
  jaxedit.fetchFile();
  jaxedit.autoScroll = false;
  
  if (window.localStorage && jaxedit.fileid <= 0) {
    if (localStorage.getItem("texcode")) {
      codearea.value = localStorage.getItem("texcode");
    }
    if (localStorage.getItem("scroll")) {
      codearea.scrollTop = parseInt(localStorage.getItem("scroll"));
    }
  }

  if (jaxedit.view == 'write') {
    jaxedit.showWindow();
  }

  showarea.innerHTML = '<div style="font-size:1em;margin-top:6em;text-align:center;">Loading TypeJax and MathJax...</div>';
  jaxedit.loadEditor();
  jaxedit.loadParser();
};

jaxedit.showWindow = function() {
  jaxedit.doResize();
  this.childs.wrap.style.visibility = "visible";
  if (jaxedit.view == 'write') {
    jaxedit.addButtons();
    jaxedit.addResizer();
  }
};

jaxedit.addResizer = function() {
  var resizer = this.childs.resizer, main = this.childs.main;

  resizer.onmousedown = function(event) {
    jaxedit.forResize = true;
    var ev = event ? event : window.event;
    if (ev.preventDefault) {
      ev.preventDefault();
    } else {
      ev.returnValue = false;
    }
  };

  main.onmousemove = function(event) {
    if (jaxedit.forResize) {
      var ev = event ? event : window.event;
      resizer.style.left = (ev.clientX - 2) + 'px';
    }
  };

  resizer.onmouseup = function(event) {
    if (jaxedit.forResize) {
      var ev = event ? event : window.event;
      jaxedit.doResize(ev.clientX);
    }
    jaxedit.forResize = false;
  };
};

jaxedit.doScroll = function(isForward) {
  if (!jaxedit.autoScroll) return;
  var scrollers = this.scrollers, divheights = scrollers.divheights;
  if (!divheights.length) return;
  var editor = this.editor, showarea = this.childs.showarea,
      leftpos = editor.getScrollInfo().top, rightpos = showarea.scrollTop;
  var length, newpos, thatpos, thatarea;

  // leftpos <--> length <--> height <--> rightpos

  if (isForward) { // left to right
    length = this.getLeftIndex();
    newpos = this.getRightScroll(length);
    //console.log("left2right:", leftpos, Math.round(length), Math.round(newpos));
    thatpos = rightpos, thatarea = showarea;
  } else { // right to left
    length = this.getRightIndex();
    newpos = this.getLeftScroll(length);
    //console.log("right2left:", rightpos, Math.round(length), Math.round(newpos));
    thatpos = leftpos, thatarea = editor;
  }

  if (Math.abs(newpos - thatpos) > 10) {
    jaxedit.autoScroll = false;
    if (isForward) {
      thatarea.scrollTop = newpos;
    } else {
      thatarea.scrollTo(0, newpos);
    }
    setTimeout(function(){jaxedit.autoScroll = true;}, 20);
  }
};

jaxedit.getLeftIndex = function() {
  var scrollers = this.scrollers,
      codescroll = scrollers.codescroll,
      codelength = scrollers.codelength,
      codechange = scrollers.codechange;
  var editor = this.editor,
      editinfo = editor.getScrollInfo(),
      leftpos = editinfo.top,
      leftscroll = editinfo.height,
      leftclient = editinfo.clientHeight,
      leftsize = leftscroll - leftclient;
  var length;
  /* length = codelength * (leftpos / leftsize); */
  if (leftpos <= codescroll) {
    length = (codescroll <= 0) ? 0 : codechange * leftpos / codescroll;
  } else {
    length = (codescroll >= leftsize) ? codelength : codechange + (codelength - codechange) * (leftpos - codescroll) / (leftsize - codescroll)
  }
  return length;
};

jaxedit.getLeftScroll = function(length) {
  var scrollers = this.scrollers,
      codescroll = scrollers.codescroll,
      codelength = scrollers.codelength,
      codechange = scrollers.codechange;
  var editor = this.editor,
      editinfo = editor.getScrollInfo(),
      leftpos = editinfo.top,
      leftscroll = editinfo.height,
      leftclient = editinfo.clientHeight,
      leftsize = leftscroll - leftclient;
  var newpos;
  /* newpos = leftsize * length / codelength; */
  if (length <= codechange) {
    newpos = (codechange <= 0) ? 0 : codescroll * length / codechange;
  } else {
    newpos = (codechange >= codelength) ? leftsize : codescroll + (leftsize - codescroll) * (length - codechange) / (codelength - codechange);
  }
  return newpos;
};

jaxedit.getRightIndex = function() {
  var scrollers = this.scrollers,
      divheights = scrollers.divheights,
      showscoll = scrollers.showscroll,
      showheight = scrollers.showheight;
  var showarea = this.childs.showarea,
      rightpos = showarea.scrollTop,
      rightscroll = showarea.scrollHeight,
      rightclient = showarea.clientHeight,
      rightsize = rightscroll - rightclient;
  var length, data, i;
  var height = showheight * rightpos / rightsize;
  for (i = 1; i < divheights.length; i++) {
    data = divheights[i];
    if (height > data[2]) {
      height -= data[2];
    } else {
      if (data[2] > 0) {
        length = data[0] + (data[1] - data[0]) * height / data[2];
      } else {
        length = data[0];
      }
      break;
    }
  }
  return length;
};

jaxedit.getRightScroll = function(length) {
  var scrollers = this.scrollers,
      divheights = scrollers.divheights,
      showscoll = scrollers.showscroll,
      showheight = scrollers.showheight;
  var showarea = this.childs.showarea,
      rightpos = showarea.scrollTop,
      rightscroll = showarea.scrollHeight,
      rightclient = showarea.clientHeight,
      rightsize = rightscroll - rightclient;
  var height = 0, data, i;
  for (i = 0; i < divheights.length; i++) {
    data = divheights[i];
    if (length > data[1]) {
      height += data[2];
    } else {
      height += data[2] * (length - data[0]) / (data[1] - data[0]);
      break;
    }
  }
  var newpos = rightsize * (height / showheight);
  return newpos;
};

jaxedit.setScrollers = function(length, change, scroll) {
  var scrollers = this.scrollers;
  scrollers.codelength = length;
  scrollers.codechange = change;
  scrollers.codescroll = scroll;
};

jaxedit.bindCoreElements = function() {
  var dlgclose = document.getElementById("dlgclose"),
      dbtnclose = document.getElementById("dbtnclose"),
      helpbtn = document.getElementById("helpbtn"),
      presbtn = document.getElementById("presbtn");
  dbtnclose.onclick = dlgclose.onclick = function(){ jaxedit.toggleModal(false); };
  helpbtn.onclick = function() {
    window.open("http://jaxedit.com/#help", "_blank");
  };
  helpbtn.style.display = "inline-block";
  if (location.search == "?present=off") {
    jaxedit.canPresent = false;
  } else {
    presbtn.onclick = function() {
      var w, doc;
      var showarea = jaxedit.childs.showarea;
      var content = ['<!DOCTYPE html><html><head><title>JaxEdit Beamer Presentation</title>',
                     '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />',
                     '<link rel="stylesheet" type="text/css" href="typejax/typejax.css" />',
                     '<link rel="stylesheet" type="text/css" href="typejax/showjax.css" />',
                     '<script type="text/x-mathjax-config">',
                        'MathJax.Hub.Config({\n',
                        '  TeX: { extensions: ["color.js", "extpfeil.js"] },\n',
                        '  "HTML-CSS": { imageFont: null }\n',
                        '});',
                     '</scr' + 'ipt>',
                     '<script type="text/javascript" src="' + jaxedit.mathpath + jaxedit.mathname + '"></scr' + 'ipt>',
                     '<script type="text/javascript" src="jsquick/jsquick.js"></scr' + 'ipt>',
                     '<script type="text/javascript" src="typejax/showjax.js"></scr' + 'ipt></head><body>',
                     '<div id="showarea">' + showarea.innerHTML + '</div>',
                     '</body></html>'].join('');
      if ($.browser.msie) {
        w = window.open("", "showjax", "fullscreen");
      } else {
        w = window.open("", "showjax");
      }
      doc = w.document;
      doc.write(content);
      doc.close();
    }
  }
};

jaxedit.addButtons = function() {
  var browser = $.browser, codearea = this.childs.codearea, showarea = this.childs.showarea;
  var newbtn = document.getElementById("newbtn"),
      openbtn = document.getElementById("openbtn"),
      opensel = document.getElementById("opensel"),
      savebtn = document.getElementById("savebtn"),
      sharebtn = document.getElementById("sharebtn"),
      loginbtn = document.getElementById("loginbtn"),
      drivesel = document.getElementById("drivesel");

  var doOpen = function(evt) {
    var file = evt.target.files[0],
        reader = new FileReader();
    reader.onload = function() {
      //console.log(this.readyState);
      jaxedit.initEditor(this.result);
    };
    document.getElementById('filename').innerHTML = jaxedit.fileName = name;
    reader.readAsText(file);
  };
  
  var fileOpen = function(event) {
    var ev = event ? event : window.event;  
    switch (jaxedit.useDrive) {
      case "localdrive":
        opensel.click();
        ev.preventDefault();
        break;
      case "skydrive":
        driveOpenSave("open");
        break;
    }
  };

  var doSave = function() {
    var BlobBuilder = window.BlobBuilder || window.MozBlobBuilder || window.WebKitBlobBuilder || window.MSBlobBuilder;
    var URL = window.URL || window.webkitURL;
    var bb = new BlobBuilder;
    bb.append(jaxedit.editor.getValue());
    var blob = bb.getBlob("text/latex"); 
    var bloburl = URL.createObjectURL(blob);
    var name = jaxedit.fileName.split(/\.[^.]+$/)[0] + '.tex';
    if ($.browser.chrome >= 14) {
      var anchor = document.createElement("a");
      anchor.style.visibility = "hidden";
      anchor.href = bloburl;
      anchor.download = name;
      document.body.appendChild(anchor);
      var evt = document.createEvent('Event');
      evt.initEvent("click", true, true);
      anchor.dispatchEvent(evt);
      document.body.removeChild(anchor);
    } else if ($.browser.msie >= 10) {
      navigator.msSaveBlob(blob, name);
    } else {
      location.href = bloburl;
      //URL.revokeObjectURL(bloburl); // doesn't work in chrome
    }
  };
  
  var fileSave = function() {
    switch (jaxedit.useDrive) {
      case "localdrive":
        doSave();
        break;
      case "skydrive":
        driveOpenSave("save");
        break;
    }
  };
  
  var driveOpenSave = function(mode) {
    var dlgtitle = document.getElementById('dlgtitle'),
        dlgflist = document.getElementById('dlgflist'),
        bodyload = document.getElementById('bodyload'),
        savename = document.getElementById('savename'),
        dbtnsave = document.getElementById('dbtnsave');
    bodyload.innerHTML = 'Loading...';
    dlgflist.onclick = dialogClick;
    if (mode == "open") {
      jaxedit.dialogMode = "open";
      dlgtitle.innerHTML = "Open File";
      jaxedit.changeDialog('bodyload', 'footclose');
    } else {
      jaxedit.dialogMode = "save";
      dlgtitle.innerHTML = "Save File";
      savename.value = jaxedit.fileName.split(/\.[^.]+$/)[0];
      dbtnsave.onclick = checkSave;
      jaxedit.changeDialog('bodyload', 'footsave');
    }
    (function(){
      if (skydrive.homeid){
        skydrive.getFilesList(handleResponse);
      } else {
        setTimeout(arguments.callee, 100);
      }
    })();
  };
  
  var handleResponse = function(response) {
    var dlginside = document.getElementById('dlginside'),
        dlgwalkup = document.getElementById('dlgwalkup'),
        dlgflist = document.getElementById('dlgflist');
    if (!response.error) {
      var bodytext = "", data, type, name, fid, url, size, time, ftype;
      var finside = skydrive.finside;
      dlginside.innerHTML = finside[finside.length - 1].name;
      if (finside.length <= 1) {
        dlgwalkup.style.display = "none";
      } else {
        dlgwalkup.style.display = "inline";
      }
      bodytext += '<table frame="box" rules="rows"><thead><tr class="finfo"><th>Type</th><th>Name</th><th class="fsize">Size</th><th class="ftime">Modified</th></tr></thead><tbody>';
      for (var i = 0; i < response.data.length; i++) {
        data = response.data[i];
        type = data.type; name = data.name; fid = data.id; time = data.updated_time.slice(0, 10);
        if (type == "file" || type == "folder") {
          url = (type == "file") ? data.source : "#";
          size = (type == "file") ? data.size : "---";
          ftype = (type == "file") ? "File" : "Folder";
          bodytext += '<tr class="' + type + '"><td>' + ftype + '</td><td><a href="javascript:void(0)" data-fid="' + fid + '" data-url="' + url + '">' + name + '</a></td><td class="fsize">' + size + '</td><td class="ftime">' + time + '</td></tr>';
        }
      }
      bodytext += '</tbody></table>';
      dlgflist.innerHTML = bodytext;
      jaxedit.changeDialog('bodylist');
    }
    else {
      jaxedit.toggleLoading('Error in reading LaTeX files!');
    }
  };

  var createCORSRequest = function(method, url) {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
      xhr.open(method, url, true);
    } else if (typeof XDomainRequest != "undefined") {
      xhr = new XDomainRequest();
      xhr.open(method, url);
    } else {
      xhr = null;
      console.log("no xdr!");
    }
    return xhr;
  };
  
  var getFileContent = function(url, name) {
    console.log("fetch file: " + url);
    var path = jaxedit.gatepath + 'drive.php?path=' + encodeURIComponent(jaxedit.encodeText(url));
    var request = createCORSRequest("get", path);
    jaxedit.toggleLoading('Opening file...');
    if (request) {
      request.onload = function(){
        var status = request.status;
        if ((status >= 200 && status <300) || status == 304) {
          document.getElementById('filename').innerHTML = jaxedit.fileName = name;
          jaxedit.initEditor(request.responseText);
          jaxedit.toggleModal(false);
        } else {
          jaxedit.toggleLoading(status + ' error in opening file!');
        }
      };
      request.onerror = function(){
        jaxedit.toggleLoading('An error occurred!');
      };
    request.send();
    }
  };

  var saveFileContent = function(data, name) {
    var fid = skydrive.finside[skydrive.finside.length - 1].fid,
        hostpath = 'https://apis.live.net/v5.0/' + fid + '/files',
        querystr = '?access_token=' + encodeURIComponent(skydrive.access_token),
        gatepath = jaxedit.gatepath + 'drive.php';
    var url, path, boundary, content, request;
    jaxedit.changeDialog("bodyload", "footclose", "", "Saving file...");
    if (location.search == "?put") { // using PUT method
      url = hostpath + '/' + name + querystr;
      path = gatepath + '?path=' + encodeURIComponent(jaxedit.encodeText(url));
      content = data;
      request = createCORSRequest('PUT', path);
      request.setRequestHeader('Content-Type', 'text/plain; charset=utf-8');
    } else { // using POST method
      url = hostpath + querystr;
      path = gatepath + '?path=' + encodeURIComponent(jaxedit.encodeText(url));
      boundary = 'jjaaxxeeddiitt';
      content = ['--' + boundary,
                 'Content-Disposition: form-data; name="file"; filename="' + name + '"',
                 'Content-Type: text/plain; charset=utf-8',
                 '',
                 data,
                 '--' + boundary + '--'].join('\r\n');
      request = createCORSRequest('POST', path);
      request.setRequestHeader('Content-Type', 'multipart/form-data; boundary=' + boundary);
    }
    if (request) {
      request.onload = function(){
        var status = request.status;
        if ((status >= 200 && status <300) || status == 304) {
          document.getElementById('filename').innerHTML = jaxedit.fileName = name;
          jaxedit.toggleModal(false);
        } else {
          jaxedit.toggleLoading(status + ' error in saving file!');
        }
      };
      request.onerror = function(){
        jaxedit.toggleLoading('An error occurred!');
      };
    request.send(content);
    }
  };

  var checkSave = function() {
    var fname = document.getElementById('savename').value;
    if (fname === "") {
      alert('Filename is empty!');
      return;
    } else {
      //skydrive api doesn't support .tex file, use .txt instead
      saveFileContent(jaxedit.editor.getValue(), fname + '.txt');
    }
  };

  var dialogClick = function(event) {
    var ev = event ? event : window.event,
        target = ev.target || ev.srcElement;
    if (target.nodeName.toUpperCase() == "A") {
      var fid = target.getAttribute("data-fid");
      console.log("clicked: fid = " + fid);
      switch (target.parentNode.parentNode.className) {
        case "file":
          if (jaxedit.dialogMode == 'open') {
            getFileContent(target.getAttribute("data-url"), target.innerHTML);
          }
          break;
        case "folder":
          jaxedit.toggleLoading('Loading...');
          skydrive.finside.push({fid: fid, name: target.innerHTML});
          skydrive.getFilesList(handleResponse);
          break;
      }
    }
  };
  
  var dialogWalkup = function() {
    jaxedit.changeDialog('bodyload');
    skydrive.finside.pop();
    skydrive.getFilesList(handleResponse);
  };

  var addFileHandler = function() {
    openbtn.onclick = fileOpen;
    savebtn.onclick = fileSave;
  };

  var changeDrive = function(event) {
    var ev = event ? event : window.event,
        sel = ev.target || ev.srcElement;
    var olddrive = jaxedit.useDrive,
        newdrive = sel.options[sel.selectedIndex].value;
    if (newdrive == olddrive) return;
    switch (newdrive) {
      case "localdrive":
        skydrive.signUserOut();
        break;
      case "skydrive":
        skydrive.signUserIn();
    }
    sel.selectedIndex = 0;
  };

  var dlgwalkup = document.getElementById("dlgwalkup");
  dlgwalkup.onclick = dialogWalkup;
  
  // chrome browser will prevent file reading and saving at local
  // unless --allow-file-access-from-files switch was added to it
  if ((browser.firefox && browser.firefox >= 6) ||
      (browser.chrome && browser.chrome >= 8 && location.protocol != "file:") ||
      (browser.msie && browser.msie >= 10)) {
    jaxedit.localDrive = true;
    jaxedit.useDrive = "localdrive";
    opensel.style.visibility = "visible";
    opensel.addEventListener("change", doOpen, false);
    addFileHandler();
    jaxedit.changeFileDisplay(true);
  } else {
    jaxedit.localDrive = false;
    opensel.style.display = "none";
  }

  if (location.protocol != "file:" && window.XMLHttpRequest && 'withCredentials' in new XMLHttpRequest()) {
    $.loadScript("http://js.live.net/v5.0/wl.js", function(){ // wl.debug.js
      $.loadScript("editor/webdrive/skydrive.js", function(){
        if (jaxedit.localDrive) {
          drivesel.style.display = "inline-block";
          drivesel.onchange = changeDrive;
          drivesel.selectedIndex = 0;
        } else {
          jaxedit.useDrive = "skydrive";
          addFileHandler();
          loginbtn.style.display = "inline-block";
          loginbtn.onclick = skydrive.signUserInOut;
        }
        skydrive.initDrive();
      });
    });
  }

  var setupShare = function() {
    var dialog = document.getElementById('dialog'),
        dlgtitle = document.getElementById('dlgtitle'),
        dbtnshare = document.getElementById('dbtnshare'),
        share_email = document.getElementById('share_email'),
        share_rcode = document.getElementById('share_rcode'),
        share_wcode = document.getElementById('share_wcode');
    dlgtitle.innerHTML = 'Share File';
    share_rcode.value = share_wcode.value = jaxedit.randomString(4);
    share_wcode.value += jaxedit.randomString(2);
    dbtnshare.onclick = checkShare;
    dialog.onkeypress = keyPress;
    jaxedit.changeDialog('bodyshare', 'footshare');
    share_email.focus();
  };

  var checkShare = function() {
    var name = jaxedit.fileName ? jaxedit.fileName : 'noname.tex';
    var note = document.getElementById("share_note");
    var email = document.getElementById('share_email').value,
        rcode = document.getElementById('share_rcode').value,
        wcode = document.getElementById('share_wcode').value;
    if (rcode.length < 4) {
      note.innerHTML = 'Error: reading password is too short!';
    } else if (wcode.length < 6) {
      note.innerHTML = 'Error: editing password is too short!';
    } else if (email.indexOf('@') <= 0 || email.indexOf('@') == email.length - 1) {
      note.innerHTML = 'Error: your email address is invalid!';
    } else {
      jaxedit.changeDialog("bodyload", "footclose", "", "Uploading file...");
      jaxedit.uploadContent(jaxedit.editor.getValue(), name, null, wcode, rcode, email);
    }
  };

  function keyPress() {
    var ev = event ? event : window.event;
    if (ev.keyCode == 13) checkShare();
  }

  sharebtn.onclick = function() {
    var fid = jaxedit.fileid;
    var name = jaxedit.fileName ? jaxedit.fileName : 'noname.tex';
    if (fid > 0) {
      jaxedit.uploadContent(jaxedit.editor.getValue(), name, fid, jaxedit.wcode);
    } else {
      setupShare();
    }
  };
  if (location.protocol != "file:") {
    sharebtn.style.display = "inline-block";
  }
  /*
  window.onbeforeunload = function() {
    if (jaxedit.useDrive == 'skydrive') {
      if ($.browser.chrome || confirm('Do you want to logout from SkyDrive?')) {
        skydrive.signUserOut();
      }
    }
  }
  */
};

jaxedit.downloadContent = function(fid, wcode) {
  console.log("fetch file with fid=" + fid);
  var path = jaxedit.gatepath + 'share.php', info = 'fid=' + fid + '&wcode=' + wcode;
  path += '?info=' + encodeURIComponent(this.encodeText(encodeURIComponent(info)));

  function success(text, status, xhr) {
    if ((status >= 200 && status <300) || status == 304) {
      document.getElementById('filename').innerHTML = jaxedit.fileName = name;
      console.log('hasEditor', jaxedit.hasEditor, 'hasParser', jaxedit.hasParser);
      var data = decodeURIComponent(jaxedit.decodeText(text));
      if (jaxedit.hasEditor && jaxedit.hasParser) {
        jaxedit.initEditor(data);
      } else if (jaxedit.hasEditor) {
        jaxedit.editor.setValue(data);
      } else {
        jaxedit.childs.codearea.value = data;
      }
      jaxedit.wcode = wcode;
      var view = xhr.getResponseHeader('Permission');
      jaxedit.toggleModal(false);
      if (jaxedit.view !== 'view') {
        jaxedit.view = view;
        jaxedit.showWindow();
      }
    } else {
      jaxedit.toggleLoading(status + ': ' + text);
    }
  }

  $.ajax({
    type: "GET",
    url: path,
    data: "",
    success: success
  });
};

jaxedit.uploadContent = function(data, name, fid, wcode, rcode, email) {
  var path = jaxedit.gatepath + 'share.php', info = 'wcode=' + wcode;
  if (fid) info += '&fid=' + fid;
  if (rcode) info += '&rcode=' + rcode;
  if (email) info += '&email=' + email;
  path += '?info=' + encodeURIComponent(this.encodeText(encodeURIComponent(info)));
  var boundary, content, request;

  boundary = 'jjaaxxeeddiitt';
  content = ['--' + boundary,
             'Content-Disposition: form-data; name="file"; filename="' + name + '"',
             'Content-Type: text/plain; charset=utf-8',
             '',
             this.encodeText(encodeURIComponent(data)),
             '--' + boundary + '--'].join('\r\n');

  function success(text, status) {
    if ((status >= 200 && status <300) || status == 304) {
      document.getElementById('filename').innerHTML = jaxedit.fileName = name;
      jaxedit.fileid = parseInt(text);
      jaxedit.wcode = wcode;
      jaxedit.showShareUrl(text);
    } else {
      jaxedit.toggleLoading(status + ': ' + text);
    }
  }

  $.ajax({
    type: "POST",
    url: path,
    data: content,
    success: success,
    contentType: 'multipart/form-data; boundary=' + boundary
  });
};

jaxedit.showShareUrl = function(fid) {
  var shareurl = this.shareurl + '#' + fid;
  var shareinfo = 'Sharing URL is <a href="' + shareurl + '">' + shareurl + '</a>';
  jaxedit.changeDialog('bodyload', 'footclose', "Share File", shareinfo);
};

jaxedit.changeFileDisplay = function(display) {
  var newbtn = document.getElementById("newbtn"),
     openbtn = document.getElementById("openbtn"),
     savebtn = document.getElementById("savebtn");
  if (display) {
    //newbtn.style.display = "inline-block";
    openbtn.style.display = "inline-block";
    savebtn.style.display = "inline-block";
  } else {
    //newbtn.style.display = "none";
    openbtn.style.display = "none";
    savebtn.style.display = "none";
  }
};

jaxedit.changeStatus = function(status) {
  if (status == "connected") {
    this.useDrive = "skydrive";
    if (this.localDrive) {
      document.getElementById("drivesel").selectedIndex = 1;
    } else {
      this.changeFileDisplay(true);
      document.getElementById("loginbtn").value = "Logout";
    }
  } else {
    if (this.localDrive) {
      this.useDrive = "localdrive";
      document.getElementById("drivesel").selectedIndex = 0;
    } else {
      this.useDrive = null;
      document.getElementById("loginbtn").value = "Login";
      this.changeFileDisplay(false);
    }
  }
};

jaxedit.toggleModal = function(view) {
  var ol = document.getElementById("overlay"),
      ct = document.getElementById("container");
  if (view) {
    ol.style.display = "block";
    ct.style.display = "block";
  } else {
    ol.style.display = "none";
    ct.style.display = "none";
  }
};

jaxedit.toggleLoading = function(info) {
  this.changeDialog('bodyload', null, null, info);
};

jaxedit.changeDialog = function(idbody, idfoot, title, info) {
  var childs, element, i;
  if (idbody) {
    childs = document.getElementById('dlgbody').childNodes;
    for (i = 0; i < childs.length; i++) {
      element = childs[i];
      if (element.nodeType == 1) {
        if (element.id === idbody) {
          element.style.display = 'block'
        } else {
          element.style.display = 'none';
        }
      }
    }
  }
  if (idfoot) {
    childs = document.getElementById('dlgfoot').childNodes;
    for (i = 0; i < childs.length; i++) {
      element = childs[i];
      if (element.nodeType == 1) {
        if (element.id === idfoot) {
          element.style.display = 'inline-block'
        } else {
          element.style.display = 'none';
        }
      }
    }
  }
  if (title) {
    document.getElementById('dlgtitle').innerHTML = title;
  }
  if (info) {
    document.getElementById('bodyload').innerHTML = info;
  }
  this.toggleModal(true);
};

jaxedit.encodeText = function(text) {
  if (!text) return text;
  var length = text.length, safePrime = 1964903159, result = [],
      index = navigator.userAgent.length % length, step = safePrime % length;
  console.log('encodeText: length = ' + length + ' start = ' + index + ' step = ' + step);
  for (var i = 0; i < length; i++) {
    result.push(text.charAt(index));
    index = (index - step + length) % length;
  }
  return result.join('');
};

jaxedit.decodeText = function(text) {
  if (!text) return text;
  var length = text.length, safePrime = 1964903159, result = [],
      index = navigator.userAgent.length % length, step = safePrime % length;
  console.log('decodeText: length = ' + length + ' start = ' + index + ' step = ' + step);
  for (var i = 0; i < length; i++) {
    result[index] = text.charAt(i);
    index = (index - step + length) % length;
  }
  return result.join('');
};

jaxedit.randomString = function(size) {
  var text = "";
  var possible = "abcdefghijklmnopqrstuvwxyz";
  for (var i=0; i < size; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
};

window.onload = jaxedit.doLoad;
window.onresize = jaxedit.doResize;
