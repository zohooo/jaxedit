
/* JaxEdit: online LaTeX editor with live preview
 * Copyright (c) 2011-2013 JaxEdit project
 * License: GNU General Public License, Version 3
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
      "font-family": "Georgia, 'Times New Roman', Times, serif",
      "font-style": "italic"
    }
  };

  typejax.parser.extend("beamer/font/structureitalicserif", definitions, renderers, styles);
})();
