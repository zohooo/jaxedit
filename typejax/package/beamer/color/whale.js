
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
    "div.frametitle": {
      "background": "#3333B2",
      "color": "white"
    },

    "div.framesubtitle": {
      "background": "#3333B2",
      "color": "white"
    },

    "h1": {
      "background": "#3333B2",
      "color": "white"
    }
  };

  typejax.parser.extend("beamer/color/whale", definitions, renderers, styles);
})();
