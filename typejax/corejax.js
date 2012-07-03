
// copyright (c) 2012 JaxEdit project

var corejax = {}; 

corejax.browser = (function() {
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

corejax.platform = (function() {
  var pl = navigator.platform;
  if (pl.indexOf('Win') == 0) {
    return 'windows';
  } else if (pl.indexOf('Mac') == 0) {
    return 'macos';
  } else if (pl.indexOf('Linux') == 0 || pl.indexOf('X11') == 0) {
    return 'linux';
  } else {
    return 'unknown';
  }
})();

corejax.loadStyles = function(url) {
  var link = document.createElement("link");
  link.rel = "stylesheet";
  link.type = "text/css";
  link.href = url;
  var head = document.getElementsByTagName("head")[0];
  head.appendChild(link);
};

corejax.loadScript = function(url, callback) {
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
