
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
    "div.frame div.theorem": {
      "border-radius": ".5em",
      "box-shadow": ".3em .3em .1em #aaa"
    },

    "div.frame .thmhead": {
      "border-radius": ".5em .5em 0 0"
    },

    "div.frame ol": {
      "list-style-type": "decimal"
    },

    "div.frame ul": {
      "list-style-type": "disc"
    }
  };

  typejax.parser.extend("beamer/inner/rounded", definitions, renderers, styles);
})();
