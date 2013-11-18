
// Inliner: Simple Library for Modern Browsers
// Release: Version 0.01 on 2013-11-17
// License: The MIT license
// Source: https://github.com/zohooo/inliner

if (!window.console) console = {log : function() {}};

(function(){
  function inliner() {
    return new init(arguments[0]);
  }

  function init() {
    var elems, arg = arguments[0];
    if (typeof arg == "string") {
      if (/^#[\w\-]+$/.test(arg)) {
        elems = [document.getElementById(arg.slice(1))];
      } else if (/^[\w]+$/.test(arg)){
        elems = document.getElementsByTagName(arg);
      } else if (document.getElementsByClassName && /^\.[\w\-]+$/.test(arg)) {
        elems = document.getElementsByClassName(arg.slice(1));
      } else if (document.querySelectorAll) {
        elems = document.querySelectorAll(arg);
      } else {
        elems = [];
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

  init.prototype = inliner.prototype;

  inliner.prototype.each = function(callback) {
    for (var i = 0; i < this.length; i++) {
      callback.call(this[i], i);
    }
  };

  inliner.each = function(collection, callback) {
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

  inliner.prototype.extend = inliner.extend = function(obj) {
    var that = this;
    inliner.each(obj, function(key, value) {
      that[key] = value;
    });
  };

  inliner.extend({
    agent: (function() {
      var ua = navigator.userAgent;
      var sniffs = [   [/Firefox\/(\S+)/, "firefox", "gecko"]
      /* IE 10- */    ,[/MSIE ([^;]+)/, "msie", "trident"]
      /* IE 11+ */    ,[/Trident\/[^;]+; rv:([^\)]+)/, "msie", "trident"]
      /* Opera 12- */ ,[/Opera.+ Version\/(\S+)/, "opera", "presto"]
      /* Opera 14+ */ ,[/OPR\/(\S+)/, "opera", "webkit"]
                      ,[/Chrome\/(\S+)/, "chrome", "webkit"]
                      ,[/Version\/(\S+) .*Safari/, "safari", "webkit"]
      ];
      for (var i = 0; i < sniffs.length; i++) {
        if (sniffs[i][0].test(ua)) {
          return {browser: sniffs[i][1], engine: sniffs[i][2], version: parseFloat(RegExp["$1"])};
        }
      }
      return { browser: "unknown", engine: "unknown", version: 0};
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

  inliner.prototype.extend({
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

  inliner.fn = inliner.prototype;
  window.inliner = inliner;
  if (!('$' in window)) window.$ = inliner;
})();
