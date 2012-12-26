
// copyright (c) 2012 JaxEdit project

jaxedit.doChange = function(editor, change) {
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

  jaxedit.setScrollers(textsize, delstart, editor.getScrollInfo().top);
  typejax.updater.puttask(delstart, delend, deltext, instext, textsize, jaxedit.childs.showarea);
};

jaxedit.addEditor = function() {
  this.editor = CodeMirror.fromTextArea(this.childs.codearea, {
    lineNumbers: true,
    lineWrapping: true,
    matchBrackets: true
  });

  this.editor.setReadOnly = function(bool) {
    jaxedit.editor.readOnly = bool;
  };

  this.doResize();
};

jaxedit.addHandler = function() {
  var codearea = this.childs.codearea,
      showarea = this.childs.showarea;

  this.editor.on('change', function(editor, change) {jaxedit.doChange(editor, change);});

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
