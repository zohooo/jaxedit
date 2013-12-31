
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
    "div.part span.numbering:before, div.toc-part span.numbering:before": {
      "content": "'\\007B2C\\0000A0' counter(part, upper-roman) '\\0000A0\\0090E8\\005206\\0000A0\\0000A0'"
    },

    "div.chapter span.numbering:before, div.toc-chapter span.numbering:before": {
      "content": "'\\007B2C\\0000A0' counter(chapter) '\\0000A0\\007AE0\\0000A0\\0000A0'"
    },

    "div.section span.numbering:before, div.toc-section span.numbering:before": {
      "content": "'\\007B2C\\0000A0' counter(section) '\\0000A0\\008282\\0000A0\\0000A0'"
    }
  };

  typejax.parser.extend("ctex/ctex", definitions, extensions, styles);
})();
