
// copyright (c) 2012 JaxEdit project

jaxedit.cmChange = function(editor, change) {
  console.log(change.from, change.to, change.text, change.next);
  var data = this.textdata;
  data.oldtextvalue = data.newtextvalue;
  data.oldtextsize  = data.newtextsize;
  var textvalue = editor.getValue(),
      textsize = textvalue.length,
      instext = change.text.join('\n'),
      delstart = editor.indexFromPos(change.from),
      delend = delstart + data.oldtextsize + instext.length - textsize,
      deltext = data.oldtextvalue.substring(delstart, delend);
  console.log(delstart, delend, deltext, instext, textsize);
  data.newtextvalue = textvalue;
  data.newtextsize = textsize;
  typejax.updater.puttask(delstart, delend, deltext, instext, textsize, jaxedit.childs.showarea);
  if (change.next) {
    arguments.callee.call(this, editor, change.next);
  }
};

jaxedit.addCodeMirror = function() {
  jaxedit.editor = CodeMirror.fromTextArea(jaxedit.childs.codearea, {
    lineNumbers: true,
    lineWrapping: true,
    matchBrackets: true,
    onChange : function(editor, change) {jaxedit.cmChange(editor, change);}
  });
};
