
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
  var extensions = {};

  var styles = {
    "div.frame, div.maketitle": {
      "color": "black",
      "background": "white"
    },

    "div.frametitle": {
      "color": "blue"
    },

    "div.framesubtitle": {
      "color": "blue"
    },

    "div.thmname": {
      "color": "blue"
    },

    "h1": {
      "color": "blue"
    },

    "span.pause": {
      "color": "blue"
    }
  };

  typejax.parser.extend("beamer/color/default", definitions, extensions, styles);
})();
