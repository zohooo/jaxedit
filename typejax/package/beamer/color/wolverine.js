
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
      "background": "#FEE701",
      "color": "#00007A"
    },

    "div.framesubtitle": {
      "background": "#FEE701",
      "color": "#00007A"
    },

    "span.thmname": {
      "color": "blue"
    },

    "h1": {
      "background": "#FDE102",
      "color": "#00007A"
    },

    "span.pause": {
      "color": "blue"
    }
  };

  typejax.parser.extend("beamer/color/wolverine", definitions, extensions, styles);
})();
