
/* JaxEdit: online LaTeX editor with live preview
 * Copyright (c) 2011-2013 JaxEdit project
 * License: GNU General Public License, Version 3
 *
 * Website: http://jaxedit.com
 * Source:  https://github.com/zohooo/jaxedit
 * Release: http://code.google.com/p/jaxedit/
 */

(function(){
  var definitions = {
    environment: {
      "corollary":                "theorem",
      "corollary*":               "theorem",
      "definition":               "theorem",
      "definition*":              "theorem",
      "definitions":              "theorem",
      "definitions*":             "theorem",
      "example":                  "theorem",
      "example*":                 "theorem",
      "examples":                 "theorem",
      "examples*":                "theorem",
      "fact":                     "theorem",
      "fact*":                    "theorem",
      "frame":                    {mode: "main", args: ["<>", "[]", "[]", "{]", "{]", "||"], outs: ["par", "frame", "center", "theorem"]},
      "proof":                    "theorem",
      "theorem":                  {mode: "main", args: ["[]", "||"], outs: ["par", "theorem"]},
      "theorem*":                 "theorem"
    },
    command: {
      "framesubtitle":            {mode: "block", args: ["{}"]},
      "frametitle":               {mode: "block", args: ["{}"]},
      "institute":                {mode: "inline", args: ["{}"]},
      "titlepage":                {mode: "block", args: []},
      "transblindshorizontal":    "transdissolve",
      "transblindsvertical":      "transdissolve",
      "transboxin":               "transdissolve",
      "transboxout":              "transdissolve",
      "transdissolve":            {mode: "inline", args: ["<>", "[]"]},
      "transduration":            {mode: "inline", args: ["<>", "{}"]},
      "transglitter":             "transdissolve",
      "transsplithorizontalin":   "transdissolve",
      "transsplithorizontalout":  "transdissolve",
      "transsplitverticalin":     "transdissolve",
      "transsplitverticalout":    "transdissolve",
      "transwipe":                "transdissolve",
      "usecolortheme":            {mode: "inline", args: ["[]", "{}"]},
      "usefonttheme":             {mode: "inline", args: ["[]", "{}"]},
      "useinnertheme":            {mode: "inline", args: ["[]", "{}"]},
      "useoutertheme":            {mode: "inline", args: ["[]", "{}"]},
      "usetheme":                 {mode: "inline", args: ["[]", "{}"]}
    }
  };

  function useTheme(node, that, type) {
    var parameters = that.readParameters(node),
        pkgoptn = parameters[0] ? parameters[0].split(/ *, */) : [],
        pkgname = parameters[1], pkginfo,
        prefix = "beamer" + (type || "") + "theme";
    if (pkgname && (pkginfo = that.packages.info[prefix + pkgname])) {
      that.addPackage([pkginfo.file, prefix + pkgname].concat(pkgoptn));
    }
  }

  var extensions = {
    envFrame : function(node) {
      //  \begin{frame}<overlay specification>[<default overlay specification>][options]{title}{subtitle}
      //  environment contents
      //  \end{frame
      var argarray = node.argarray, subnode;
      if (argarray[0]) {
        argarray[0].childs[0].value = "";
      }
      if (argarray[1]) {
        argarray[1].childs[0].value = "";
      }
      if (argarray[2]) {
        argarray[2].childs[0].value = "";
      }
      if (argarray[3]) {
        argarray[3].name = "frametitle", argarray[3].mode = "block";
        if (argarray[4]) {
          argarray[4].name = "framesubtitle", argarray[4].mode = "block";
        }
      }
    },

    cmdInstitute: function(node) {
      this.renderers.find("cmd", "title").call(this, node);
    },

    cmdPause: function() {
      this.addText("<span class='pause'></span>", this.place - 1);
    },

    cmdTitlepage: function(node) {
      this.renderers.find("cmd", "maketitle").call(this, node);
    },

    cmdUsecolortheme: function(node) {
      useTheme(node, this, "color");
    },

    cmdUsefonttheme: function(node) {
      useTheme(node, this, "font");
    },

    cmdUseinnertheme: function(node) {
      useTheme(node, this, "inner");
    },

    cmdUseoutertheme: function(node) {
      useTheme(node, this, "outer");
    },

    cmdUsetheme: function(node) {
      useTheme(node, this);
    }
  };

  typejax.parser.extend("beamer/beamer", definitions, extensions);
})();
