
/* JaxEdit: online LaTeX editor with live preview
 * Copyright (c) 2011-2013 JaxEdit project
 * License: GNU General Public License, Version 3
 *
 * Website: http://jaxedit.com
 * Source:  https://github.com/zohooo/jaxedit
 * Release: http://code.google.com/p/jaxedit/
 */

if (!window.console) console = {log : function() {}};

(function(){
  function jsquick() {
    return new init(arguments[0]);
  }

  function init() {
    var elems, arg = arguments[0];
    if (typeof arg == "string") {
      switch (arg.charAt(0)) {
        case "#":
          elems = [document.getElementById(arg.slice(1))];
          break;
        case ".":
          elems = document.getElementsByClassName(arg.slice(1));
          break;
        default:
          elems = document.getElementsByTagName(arg);
      }
    } else if (arg instanceof Array) {
      elems = arg;
    } else if (arg.nodeType) {
      elems = [arg];
    }
    for (var i = 0; i < elems.length; i++) {
      this[i] = elems[i];
    }
    this.length = elems.length;
  };

  init.prototype = jsquick.prototype;

  jsquick.prototype.each = function(callback) {
    for (var i = 0; i < this.length; i++) {
      callback.call(this[i], i);
    }
  };

  jsquick.each = function(collection, callback) {
    var i, arr = [];
    if (Object.prototype.toString.call(collection) !== "[object Array]") {
      if (Object.getOwnPropertyNames) {
        arr = Object.getOwnPropertyNames(collection);
      } else {
        for (var key in collection) {
          if (collection.hasOwnProperty(key)) arr.push(key);
        }
      }
      for (i = 0; i < arr.length; i++) {
        callback(arr[i], collection[arr[i]]);
      }
    } else {
      for (i = 0; i < collection.length; i++) {
        callback(i, collection[i]);
      }
    }
  };

  jsquick.prototype.extend = jsquick.extend = function(obj) {
    var that = this;
    jsquick.each(obj, function(key, value) {
      that[key] = value;
    });
  };

  jsquick.extend({
    browser: (function() {
      var ua = navigator.userAgent;
      var msie, firefox, opera, safari, chrome, webkit;
      if (/MSIE ([^;]+)/.test(ua)) {
        msie = parseFloat(RegExp["$1"]);
      } else if (/Firefox\/(\S+)/.test(ua)) {
        firefox = parseFloat(RegExp["$1"]);
      } else if (/AppleWebKit\/(\S+)/.test(ua)) {
        webkit = parseFloat(RegExp["$1"]);
        if (/Chrome\/(\S+)/.test(ua)) {
          chrome = parseFloat(RegExp["$1"]);
        } else if (/Version\/(\S+)/.test(ua)) {
          safari = parseFloat(RegExp["$1"]);
        }
      } else if (window.opera) {
        opera = parseFloat(window.opera.version());
      }
      return {
        msie    : (msie)? msie: 0,
        firefox : (firefox)? firefox: 0,
        webkit  : (webkit)? webkit: 0,
        safari  : (safari)? safari: 0,
        chrome  : (chrome)? chrome: 0,
        opera   : (opera)? opera: 0
      };
    })(),

    touch: ("ontouchstart" in window),

    loadStyles: function(url, id) {
      if (id) {
        var link = document.getElementById(id);
        if (link) {
          link.href = url;
          return;
        }
      }
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.type = "text/css";
      if (id) link.id = id;
      link.href = url;
      var head = document.getElementsByTagName("head")[0];
      head.appendChild(link);
    },

    removeStyles: function(id) {
      var link = document.getElementById(id);
      var head = document.getElementsByTagName("head")[0];
      if (link) head.removeChild(link);
    },

    loadScript: function(url, callback) {
      var script = document.createElement("script");
      script.type = "text/javascript";
      script.src = url;
      if (script.readyState) {
        script.onreadystatechange = function() {
          if (script.readyState == "loaded" || script.readyState == "complete") {
            script.onreadystatechange = null;
            callback();
          }
        };
      } else {
        script.onload = function() { callback(); };
      }
      document.body.appendChild(script);
    },

    inArray: function(value, array) {
      if (Array.prototype.indexOf) {
        return array.indexOf(value);
      } else {
        for (var i = 0; i < array.length; i++) {
          if (array[i] === value) return i;
        }
        return -1;
      }
    },

    ajax: function(settings) {
      var xhr = (window.XMLHttpRequest) ?
                new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
          settings.success(xhr.responseText, xhr.status, xhr);
        }
      };
      xhr.open(settings.type, settings.url, true);
      if (settings.contentType) {
        xhr.setRequestHeader("Content-Type", settings.contentType);
      }
      xhr.send(settings.data);
    }
  });

  jsquick.prototype.extend({
    css: function(property, value) {
      if (arguments.length >= 2) {
        this.each(function() {
          this.style[property] = value;
        });
        return this;
      } else {
        var style = window.getComputedStyle ? window.getComputedStyle(this[0], null) : this[0].currentStyle;
        return style[property];
      }
    }
  });

  jsquick.fn = jsquick.prototype;
  window.jsquick = jsquick;
})();
