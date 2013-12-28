
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
    "div.frame": {
      "border": "1px solid #000000",
      "padding": "0.4em"
    },

    "div.frametitle": {
      "margin": "0.06em 0.06em 0.31em 0.06em"
    },

    "div.framesubtitle": {
      "margin": "-0.31em 0.06em 0.31em 0.06em"
    },

    "div.proof, div.theorem": {
      "border": "0",
      "margin": "0 1.5em",
      "padding-bottom": ".1em"
    },

    "div.proof > div, div.theorem > div": {
      "padding": "0 .5em"
    },

    "div.institute": {
      "text-align": "center",
      "margin": "0.8em 0"
    },

    "div.center": {
      "border": "1px dashed #C1C1C1"
    },

    "div.verbatim": {
      "border": "1px dashed #C1C1C1"
    },

    "div.thmname": {
      "font-weight": "bold",
      "height": "2em",
      "line-height": "2em"
    },

    "div.tableofcontents": {
      "border": "1px dashed #C1C1C1"
    },

    "ol, ul": {
      "margin-left": "1em"
    }
  };

  typejax.parser.extend("beamer/inner/default", definitions, extensions, styles);
})();
