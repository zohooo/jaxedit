
// copyright (c) 2012 JaxEdit project

jaxedit.cmChange = function(editor, change) {
  console.log(change.from, change.to, change.text, change.next);
  var data = this.textdata;
  data.oldtextvalue = data.newtextvalue;
  data.oldtextsize  = data.newtextsize;
  var textvalue = editor.getValue(),
      textsize = textvalue.length;
  var delstart, delend, deltext, instext, start;
  delstart = editor.indexFromPos(change.from);
  if (change.next) {
    do {
      change = change.next;
      start = editor.indexFromPos(change.from);
      if (start < delstart) delstart = start;
    } while (change.next);
    delend = data.oldtextsize;
    while (textvalue.charAt(delend-1) == data.oldtextvalue.charAt(delend-1) && delstart < delend){
      delend -= 1;
    }
    instext = textvalue.substring(delstart, delend + textsize - data.oldtextsize);
  } else {
    instext = change.text.join('\n');
    delend = delstart + data.oldtextsize + instext.length - textsize;
  }
  deltext = data.oldtextvalue.substring(delstart, delend);
  console.log(delstart, delend, deltext, instext, textsize);
  this.childs.lbot.innerHTML = "size: " + textsize + "; oldsize: " + data.oldtextsize + "; change: " + delstart + " to " + delend;
  data.newtextvalue = textvalue;
  data.newtextsize = textsize;

  if (window.localStorage) {
    //IE8 sometimes crashes when writing empty value to a localStorage item
    if (textvalue != "") {
      localStorage.setItem("texcode", textvalue);
    } else {
      localStorage.removeItem("texcode");
    }
  }

  typejax.updater.puttask(delstart, delend, deltext, instext, textsize, jaxedit.childs.showarea);
};

jaxedit.doScroll = function(isForward) {
  if (!jaxedit.autoScroll) return;
  var scrollers = this.scrollers, divheights = scrollers.divheights;
  if (!divheights.length) return;
  var codeedit = this.editor, showarea = this.childs.showarea,
      leftpos = codeedit.getScrollInfo().top, rightpos = showarea.scrollTop;
  var length, newpos, thatpos, thatarea;

  // leftpos <--> length <--> height <--> rightpos

  if (isForward) { // left to right
    length = this.getLeftScroll();
    newpos = this.setRightScroll(length);
    //console.log("left2right:", leftpos, Math.round(length), Math.round(newpos));
    thatpos = rightpos, thatarea = showarea;
  } else { // right to left
    length = this.getRightScroll();
    newpos = this.setLeftScroll(length);
    //console.log("right2left:", rightpos, Math.round(length), Math.round(newpos));
    thatpos = leftpos, thatarea = codeedit;
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

jaxedit.getLeftScroll = function() {
  var scrollers = this.scrollers,
      codescroll = scrollers.codescroll,
      codelength = scrollers.codelength,
      codechange = scrollers.codechange;
  var codeedit = this.editor,
      editinfo = codeedit.getScrollInfo(),
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

jaxedit.setLeftScroll = function(length) {
  var scrollers = this.scrollers,
      codescroll = scrollers.codescroll,
      codelength = scrollers.codelength,
      codechange = scrollers.codechange;
  var codeedit = this.editor,
      editinfo = codeedit.getScrollInfo(),
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

jaxedit.addCodeMirror = function() {
  this.editor = CodeMirror.fromTextArea(this.childs.codearea, {
    lineNumbers: true,
    lineWrapping: true,
    matchBrackets: true
  });
  this.doResize();
};

jaxedit.addHandler = function() {
  var codearea = this.childs.codearea,
      showarea = this.childs.showarea;

  this.editor.on('change', function(editor, change) {jaxedit.cmChange(editor, change);});

  this.editor.on('scroll', function(editor) {
    if (window.localStorage) {
      localStorage.setItem("scroll", editor.getScrollInfo().top);
    }
    jaxedit.doScroll(true);
  });

  showarea.onscroll = function() {
    jaxedit.doScroll(false);
  };
};

jaxedit.initEditor = function(value) {
  var childs = jaxedit.childs,
      codearea = childs.codearea,
      lbot = childs.lbot,
      showarea = childs.showarea;
  var data = jaxedit.textdata;

  if (typeof value == 'string') {
    value = value.replace(/\r\n?/g,'\n');
    this.editor.setValue(value);
    data.newtextvalue = value;
  } else {
    data.newtextvalue = this.editor.getValue();
  }
  data.newtextsize = data.newtextvalue.length;

  lbot.innerHTML = "size: " + data.newtextsize + "; textarea: initialized";
  this.scrollers.codelength = data.newtextsize;
  this.scrollers.codechange = 0;
  this.scrollers.codescroll = 0;
  this.scrollers.showscroll = 0;
  this.scrollers.showheight = 1;
  this.scrollers.divheights = [];

  this.editor.readOnly = true;
  typejax.updater.init(data.newtextvalue, data.newtextsize, showarea);
  this.addHandler();
  this.editor.readOnly = false;
};

jaxedit.getTextValue = function() {
  return this.editor.getValue();
};
