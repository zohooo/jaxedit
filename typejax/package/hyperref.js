
/* JaxEdit: online LaTeX editor with live preview
 * Copyright (c) 2011-2013 JaxEdit project
 * License: GNU General Public License, Version 3
 *
 * Website: http://jaxedit.com
 * Source:  https://github.com/zohooo/jaxedit
 * Release: http://code.google.com/p/jaxedit/
 */

(function(){
  var definitions = {
    environment: {
    },
    command: {
      "href":              {mode: "inline", args: ["[]", "{}", "{}"]},
      "url":               {mode: "inline", args: ["{}"]}
    }
  };

  var extensions = {
    cmdHref: function(node) {
      // \href[options]{URL}{text}
      var argarray = node.argarray;
      var url = argarray[1].childs[0].value, text = argarray[2].childs[0].value;
      node.childs = [];
      node.value = "<a href='" + url + "'>" + text + "</a>";
    },

    cmdUrl: function(node) {
      // \url{URL}
      var argarray = node.argarray;
      var url = argarray[0].childs[0].value;
      node.childs = [];
      node.value = "<a href='" + url + "'>" + url + "</a>";
    }
  };

  typejax.parser.extend("hyperref", definitions, extensions);
})();
