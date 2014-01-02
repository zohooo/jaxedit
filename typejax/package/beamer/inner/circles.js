
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
    "div.frame ol": {
      "list-style-type": "decimal"
    },

    "div.frame ul": {
      "list-style-type": "circle"
    }
  };

  typejax.parser.extend("beamer/inner/circles", definitions, renderers, styles);
})();
