
/* JaxEdit: online LaTeX editor with live preview
 * Copyright (c) 2011-2014 JaxEdit project
 * License: The MIT License
 *
 * Website: http://jaxedit.com
 * Source:  https://github.com/zohooo/jaxedit
 * Release: http://code.google.com/p/jaxedit/
 */

(function(){
  var definitions = {environment: {}, command: {}};
  var renderers = {};

  var styles = {
    "h1, div.frametitle, div.framesubtitle, .thmhead": {
      "font-weight": "bold"
    }
  };

  typejax.parser.extend("beamer/font/structurebold", definitions, renderers, styles);
})();
