
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
    "div.frame": {
      "font-family": "Arial, Helvetica, sans-serif"
    },

    "div.frametitle": {
      "font-size": "1.1em"
    },

    "div.framesubtitle": {
      "font-size": "1em"
    }
  };

  typejax.parser.extend("beamer/font/default", definitions, renderers, styles);
})();
