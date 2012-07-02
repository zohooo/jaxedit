
// copyright (c) 2011-2012 JaxEdit project

if (!window.console) console = {log : function() {}};

var jaxedit = {
  highlight: false,
  hasParser: false,
  autoScroll: false,
  canPresent: true,
  fileName: 'noname.tex',
  useDrive: null,
  localDrive: false,
  dialogMode: null
};

jaxedit.childs = {
  html : document.documentElement,
  body : document.body,
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
      head = childs.head,
      main = childs.main,
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

  var headHeight = 42, topHeight = 26, botHeight = 24, halfBorder = 4;
  var mainWidth = pageWidth, mainHeight = pageHeight - headHeight,
      halfWidth = Math.ceil(pageWidth / 2) - halfBorder, halfHeight = mainHeight - halfBorder,
      wrapWidth = halfWidth, wrapHeight = halfHeight - topHeight - botHeight;

  html.style.width = body.style.width = pageWidth + "px";
  head.style.width = pageWidth - 4 + "px";
  main.style.width = mainWidth + "px";
  main.style.height = mainHeight + "px";

  left.style.width = right.style.width = halfWidth + "px";
  left.style.height = right.style.height = halfHeight + "px";
  
  ltop.style.width = rtop.style.width = wrapWidth - 6 + "px";

  source.style.width = wrapWidth - 2 + "px";
  source.style.height = wrapHeight + "px";
  if (jaxedit.editor) {
    jaxedit.editor.getScrollerElement().style.height = wrapHeight - 20 + "px";
  } else {
    codearea.style.width = wrapWidth - 8 + "px";
    codearea.style.height = wrapHeight - 10 + "px";
  }
  
  preview.style.width = wrapWidth - 6 + "px";
  preview.style.height = wrapHeight - 8 + "px";
  showarea.style.width = wrapWidth - 6 + "px";
  showarea.style.height = wrapHeight - 10 + "px";

  lbot.style.width = rbot.style.width = wrapWidth - 6 + "px";
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
    var parent = range1.parentElement();
    if (parent != codearea) {
      console.log('TextRange: parent element is of tagName ' + parent.tagName);
      return;
    }
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
      helpbtn = document.getElementById("helpbtn"),
      loginbtn = document.getElementById("loginbtn"),
      drivesel = document.getElementById("drivesel");

  var doOpen = function(evt) {
    var file = evt.target.files[0],
        reader = new FileReader();
    reader.onload = function() {
      //console.log(this.readyState);
      codearea.value = this.result;
      jaxedit.initParser(this.result, this.result.length, showarea);
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
    bb.append(codearea.value);
    var blob = bb.getBlob("text/latex"); 
    var bloburl = URL.createObjectURL(blob);
    var name = jaxedit.fileName.split(/\.[^.]+$/)[0] + '.tex';
    if (corejax.browser.chrome >= 14) {
      var anchor = document.createElement("a");
      anchor.style.visibility = "hidden";
      anchor.href = bloburl;
      anchor.download = name;
      document.body.appendChild(anchor);
      var evt = document.createEvent('Event');
      evt.initEvent("click", true, true);
      anchor.dispatchEvent(evt);
      document.body.removeChild(anchor);
    } else if (corejax.browser.msie >= 10) {
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
    var dlghead = document.getElementById('dlghead'),
        dlgflist = document.getElementById('dlgflist'),
        savespan = document.getElementById('savespan'),
        savename = document.getElementById('savename'),
        dlgsave = document.getElementById('dlgsave');
    if (mode == "open") {
      jaxedit.dialogMode = "open";
      dlghead.innerHTML = "Open File";
      savespan.style.display = "none";
      dlgsave.style.display = "none";
    } else {
      jaxedit.dialogMode = "save";
      dlghead.innerHTML = "Save File";
      savespan.style.display = "inline";
      savename.value = jaxedit.fileName.split(/\.[^.]+$/)[0];
      dlgsave.style.display = "inline-block";
      dlgsave.onclick = checkSave;
    }
    dlgflist.onclick = dialogClick;
    jaxedit.toggleLoading(true, 'Loading...');
    jaxedit.toggleModal(true);
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
      jaxedit.toggleLoading(false);
    }
    else {
      jaxedit.toggleLoading(true, 'Error in reading LaTeX files!');
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
    var path = 'http://gate.jaxedit.com/?path=' + encodeURIComponent(jaxedit.encodeText(url));
    var request = createCORSRequest("get", path);
    jaxedit.toggleLoading(true, 'Opening file...');
    if (request) {
      request.onload = function(){
        var status = request.status;
        if ((status >= 200 && status <300) || status == 304) {
          codearea.value = request.responseText;
          document.getElementById('filename').innerHTML = jaxedit.fileName = name;
          jaxedit.initParser();
          jaxedit.toggleModal(false);
        } else {
          jaxedit.toggleLoading(true, status + ' error in opening file!');
        }
      };
      request.onerror = function(){
        jaxedit.toggleLoading(true, 'An error occurred!');
      };
    request.send();
    }
  };

  var saveFileContent = function(data, name) {
    var fid = skydrive.finside[skydrive.finside.length - 1].fid,
        hostpath = 'https://apis.live.net/v5.0/' + fid + '/files',
        querystr = '?access_token=' + encodeURIComponent(skydrive.access_token),
        gatepath = 'http://gate.jaxedit.com/';
    var url, path, boundary, content, request;
    jaxedit.toggleLoading(true, 'Saving file...');
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
          jaxedit.toggleLoading(true, status + ' error in saving file!');
        }
      };
      request.onerror = function(){
        jaxedit.toggleLoading(true, 'An error occurred!');
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
      saveFileContent(codearea.value, fname + '.txt');
    }
  };

  var dialogClick = function(event) {
    var dlgbody = document.getElementById('dlgbody'),
        loading = document.getElementById('loading');
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
          jaxedit.toggleLoading(true, 'Loading...');
          skydrive.finside.push({fid: fid, name: target.innerHTML});
          skydrive.getFilesList(handleResponse);
          break;
      }
    }
  };
  
  var dialogWalkup = function() {
    var dlgbody = document.getElementById('dlgbody'),
        loading = document.getElementById('loading');
    dlgbody.style.display = "none";
    loading.style.display = "block";
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
  var dlgclose = document.getElementById("dlgclose");
  dlgwalkup.onclick = dialogWalkup;
  dlgclose.onclick = function(){ jaxedit.toggleModal(false); };
  
  // chrome browser will prevent file reading and saving at local
  // unless --allow-file-access-from-files switch was added to it
  if ((browser.firefox && browser.firefox >= 6) ||
      (browser.chrome && browser.chrome >= 8 && location.protocol != "file:") ||
      (browser.msie && browser.msie >= 10)) {
    jaxedit.localDrive = true;
    jaxedit.useDrive = "localdrive";
    opensel.addEventListener("change", doOpen, false);
    addFileHandler();
    jaxedit.changeFileDisplay(true);
  } else {
    jaxedit.localDrive = false;
    opensel.style.display = "none";
  }

  if (location.protocol != "file:" && window.XMLHttpRequest && 'withCredentials' in new XMLHttpRequest()) {
    corejax.loadScript("http://js.live.net/v5.0/wl.js", function(){ // wl.debug.js
      corejax.loadScript("editor/webdrive/skydrive.js", function(){
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
                     '<script type="text/javascript" src="mathjax/MathJax.js?config=TeX-AMS_HTML"></scr' + 'ipt>',
                     '<script type="text/javascript" src="typejax/corejax.js"></scr' + 'ipt>',
                     '<script type="text/javascript" src="typejax/showjax.js"></scr' + 'ipt></head><body>',
                     '<div id="showarea">' + showarea.innerHTML + '</div>',
                     '</body></html>'].join('');
      if (corejax.browser.msie) {
        w = window.open("", "showjax", "fullscreen");
      } else {
        w = window.open("", "showjax");
      }
      doc = w.document;
      doc.write(content);
      doc.close();
    }
  }

  helpbtn.onclick = function() {
    window.open("https://github.com/zohooo/jaxedit/wiki", "_blank");
  };
  helpbtn.style.display = "inline-block";
  /*
  window.onbeforeunload = function() {
    if (jaxedit.useDrive == 'skydrive') {
      if (corejax.browser.chrome || confirm('Do you want to logout from SkyDrive?')) {
        skydrive.signUserOut();
      }
    }
  }
  */
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
    ol.style.visibility = "visible";
    ct.style.visibility = "visible";
  } else {
    ol.style.visibility = "hidden";
    ct.style.visibility = "hidden";
  }
};

jaxedit.toggleLoading = function(load, info) {
  var dlgbody = document.getElementById('dlgbody'),
      loading = document.getElementById('loading');
  if (load) {
    dlgbody.style.display = "none";
    loading.style.display = "block";
    loading.innerHTML = info;
  } else {
    dlgbody.style.display = "block";
    loading.style.display = "none";
  }
};

jaxedit.encodeText = function(text) {
  var length = text.length, safePrime = 1964903159, result = [],
      index = navigator.userAgent.length % length, step = safePrime % length;
  console.log('encodeText: length = ' + length + ' start = ' + index + ' step = ' + step);
  for (var i = 0; i < length; i++) {
    result.push(text.charAt(index));
    index = (index - step + length) % length;
  }
  return result.join('');
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
