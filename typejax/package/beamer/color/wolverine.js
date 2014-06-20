
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

    ".thmhead": {
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

  typejax.parser.extend("beamer/color/wolverine", definitions, renderers, styles);
})();
