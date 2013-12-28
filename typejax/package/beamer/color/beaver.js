
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
      "background": "#F2F2F2",
      "color": "#C00"
    },

    "div.framesubtitle": {
      "background": "#F2F2F2",
      "color": "#C00"
    },

    "div.thmname": {
      "color": "blue"
    },

    "h1": {
      "background": "#D8D8D8",
      "color": "#CD1A1A"
    }
  };

  typejax.parser.extend("beamer/color/beaver", definitions, extensions, styles);
})();
