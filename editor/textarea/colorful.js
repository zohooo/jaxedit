
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
