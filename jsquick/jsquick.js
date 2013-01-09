
/* JaxEdit: online LaTeX editor with live preview
 * Copyright (c) 2011-2013 JaxEdit project
 * License: GNU General Public License, Version 3
 *
 * Website: http://jaxedit.com
 * Source:  https://github.com/zohooo/jaxedit
 * Release: http://code.google.com/p/jaxedit/
 */

var jsquick = $ = {};

jsquick.browser = (function() {
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
})();

(function() {
  var pl = navigator.platform;
  var system, computer;
  if (pl.indexOf('Win') == 0) {
    system = 'windows';
    computer = 'desktop';
  } else if (pl.indexOf('Mac') == 0) {
    system = 'macos';
    computer = 'desktop';
  } else if (pl.indexOf('Linux') == 0 || pl.indexOf('X11') == 0) {
    system = 'linux';
    computer = 'desktop';
  } else if (pl.indexOf('iPhone') == 0 || pl.indexOf('iPad') == 0) {
    system = 'ios';
    computer = 'mobile';
  } else if (pl.indexOf('android') == 0) {
    system = 'android';
    computer = 'mobile';
  } else {
    system = 'unknown';
    computer = 'unknown';
  }
  jsquick.system = system;
  jsquick.computer = computer;
})();

jsquick.loadStyles = function(url) {
  var link = document.createElement("link");
  link.rel = "stylesheet";
  link.type = "text/css";
  link.href = url;
  var head = document.getElementsByTagName("head")[0];
  head.appendChild(link);
};

jsquick.loadScript = function(url, callback) {
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
};

jsquick.ajax = function(settings) {
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
};
