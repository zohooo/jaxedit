
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
      "font-family": "Georgia, 'Times New Roman', Times, serif"
    }
  };

  typejax.parser.extend("beamer/font/serif", definitions, renderers, styles);
})();
