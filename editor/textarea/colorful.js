
// copyright (c) 2012 JaxEdit project

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
