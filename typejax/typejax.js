
// copyright (c) 2011-2012 JaxEdit project

if (!window.console) console = {log : function() {}};

var typejax = {
  totaltext : "",
  totalsize : 0,
  totaldata : [],
  innerdata : [],
  totalsect : [],
  innersect : []
};

typejax.updater = {
  thequeue : [],
  isRunning : false,
  showarea : null,

  init : function(newtext, newsize, showarea) {
    this.thequeue = [];
    MathJax.Hub.Queue([typejax, function(){
      this.totaltext = "";
      this.totalsize = 0;
      this.totaldata = [];
      this.totalsect = [];
      showarea.innerHTML = "";
      this.updater.puttask(0, 0, "", newtext, newsize, showarea);
    }]);
  },
  
  puttask : function(delstart, delend, deltext, instext, newsize, showarea) {
    if (deltext == "" && instext == "") return;
    this.showarea = showarea;
    this.thequeue.push([delstart, delend, deltext, instext, newsize]);
    if (!this.isRunning) {
      this.isRunning = true;
      this.gettask();
    }
  },

  gettask : function() {
    var localtext = typejax.totaltext, localsize = typejax.totalsize;
    var task = [];
    var delstart, delend, deltext, instext, newsize;
    var localhead = localsize, localtail = localsize;
    var oldsize = localsize;
    var showarea = this.showarea;
    if (window.jaxedit) var rbot = jaxedit.childs.rbot;
    while (this.thequeue.length > 0) {
      task = this.thequeue.shift();
      delstart = task[0]; delend = task[1]; deltext = task[2]; instext = task[3]; newsize = task[4];
      if (deltext != localtext.substring(delstart,delend)) alert("text content is wrong!");
      localhead = (delstart < localhead) ? delstart : localhead;
      localtail = (localsize - delend < localtail) ? localsize - delend : localtail;
      localtext = localtext.substring(0,delstart) + instext + localtext.substring(delend,localsize);
      localsize = newsize;
      delstart = localhead;
      delend = oldsize - localtail;
      instext = localtext.substring(localhead, localsize - localtail);
      if (localsize != localtext.length) alert("text size is wrong!");
    }
    //console.log("delstart:", delstart, "delend:", delend, "inssize:", instext.length, "newsize:", newsize);
    typejax.totaltext = localtext; typejax.totalsize = localsize;

    var outdiv, output, data, divstart, divend, dividx, modstart, modend, pdata, i;
    if (typejax.totalsize == instext.length) {
      // generate all preview at first time
      // or clear all text content in textarea
      divstart = 0; // for scrollIntoView after mathjax typeset
      divend = typejax.totaldata.length; // for updateHeight function
      this.initSections(0);
      outdiv = typejax.parser(typejax.totaltext, 0, typejax.totalsize);
      console.log("innerdata:", typejax.innerdata);
      typejax.totaldata = typejax.innerdata;
      typejax.totalsect = typejax.innersect;

      output = "", data = "";
      while (outdiv.length > 0) {
        data = outdiv.shift();
        output += "<div class='envblock " + data[0] + "'>" + data[1] + "</div>";
      }
      showarea.innerHTML = output;
    } else {
      // determine which top lever dom elements to refresh
      divstart = -1, divend = -1, dividx = -1, modstart = 0, modend = 0, pdata = [];
      for (i = 0; i < typejax.totaldata.length; i++) {
        pdata = typejax.totaldata[i];
        dividx += 1;
        if (pdata[0] <= delstart && pdata[1] >= delstart && divstart < 0) {
          modstart = pdata[0];
          divstart = dividx;
        }
        if (pdata[0] <= delend && pdata[1] >= delend) {
          modend = pdata[1];
          divend = dividx+1;
        }
        if (pdata[0] > delend) break;
      }
      // handle the case when two paragraphs were merged as one
      if (divstart > 0) {
        var data1 = typejax.totaldata[divstart-1], data2 = typejax.totaldata[divstart],
            re = /^\n *\n/, str = typejax.totaltext.substring(data2[0], data2[1]);
        if (str.charAt(0) == "\n" && !re.test(str) && data1[2] == "par") {
          divstart = divstart - 1;
          modstart = data1[0];
        }
      }
      
      for (i = divstart; i < divend; i++) {
        typejax.totaldata[i][0] = -1;
        typejax.totaldata[i][1] = -1;
      }
      var modsize = instext.length - (delend - delstart);
      for (i = divend; i < typejax.totaldata.length; i++) {
        typejax.totaldata[i][0] += modsize;
        typejax.totaldata[i][1] += modsize;
      }
      //console.log("totaldata:", typejax.totaldata);
      console.log("div:",divstart,divend,"modify:",modstart,modend + modsize);
      //var modtext = typejax.totaltext.substring(modstart,modend + modsize);
      //console.log("modtext:", modtext);

      typejax.innerdata = [];
      this.initSections(divstart);
      outdiv = typejax.parser(typejax.totaltext, modstart, modend + modsize);
      console.log("innerdata:", typejax.innerdata);
      var n = 0;
      for (i = divstart; i < typejax.totaldata.length; i++) {
        if (typejax.totaldata[i][1] <= typejax.innerdata[typejax.innerdata.length-1][1]) n += 1;
      }
      typejax.totaldata.splice(divstart, n);
      divend = divstart + n;
      //console.log("totaldata:",typejax.totaldata);
      for (i = 0; i < typejax.innerdata.length; i++) { 
        typejax.totaldata.splice(divstart+i, 0, typejax.innerdata[i]);
      }
      //console.log("totaldata:",typejax.totaldata);
      
      // now delete old and insert new dom elements
      for (i=divstart; i<divend; i++ ) {
        showarea.removeChild(showarea.childNodes[divstart]);
      }
      var node;
      for (i=0; i<outdiv.length; i++) {
        node = document.createElement("div");
        node.className = "envblock " + outdiv[i][0];
        node.innerHTML = outdiv[i][1];
        showarea.insertBefore(node, showarea.childNodes[divstart+i] || null);
      } 
      this.updateSections(divstart, divend, typejax.innerdata.length);
    }
    //console.log("totalsect:", typejax.totalsect);
    this.updateTOC();
    //console.log(showarea.innerHTML);
    MathJax.Hub.Queue(["Process", MathJax.Hub, showarea]);
    MathJax.Hub.Queue(["afterTypeset", typejax.updater, divstart, divend, showarea]);
    if (rbot) rbot.innerHTML = "size: " + typejax.totalsize + "; change: " + delstart + " to " + delend;
  },

  incSectionCounters : function(counters, sectname) {
    var numstr;
    switch (sectname) {
      case "part":
        counters.part += 1;
        counters.section = counters.subsection = counters.subsubsection = 0;
        numstr = "Part " + counters.part + "&nbsp;&nbsp;";
        break;
      case "chapter":
        counters.chapter += 1;
        counters.section = counters.subsection = counters.subsubsection = 0;
        numstr = "Chapter " + counters.chapter + "&nbsp;&nbsp;";
        break;
      case "section":
        counters.section += 1;
        counters.subsection = counters.subsubsection = 0;
        numstr = counters.section + "&nbsp;";
        break;
      case "subsection":
        counters.subsection += 1;
        counters.subsubsection = 0;
        numstr = counters.section + "." + counters.subsection + "&nbsp;";
        break;
      case "subsubsection":
        counters.subsubsection += 1;
        numstr = counters.section + "." + counters.subsection + "." + counters.subsubsection + "&nbsp;";
        break;
    }
    return numstr;
  },

  initSections : function(divstart) {
    var counters = typejax.latex.counters;
    counters.part = counters.chapter = counters.section = counters.subsection = counters.subsubsection = 0;
    for (var i = 0; i < typejax.totalsect.length; i++) {
      if (typejax.totalsect[i][0] >= divstart) {
        break;
      } else {
        this.incSectionCounters(counters, typejax.totalsect[i][1])
      }
    }
  },
  
  updateSections : function(divstart, divend, datalength) {
    var sectdata, from = 0, to = 0, i = 0;
    for (i = 0; i < typejax.totalsect.length; i++) {
      sectdata = typejax.totalsect[i];
      if (sectdata[0] < divstart) {
        from += 1; to += 1;
      } else if (sectdata[0] >= divstart && sectdata[0] < divend) {
        to += 1;
      } else {
        break;
      }
    }
    for (i = to; i < typejax.totalsect.length; i++) {
      typejax.totalsect[i][0] += datalength - (divend - divstart);
    }
    typejax.totalsect.splice(from, to - from);
    for (i = 0; i < typejax.innersect.length; i++) {
      sectdata = typejax.innersect[i];
      typejax.totalsect.splice(from + i, 0, [sectdata[0] + divstart, sectdata[1], sectdata[2]]);
    }
    var counters = typejax.latex.counters, anchor;
    for (i = from + typejax.innersect.length; i < typejax.totalsect.length; i++) {
      var sectdiv = this.showarea.childNodes[typejax.totalsect[i][0]],
          numspan = sectdiv.getElementsByTagName("span")[0],
          sectname = sectdiv.className.split(" ").pop();
      numstr = this.incSectionCounters(counters, sectname);
      anchor = counters.part + "_" + counters.chapter + "_" + counters.section + "_" + counters.subsection + "_" + counters.subsubsection;
      if (numspan) numspan.innerHTML = "<a name='" + anchor + "'></a>" + numstr;
    }
  },
  
  updateTOC : function() {
    var counters = typejax.latex.counters;
    counters.part = counters.chapter = counters.section = counters.subsection = counters.subsubsection = 0;
    var sectdata, numstr, tocstr, tocdiv, anchor;
    tocstr = "<div class='contentname'><b>Contents</b></div>";
    for (i = 0; i < typejax.totalsect.length; i++) {
      sectdata = typejax.totalsect[i];
      sectname = sectdata[1];
      numstr = this.incSectionCounters(counters, sectname);
      anchor = counters.part + "_" + counters.chapter + "_" + counters.section + "_" + counters.subsection + "_" + counters.subsubsection;
      tocstr += "<div class='toc-" + sectname + "'><a href='#" + anchor + "'>" + numstr + sectdata[2] + "</a></div>";
    }
    tocdiv = document.getElementById("tableofcontents");
    if (tocdiv) tocdiv.innerHTML = tocstr;
  },

  afterTypeset : function(start, end, showarea) {
    if (window.jaxedit) {
      if (showarea.childNodes.length > start) { // sometimes showarea is empty
        jaxedit.autoScroll = false;
        showarea.childNodes[start].scrollIntoView(true);
        showarea.scrollTop -= 60;
        setTimeout(function(){jaxedit.autoScroll = true;}, 500); // after scroll event
      }
      // for scrollbar following
      jaxedit.scrollers.showscroll = showarea.scrollTop;
      this.updateHeight(start, end, showarea);
    }
    if (this.thequeue.length > 0) this.gettask();
    this.isRunning = false;
  },

  updateHeight : function(start, end, showarea) {
    var divheights = jaxedit.scrollers.divheights, showheight = jaxedit.scrollers.showheight;
    var innerdata = typejax.innerdata, totaldata = typejax.totaldata;
    var data, height, i;
    divheights.splice(start, end - start);
    for (i = 0; i < innerdata.length; i++) {
      data = innerdata[i];
      height = showarea.childNodes[start+i].scrollHeight;
      divheights.splice(start+i, 0, [data[0], data[1], height]);
    }
    for (i = start + innerdata.length; i < totaldata.length; i++) {
      data = totaldata[i];
      divheights[i][0] = data[0];
      divheights[i][1] = data[1];
    }
    showheight = 0;
    for (i = 0; i < divheights.length; i++) {
      showheight += divheights[i][2];
    }
    jaxedit.scrollers.showheight = (showheight > 0) ? showheight : 1;
    //console.log("divheights:", showheight, divheights);
  }
};

typejax.parser = function(input, modstart, modend){
  
  var lexer = {
    snippet : "", // content of the source input
    length : 0,   // length of the source input
    index : 0,    // current position in the input
    modend : 0,   // current modend in the input
    ended : false,
    
    initialize : function(input) {
      this.snippet = input;
      this.length = input.length;
      this.index = modstart;
      this.modend = modend;
      this.ended = false;
    },

    atLast : function() {
      return (this.index >= this.length || this.ended == true) ? true : false;
    },

    atEnding : function() {
      return (this.index >= this.modend) ? true : false;
    },
    
    newEnding : function() {
      for (var i = 0; i < typejax.totaldata.length; i++) {
        if (typejax.totaldata[i][0] == this.modend) {
          this.modend = typejax.totaldata[i][1];
          console.log("newEnding:",this.modend);
          break;
        }
      }
    },
    
    nextToken : function() { // find next token
      //console.log(length,index);
      var type = "", value = "", place = this.index;
      if (this.atLast()) return { type: "", value: "", place: this.length};
      if (this.atEnding()) {
        var d = syner.nodearray;
        if (d.length > 0 && d[0].from < this.modend && d[0].name != "par") {
          this.newEnding();
        } else {
          this.ended = true;
          return { type: "", value: "", place: this.modend};
        }
      }
      
      var curchar = this.snippet.charAt(this.index);
      var nextchar = "", nextcode = 0, i = 0;
      
      if ( curchar == "\\") {
        type = "escape";
        value = "\\";
      } else if (curchar == "%") {
        type = "comment";
        value = "%";
      } else if (curchar == " ") {
        type = "space";
        value = " ";
      } else if (curchar == "\n") {
        type = "space";
        value = "\n";
      } else if (curchar == "\r") {
        nextchar = this.snippet.charAt(this.index+1);
        if (nextchar == "\n") { // \r\n in ie
          type = "space";
          value = "\n";
          this.index += 1;
        } else {
          type = "space";
          value = "\n";
        }
      } else if (/[\!-\$&-\/\:-@\[-`\{-~]/.test(curchar)) {
        type = "special";
        value = curchar;
      } else if (/[a-zA-Z]/.test(curchar)) {
        i = this.index;
        do {
          i += 1; 
          nextchar = this.snippet.charAt(i);
        } while (/[a-zA-Z]/.test(nextchar));
        type = "alphabet";
        value = this.snippet.substring(this.index,i);
        this.index = i - 1;
      } else if (/[0-9]/.test(curchar)) {
        i = this.index;
        do {
          i += 1; 
          nextchar = this.snippet.charAt(i);
        } while (/[0-9]/.test(nextchar));
        type = "number";
        value = this.snippet.substring(this.index,i);
        this.index = i - 1;
      } else {
        i = this.index;
        do {
          i += 1; 
          nextcode = this.snippet.charCodeAt(i);
        } while (nextcode > 127);
        type = "unicode";
        value = this.snippet.substring(this.index,i);
        this.index = i - 1;
      }
      
      this.index += 1;
      //console.log(type, value);
      return {type: type, value: value, place: place};
    },
    
    goBack : function(i) {
      this.index -= i;
    }
  };

  var syner = {
    innertree : {},
    type : "",
    value : "",
    place : -1,
    mathenv : "",
    intabular : false,
    omitspace : false,
    
    analysis : function(input) {
      //console.log("initialize lexer");
      lexer.initialize(input);

      this.initTree();
      this.mathenv = "";
      this.omitspace = false;
      typejax.innerdata = [];
      typejax.innersect = [];

      var latex = typejax.latex;
      this.cmdargs = latex.cmdargs;
      this.envargs = latex.envargs;
      this.grpsame = latex.grpsame;
      this.grpmode = latex.grpmode;
      this.grpsout = latex.grpsout;
      this.cmdvalues = latex.cmdvalues;
      this.counters = latex.counters;
      this.thmnames = latex.thmnames;
      
      this.openNewGroup("env", "par", modstart);
      
      while ( !lexer.atLast() ) {
        var token = lexer.nextToken();
        //alert(this.token.type, token.value);
        this.type = token.type;
        this.value = token.value;
        this.place = token.place;
        this.mainLoop();
      }
      
      this.closeOldMath(lexer.modend);
      while (this.nodelevel > 0) {
        this.closeOldGroup(lexer.modend);
      }
    },
    
    mainLoop : function() {
      switch (this.type) {
        case "escape":
          this.tokenEscape();
          break;
        case "comment":
          this.tokenComment();
          break;
        case "space":
          this.tokenSpace();
          break;
        case "special":
          this.tokenSpecial();
          break;
        case "alphabet":
          this.tokenAlphabet();
          break;
        case "number":
          this.tokenNumber();
          break;
        case "unicode":
          this.tokenUnicode();
          break;
      }      
    },
    
    tokenEscape : function() {
      this.closeEmptyArg(this.place);
      this.omitspace = false;
      var token = lexer.nextToken();
      this.type = token.type;
      this.value = token.value;
      this.place = token.place;
      if (this.type == "") {
        this.addText("\\", this.place - 1);
        return;
      }
      switch (this.type) {
        case "escape":
          if (this.mathenv != "") {
              this.addText("\\\\", this.place - 1);
          } else if (this.intabular) {
            this.addText("</td></tr><tr><td>", this.place - 1);
          } else {
            this.addText("<br>", this.place - 1);
          }
          break;
        case "comment":
          this.addText("%", this.place - 1);
          break;
        case "space":
          this.addText(" ", this.place - 1);
          break;
        case "special":
          switch (this.value) {
            case "#":
            case "&":
            case "$":
            case "_":
            case "{":
            case "}":
              if (this.mathenv != "") {
                this.addText("\\" + this.value, this.place - 1);
              } else {
                this.addText(this.value, this.place - 1);
              }
              break;
            case ";":
              if (this.mathenv != "") {
                this.addText("\\" + this.value, this.place - 1);
              } else {
                this.addText("<span class='thickspace'></span>", this.place - 1);
              }
              break;
            case ":":
              if (this.mathenv != "") {
                this.addText("\\" + this.value, this.place - 1);
              } else {
                this.addText("<span class='medspace'></span>", this.place - 1);
              }
              break;
            case ",":
              if (this.mathenv != "") {
                this.addText("\\" + this.value, this.place - 1);
              } else {
                this.addText("<span class='thinspace'></span>", this.place - 1);
              }
              break;
            case "!":
              if (this.mathenv != "") {
                this.addText("\\" + this.value, this.place - 1);
              } else {
                this.addText("<span class='negthinspace'></span>", this.place - 1);
              }
              break;
            case "(":
              if (this.mathenv != "") {
                this.closeOldGroup(this.place - 1);
              }
              this.openNewGroup("env", "imath", this.place - 1);
              this.mathenv = "()";
              break;
            case ")":
              if (this.mathenv == "()") {
                this.closeOldGroup(this.place + 1);
              } else if (this.mathenv != "") {
                this.closeOldGroup(this.place + 1);
                this.addText("\\)", this.place - 1);
              } else {
                this.addText("\\)", this.place - 1);
              }
              this.mathenv = "";
              break;
            case "[":
              if (this.mathenv != "") {
                this.closeOldGroup(this.place - 1);
              }
              this.openNewGroup("env", "bmath", this.place - 1);
              this.mathenv = "[]";
              break;
            case "]":
              if (this.mathenv == "[]") {
                this.closeOldGroup("env", "bmath", this.place + 1);
              } else if (this.mathenv != "") {
                this.closeOldGroup("env", "bmath", this.place + 1);
                this.addText("\\]", this.place - 1);
              } else {
                this.addText("\\]", this.place - 1);
              }
              this.mathenv = "";
              break;
            default:
              this.addText("\\" + this.value, this.place - 1);
            }
          break;
        case "alphabet":
          var csname = this.value;
          token = lexer.nextToken();
          if (token.value == "*") {
            csname += "*";
          } else {
            lexer.goBack(token.value.length);
          }
          if (this.mathenv == "") {
            this.omitspace = true;
          }
          switch (csname) {
            case "begin":
            case "end":
              this.cmdsSimple(csname, this.place - 1);
              break;
            case "documentclass":
              this.closeOldMath(this.place - 1);
              this.closeOldCmds(this.place - 1);
              this.beginGroup("env", "preamble", this.place - 1, this.place + "documentclass".length);
              break;
            case "hline":
              break;
            case "item":
              this.beginGroup("env", "item", this.place - 1, this.place + 4);
              break;
            case "maketitle":
            case "titlepage":
              this.closeOldMath(this.place - 1);
              this.closeOldCmds(this.place - 1);
              this.beginGroup("cmd", csname, this.place - 1, this.place - 1);
              this.endGroup("cmd", csname, this.place + csname.length, this.place + csname.length);
              break;
            case "newline":
              this.addText("<br>", this.place - 1);
              break;
            case "qquad":
              if (this.mathenv != "") {
                this.addText("\\" + this.value, this.place - 1);
              } else {
                this.addText("<span class='qquad'></span>", this.place - 1);
              }
              break;
            case "quad":
              if (this.mathenv != "") {
                this.addText("\\" + this.value, this.place - 1);
              } else {
                this.addText("<span class='quad'></span>", this.place -1);
              }
              break;
            case "textbackslash":
              this.addText("\\", this.place - 1);
              break;
            case "textbar":
              this.addText("|", this.place -1);
              break;
            case "textgreater":
              this.addText("&gt;", this.place - 1);
              break;
            case "textless":
              this.addText("&lt;", this.place - 1);
              break;
            case "par":
              this.closeOldMath(this.place - 1);
              this.beginGroup("env", "par", this.place - 1, this.place + 3);
              break;
            case "paragraph":
            case "paragraph*":
            case "subparagraph":
            case "subparagraph*":
              this.closeOldMath(this.place - 1);
              this.beginGroup("env", "par", this.place - 1, this.place -1);
              this.beginGroup("cmd", csname, this.place - 1, this.place + csname.length);
              break;
            case "pause":
              //this.addText("<span class='pause'>|</span>");
              break;
            default:
              var argtype = this.getArgsType("cmd", csname);
              if (argtype.length > 0) {
                this.closeOldMath(this.place - 1);
                if (csname == "tableofcontents") this.closeOldCmds(this.place-1);
                this.beginGroup("cmd", csname, this.place - 1, this.place + csname.length);
              } else { //inside text or math
                this.addText("\\" + csname, this.place - 1);
              }
          }
          break;                 
        default:
          this.addText("\\" + csname, this.place - 1);
      }
    },
    
    tokenComment : function() {
      this.omitspace = false;
      var token = lexer.nextToken();
      this.type = token.type;
      this.value = token.value;
      this.place = token.place;
      while ( this.value != "" && this.value != "\n" ) {
        token = lexer.nextToken();
        this.type = token.type;
        this.value = token.value;
        this.place = token.place;
      }
    },

    tokenSpace : function() {
      if (this.omitspace) return;
      switch (this.value) {
        case " ":
          this.addText(this.value, this.place);
          break;
        case "\n":
          var p = this.place, token;
          do {
            token = lexer.nextToken();
            this.type = token.type;
            this.value = token.value;
          } while (this.value == " ")
          if (this.type == "space" && this.value == "\n") {
            this.closeOldMath(p);
            this.beginGroup("env", "par", p, this.place);
            this.omitspace = true;
          } else {
            this.addText(" ", this.place);
            lexer.goBack(this.value.length);
          }
          break;
      }
    },

    tokenSpecial : function() {
      this.omitspace = false;
      switch (this.value) {
        case "{":
        case "}":
        case "[":
        case "]":
        case "<":
        case ">":
          if (this.mathenv != "") {
            this.addText(this.value, this.place);
            break;
          }
          this.addBracket(this.value, this.place);
          break;
        case "$":
          this.getMathDollar(this.place);
          break;
        case "&":
          if (this.mathenv != "") {
            this.addText(this.value, this.place);
          } else if (this.intabular) {
            this.addText("</td><td>", this.place);
          } else {
            this.addText(this.value, this.place);
          }
          break;
        case "`":
          if (this.mathenv != "") {
            this.addText(this.value, this.place);
          } else {
            var token = lexer.nextToken();
            if (token.value == "`") {
              this.addText("&ldquo;", this.place);
            } else {
              this.addText("&lsquo;", this.place);
              lexer.goBack(token.value.length);
            }
          }
          break;
        case "'":
          if (this.mathenv != "") {
            this.addText(this.value, this.place);
          } else {
            var token = lexer.nextToken();
            if (token.value == "'") {
              this.addText("&rdquo;", this.place);
            } else {
              this.addText("&rsquo;", this.place);
              lexer.goBack(token.value.length);
            }
          }
          break;
        default:
          this.addText(this.value, this.place);
      }
    },
    
    tokenAlphabet : function() {
      this.omitspace = false;
      this.addText(this.value, this.place);
    },

    tokenNumber : function() {
      this.omitspace = false;
      this.addText(this.value, this.place);
    },

    tokenUnicode : function() {
      this.omitspace = false;
      this.addText(this.value, this.place);
    },
 
    doCommand : function(node) {
      var csname = node.name, from = node.from, to= node.to, argarray = node.argarray;
      switch (csname) {
        case "title":
        case "author":
        case "institute":
        case "date":
          this.cmdsTitle(node);
          break;
        case "maketitle":
        case "titlepage":
          this.cmdsMaketitle(node);
          break;
        case "tableofcontents":
          this.cmdTableofcontents(node);
          break;
        case "part":
        case "part*":
        case "chapter":
        case "chapter*":
        case "section":
        case "section*":
        case "subsection":
        case "subsection*":
        case "subsubsection":
        case "subsubsection*":
          this.cmdsHeading(node);
          break;
        case "paragraph":
        case "paragraph*":
        case "subparagraph":
        case "subparagraph*":
          this.cmdsParagraph(node);
          break;
        case "newtheorem":
        case "newtheorem*":
          this.cmdNewtheorem(node);
          break;
        case "textbf":
          this.cmdTextbf(node);
          break;
        default:
          //this.cmdsIgnore();
      }
    },

    cmdsSimple : function(csname, where) { // with single parameter
      var token = lexer.nextToken();
      this.type = token.type;
      this.value = token.value;
      this.place = token.place;
      if (this.type == "special" && this.value == "{") {
        token = lexer.nextToken();
        this.type = token.type;
        this.value = token.value;
        this.place = token.place;        
        if (this.type == "alphabet") {
          var envname = token.value;
          token = lexer.nextToken();
          this.type = token.type;
          this.value = token.value;
          this.place = token.place;
          if (this.type == "special" && this.value == "}") {
            this.cmdsBeginEnd(csname, envname, where);
          } else if (this.type == "special" && this.value == "*") {
            envname += "*";
            token = lexer.nextToken();
            this.type = token.type;
            this.value = token.value;
            this.place = token.place;
            if (this.type == "special" && this.value == "}") {
              this.cmdsBeginEnd(csname, envname, where);              
            } else {
              this.addText("\\" + csname + "{" + envname, where);
              lexer.goBack(this.value.length);
            }              
          } else {
            this.addText("\\" + csname + "{" + envname, where);
            lexer.goBack(this.value.length);
          }
        } else {
          this.addText("\\" + csname + "{", where);
          lexer.goBack(this.value.length);
        }
      } else {
        this.addText("\\" + csname, where);
        lexer.goBack(this.value.length);
      }
    },
    
    cmdsHeading : function(node) {
      var csname = node.name, argarray = node.argarray;
      var counters = this.counters, headstr, numstr = "", sectintoc;
      var value1 = typejax.builder(argarray[1], false),
          value0 = argarray[0] ? typejax.builder(argarray[0], false) : "";
      switch (csname) {
        case "part":
          counters.part += 1;
          counters.section = counters.subsection = counters.subsubsection = 0;
          numstr = "Part " + counters.part + "&nbsp;&nbsp;";
          headstr = "h2";
          break;
        case "part*":
          headstr = "h2";
          break;
        case "chapter":
          counters.chapter += 1;
          counters.section = counters.subsection = counters.subsubsection = 0;
          numstr = "Chapter " + counters.chapter + "&nbsp;&nbsp;";
          headstr = "h3";
          break;
        case "chapter*":
          headstr = "h3";
          break;
        case "section":
          counters.section += 1;
          counters.subsection = counters.subsubsection = 0;
          numstr = counters.section + "&nbsp;";
          headstr = "h4";
          break;
        case "section*":
          headstr = "h4";
          break;
        case "subsection":
          counters.subsection += 1;
          counters.subsubsection = 0;
          numstr = counters.section + "." + counters.subsection + "&nbsp;";
          headstr = "h5";
          break;
        case "subsection*":
          headstr = "h5";
          break;
        case "subsubsection":
          counters.subsubsection += 1;
          numstr = counters.section + "." + counters.subsection + "." + counters.subsubsection + "&nbsp;";
          headstr = "h6";
          break;
        case "subsubsection*":
          headstr = "h6";
          break;
      }
      var anchor = counters.part + "_" + counters.chapter + "_" + counters.section + "_" + counters.subsection + "_" + counters.subsubsection;
      if (numstr) {
        sectintoc = value0 ? value0 : value1;
        typejax.innersect.push([typejax.innerdata.length, csname, sectintoc]);
        var s = "<" + headstr + "><span><a name='" + anchor + "'></a>" + numstr + "</span>" + value1 + "</" + headstr + ">";
      } else {
        var s = "<" + headstr + ">" + value1 + "</" + headstr + ">";
      }
      node.childs = [];
      node.value = s;
    },

    //cmdsIgnore : function() {},

    cmdsMaketitle : function(node) {
      if (typeof this.cmdvalues["title"] == "undefined") return;
      var result = "<h1>" + this.cmdvalues["title"] + "</h1>";
      
      if (typeof this.cmdvalues["author"] == "undefined") {
        this.cmdvalues["author"] = "";
      }
      result += "<div class='author'>" + this.cmdvalues["author"] + "</div>";
      if (typeof this.cmdvalues["institute"] != "undefined") {
        result += "<div class='institute'>" + this.cmdvalues["institute"] + "</div>";
      }
      if (typeof this.cmdvalues["date"] == "undefined") {
        result += "<div class='date'>" + (new Date()).toLocaleDateString() + "</div>";
      } else {
        result += "<div class='date'>" + this.cmdvalues["date"] + "</div>";
      }
      
      if (node.name == "maketitle" && this.cmdvalues["documentclass"] == "beamer") {
        result = "<div class='envblock frame'>" + result + "</div>";
      }
      
      node.childs = [];
      node.value = result;
    },
    
    cmdNewtheorem : function(node) {
      // \newtheorem{envname}{thmname}[numberby]
      // \newtheorem{envname}[counter]{thmname}
      // \newtheorem*{envname}{thmname}
      var csname = node.name, argarray = node.argarray;
      var envname = argarray[0].childs[0].value;
      if (csname == "newtheorem") {
        this.thmnames[envname] = argarray[2].childs[0].value; 
      } else {
        this.thmnames[envname] = argarray[1].childs[0].value;
      }
      this.grpsame[envname] = "theorem";
    },

    cmdsParagraph : function(node) {
      var csname = node.name, argarray = node.argarray;
      switch (csname) {
        case "paragraph":
        case "paragraph*":
          node.value = "<b>" + node.value + "</b>&nbsp;&nbsp;";
          break;
        case "subparagraph":
        case "subparagraph*":
          node.value = "&nbsp;&nbsp;&nbsp;<b>" + node.value + "</b>&nbsp;&nbsp;";
          break;
      }
    },

    cmdTableofcontents : function(node) {
      node.childs = [];
      node.value = "<div id='tableofcontents'></div>";
    },

    cmdTextbf : function(node) {
      node.value = "<b>" + node.argarray[0].childs[0].value + "</b>";
      node.childs = [];
    },

    cmdsTitle : function(node) {
      var csname = node.name, argarray = node.argarray;
      var argnode, child, i, value = "";
      switch (csname) {
        case "title":
        case "author":
          argnode = argarray[1];
          break;
        default:
          argnode = argarray[0];
      }
      for (i = 0; i < argnode.childs.length; i++) {
        child = argnode.childs[i];
        if (child.name == "imath") {
          value += typejax.builder(child, true);
        } else {
          value += child.value;
        }
      }
      this.cmdvalues[csname] = value;
      node.childs = [];
    },
    
    cmdsBeginEnd : function(csname, envname, where) {
      var mathmode = "bmath", mathdelim = true;
      switch (envname) {
        // toplevel math environments
        case "math":
          mathmode = "imath"; // don't break!
        case "displaymath":
          mathdelim = false;  // don't break!
        case "equation":
        case "equation*":
        case "eqnarray":
        case "eqnarray*":
        case "gather":
        case "gather*":
        case "align":
        case "align*":
        case "alignat":
        case "alignat*":
        case "multline":
        case "multline*":
          if (csname == "begin") {
            if (this.mathenv != "") {
              this.closeOldGroup(where);
            }
            this.beginGroup("env", mathmode, where, where + 8 + envname.length);
            if (mathdelim) {
              this.addText("\\begin{" + envname + "}", where + 8 + envname.length);
            }
            this.mathenv = envname;
          } else {
            if (this.mathenv != "") {
              if (mathdelim) {
                this.addText("\\end{" + envname + "}", where);
              }
              this.endGroup("env", mathmode, where, where + 6 + envname.length);
            } else {
              this.addText("\\end{" + envname + "}", where);
            }
            this.mathenv = "";
          }
          break;
        // environments inside math
        case "gathered":
        case "aligned":
        case "alignedat":
        case "split":
        case "array":
        case "smallmatrix":
        case "subarray":
        case "cases":
        case "matrix":
        case "pmatrix":
        case "bmatrix":
        case "Bmatrix":
        case "vmatrix":
        case "Vmatrix":
          if (csname == "begin") {
            if (this.mathenv == "") {
              this.beginGroup("env", mathmode, where, where + 8 + envname.length);
              this.addText("\\begin{" + envname + "}", where);
              this.mathenv = envname;
            } else {
              this.addText("\\begin{" + envname + "}", where);
            }
          } else {
            if (this.mathenv == envname) {
              this.addText("\\end{" + envname + "}", where);
              this.endGroup("env", mathmode, where, where + 6 + envname.length);
              this.mathenv = "";
            } else {
              this.addText("\\end{" + envname + "}", where);
            }
          }
          break;
        // text environments
        case "definition":
        case "definition*":
        case "definitions":
        case "definitions*":
        case "example":
        case "example*":
        case "examples":
        case "examples*":
        case "fact":
        case "fact*":
        case "lemma":
        case "lemma*":
        case "theorem":
        case "theorem*":
        case "proposition":
        case "proposition*": 
        case "corollary":
        case "corollary*":
        case "proof":
        case "exercise":
        case "remark":
        case "solution":
          this.closeOldMath(where);
          if (csname == "begin") {
            this.beginGroup("env", envname, where, where + 8 + envname.length);
          } else {
            this.endGroup("env", envname, where, where + 6 + envname.length);
          }
          break;
        case "center":
          this.closeOldMath(where);
          if (csname == "begin") {
            this.beginGroup("env", envname, where, where + 8 + envname.length);
          } else {
            this.endGroup("env", envname, where, where + 6 + envname.length);
          }
          break;
        case "CJK":
        case "CJK*":
          this.addText("\\" + csname + "{" + envname + "}");
          break;
        case "document":
          this.closeOldCmds(where);
          if (csname == "begin") {
            this.endGroup("env", "preamble", where, where + 8 + "document".length);
          } else {
            this.beginGroup("env", "par", where);
          }
          break;
        case "enumerate":
        case "itemize":
          this.closeOldMath(where);
          if (csname == "begin") {
            this.beginGroup("env", envname, where, where + 8 + envname.length);
          } else {
            this.endGroup("env", envname, where, where + 6 + envname.length);
          }       
          break;
        case "frame":
          this.closeOldMath(where);
          if (csname == "begin") {
            this.beginGroup("env", envname, where, where + 8 + envname.length);
          } else {
            this.endGroup("env", envname, where, where + 6 + envname.length);
          }
          break;
        case "tabular":
          this.closeOldMath(where);
          if (csname == "begin") {
            this.beginGroup("env", envname, where, where + 8 + envname.length);
            this.intabular = true;
          } else {
            this.endGroup("env", envname, where, where + 6 + envname.length);
          }
          break;
        case "verbatim":
          this.closeOldMath(where);
          if (csname == "begin") {
            this.beginGroup("env", envname, where, where + 8 + envname.length);
            this.getVerbatim(envname);
            this.endGroup("env", envname, this.place - 5 - envname.length, this.place + 1);          
          } else {
            this.addText("\\" + csname + "{" + envname + "}", where);
          }
          break;
        // unknown environment, could be a math or text environment
        default:
          var thmname = this.thmnames[envname];
          if (thmname) {
            this.closeOldMath(where);
            if (csname == "begin") {
              this.beginGroup("env", envname, where, where + 8 + envname.length);
            } else {
              this.endGroup("env", envname, where, where + 6 + envname.length);
            }
          } else {
            this.addText("\\" + csname + "{" + envname + "}", where);
          }
      }
    },
    
    doEnvironment : function(node) {
      var envname = node.name, from = node.from, to = node.to, argarray = node.argarray;
      switch (envname) {
        case "definition":
        case "definition*":
        case "definitions":
        case "definitions*":
        case "example":
        case "example*":
        case "examples":
        case "examples*":
        case "fact":
        case "fact*":
        case "lemma":
        case "lemma*":
        case "theorem":
        case "theorem*":
        case "proposition":
        case "proposition*": 
        case "corollary":
        case "corollary*":
        case "proof":
        case "exercise":
        case "remark":
        case "solution":
          this.envsTheorem(node);
          break;
        case "enumerate":
        case "itemize":
          this.envsList(node);
          break;
        case "frame":
          this.envFrame(node);
          break;
        case "preamble":
          this.envPreamble(node);
          break;
        case "tabular":
          this.envTabular(node);
          break;
        default:
          if (this.thmnames[envname]) {
            this.envsTheorem(node);
          }
      }
    },

    getMathDollar : function(position) {
      if (this.mathenv == "$") {
        this.closeOldGroup(position + 1);
        this.mathenv = "";
        return;
      }
      if (this.mathenv == "$$") {
        var token = lexer.nextToken();
        if (token.value == "$") {
          this.closeOldGroup("env", "bmath", position + 2);
        } else {
          this.closeOldGroup("env", "bmath", position + 1);
          this.type = token.type;
          this.value = token.value;
          this.place = token.place;
          lexer.goBack(this.value.length);
        }
        this.mathenv = "";
        return;
      }
      if (this.mathenv) return; // different math type
      this.closeEmptyArg(position);
      var token = lexer.nextToken();
      this.value = token.value;
      if (this.value == "$") { // display math
        this.openNewGroup("env", "bmath", position);
        token = lexer.nextToken();
        this.type = token.type;
        this.value = token.value;
        this.place = token.place;
        this.mathenv = "$$";
        lexer.goBack(this.value.length);
      } else { // inline math
        this.openNewGroup("env", "imath", position);
        this.mathenv = "$";
        this.addText(this.value, position + 1);
        /*
        token = lexer.nextToken();
        this.type = token.type;
        this.value = token.value;
        this.place = token.place;      
        lexer.goBack(this.value.length);
        */
      }
    },
    
    envFrame : function(node) {
      //  \begin{frame}<overlay specification>[<default overlay specification>][options]{title}{subtitle}
      //  environment contents
      //  \end{frame
      var argarray = node.argarray, subnode;
      if (argarray[3]) {
        argarray[3].name = "frametitle", argarray[3].mode = "block";
        if (argarray[4]) {
          argarray[4].name = "framesubtitle", argarray[4].mode = "block";
        }
      }
    },

    envsList : function(node) {
      // itemize, enumerate
      if (node.childs[0].mode == "inline") node.childs.shift();
    },

    envPreamble : function(node) {
      var doccls = node.argarray[1].childs[0].value;
      this.cmdvalues["documentclass"] = doccls;
      if (window.jaxedit && jaxedit.canPresent) {
        if (doccls == "beamer") {
          jaxedit.childs.presbtn.style.display = "inline-block";
        } else {
          jaxedit.childs.presbtn.style.display = "none";
        }
      }
    },
    
    envTabular : function(node) {
      var o = "", i, child;
      node.childs.shift();
      for (i = 0; i < node.childs.length; i++) {
        child = node.childs[i];
        if (child.name == "imath") {
          o += typejax.builder(child, true);
        } else {
          o += child.value;
        }
      }
      node.childs = [];
      while (o.charAt(o.length-1) == ' ') {            
        o = o.substring(0, o.length-1);
      }
      if (o.substring(o.length-8, o.length) == "<tr><td>") {
        o = "<table border='1'><tbody><tr><td>" + o.substring(0, o.length-8) + "</tbody></table>";
      } else {
        o = "<table border='1'><tbody><tr><td>" + o + "</td></tr></tbody></table>";
      }
      node.value = "<span class='" + node.name + "' style='display:inline-block;'>" + o + "</span>";
      this.intabular = false;
    },
    
    envsTheorem : function(node) {
      var envname = node.name, thmname = this.thmnames[envname];
      var cname = (envname.slice(-1) == '*') ? envname.slice(0, -1) : envname;
      if (!thmname) {
        thmname = cname.charAt(0).toUpperCase() + cname.slice(1);
      }
      if (node.argarray[0]) {
        node.childs.splice(0, 1);
      }
      var textnode = {
        type: "env",
        name: "thmname",
        mode: "inline",
        from: node.childs[0].from,
        value: "<b>" + thmname + " </b>",
        parent: node.childs[0],
        childs: []
      };
      node.childs[0].childs.splice(0, 0, textnode);
    },
    
    getVerbatim : function(envname) {
      //console.log("verbatim");       
      var t1 = lexer.nextToken();
      if (t1.value == "\n" || t1.value == " ") {
        t1 = lexer.nextToken();        
      }
      var t2 = lexer.nextToken();
      var t3 = lexer.nextToken();
      var t4 = lexer.nextToken();
      var t5 = lexer.nextToken();      
      while (t1.type != "escape" || t2.type != "alphabet" || t2.value != "end" || t3.type != "special" || t3.value != "{" || t4.type != "alphabet" || t4.value != envname || t5.type != "special" || t5.value != "}") {
        switch (t1.value) {
          case "\n":
            this.addText("<br>", t1.place);
            break;
          case "<":
            this.addText("&lt;", t1.place);
            break;
          case ">":
            this.addText("&gt;", t1.place);
            break;            
          default:
            this.addText(t1.value, t1.place);
        }
        t1 = t2;
        t2 = t3;
        t3 = t4;
        t4 = t5;
        t5 = lexer.nextToken();
        this.place = t5.place;
        if ( t5.value == "") break;        
      }  
    },

    beginGroup : function(type, name, thispos, nextpos) {
      while (this.nodelevel > 0 && !this.includeGroup(this.nodeplace.name, name)) {
        this.closeOldGroup(thispos);
      }
      this.openNewGroup(type, name, thispos);
      var mode = this.getGroupMode(name);
      if (mode == "main" && this.nodeplace.argtype[0] == "||") {
        // if argtype is not ["||"], we open new par in addBracket() or addText()
        this.openNewGroup("env", "par", nextpos);
      }
    },
    
    endGroup : function(type, name, thispos, nextpos) {
      var mode = this.getGroupMode(name);
      if (type == "env") {
        var match = -1;
        for (i = this.nodelevel - 1; i >= 0; i--) {
          if (this.nodearray[i].name == name) {
            match = i;
            break;
          }
        }
        if (match == -1) {
          this.addText("\\end{" + name + "}", thispos);
        } else {
          for (i = this.nodelevel - 1; i > match; i--) {
            this.closeOldGroup(thispos);
          }
          this.closeOldGroup(nextpos);
          if (mode == "main" || mode == "block") {
            this.openNewGroup("env", "par", nextpos);
          }
        }
      } else { // "cmd"
        this.closeOldGroup(nextpos);
        if (mode == "main" || mode == "block") {
          this.openNewGroup("env", "par", nextpos);
        }
      }
    },
    
    closeOldGroup : function(position) {
      //console.log("close:", position);
      var node = this.nodeplace, argtype = node.argtype;
      for (var j = node.argarray.length; j < argtype.length; j++) {  
        if (argtype[j] == "{}") {
          this.openChild("env", "{}", position, true);
        } else if (argtype[j] == "||") {
          node.argarray[j] == node;
        } else {
          node.argarray[j] = null;
        }
      }
      node.to = position;
      this.doThisGroup();
      //console.log("close:", node.name, node.argtype);
      //console.log("close:", this.nodearray);
    },
    
    openNewGroup : function(type, name, position) {
      //console.log("open: ", type, name, position);
      var args = this.getArgsType(type, name);
      if (type == "env") {
        if (args.length == 1) {
          this.openChild("env", name, position);
        } else {
          this.openChild("env", name, position);
        }
      } else { // "cmd"
        this.openChild("cmd", name, position);
      }
      //console.log("open: ", this.nodeplace.name, this.nodeplace.argtype);
      //console.log("open: ", this.nodearray);
    },

    closeOldMath : function(position) {
      if (this.mathenv != "") {
        this.closeOldGroup(position);
        this.mathenv = "";
      }
    },
    
    closeOldCmds : function(position) {
      var node;
      while (this.nodelevel > 0) {
        node = this.nodeplace;
        if (node.type != "cmd") {
          break;
        } else {
          this.closeOldGroup(position);
        }       
      }
    },

    closeEmptyArg : function(position) {
      if (this.nodelevel > 0) {
        var node = this.nodeplace;
      } else {
        return;
      }
      if (node.type == "cmd" && node.argarray.length == 0) {
        this.closeOldGroup(position);
        if (node.mode == "main" || node.mode == "block") {
          this.openNewGroup("env", "par", this.place);
        }
      } else if (node.type == "env") {
        for (var j = node.argarray.length; j < node.argtype.length - 1; j++) {
          if (node.argtype[j] == "{}") {
            node.argarray[j] = this.openChild("env", "{}", position);
          } else {
            node.argarray[j] = null;
          }
        }
        if (node.mode == "main") {
          this.openNewGroup("env", "par", this.place);
        }
      }
    },
    
    doThisGroup : function() {
      var node = this.nodeplace;
      this.closeChild(node.to);
      //console.log("doThisGroup: ", node);
      if (node.to > node.from) {
        if (node.type == "env") {
          this.doEnvironment(node);
        } else {
          this.doCommand(node);
        }
      }
      if (this.nodelevel == 0) {
        if (!node.to) console.log("doThisGroup: node.to is empty!");
        if (node.to > node.from) {
          typejax.innerdata.push([node.from, node.to, node.name]);
        }
      }
      //console.log("doThisGroup: ", node.name, node.argtype);
      //console.log("doThisGroup: ", this.nodearray);
    },
    
    initTree : function() {
      this.innertree = { // top level
        mode : "main",
        name : "tree",
        from : 0,
        to : null,
        value : "",
        argarray: [],
        parent : null,
        childs : []};
      this.nodeplace = this.innertree;
      this.nodelevel = 0;
      this.nodearray = [];
    },
    
    openChild : function(type, name, from, mark) {
      var parent = this.nodeplace;
      if (!parent) {
        console.log("openChild: wrong nodeplace!");
        return;
      }
      console.log("OpenChild: ", type, name, from);
      var node = {
        type: type,
        name: name,
        mode: this.getGroupMode(name),
        from: from,
        value: "",
        argtype: this.getArgsType(type, name),
        argarray: [],
        parent: parent,
        childs: []
      };
      parent.childs.push(node);

      this.nodeplace = node;
      this.nodelevel += 1;
      this.nodearray.push(node);

      if (node.argtype.length == 1 && node.argtype[0] == "||") {
        node.argarray.push(node);
      } else if (node.name == "group") {
        node.argarray.push(node);
      }
      if (mark) {
        parent.argarray.push(node);
      } else if (parent.argtype && parent.argtype[parent.argarray.length] === "||") {
        parent.argarray.push(parent);
      }

      console.log("nodelevel:", this.nodelevel, "arglength:", node.argarray.length);
      //this.printTree(this.innertree);
      return node;
    },
    
    closeChild : function(position) {
      var node = this.nodeplace;
      node.to = position;
      if (!node) {
        console.log("closeChild: wrong nodeplace!");
        return;
      }
      console.log("CloseChild:", node.type, node.name, node.to);
      if (node.from >= node.to) {
        //console.log("closeChild: empty group " + node.name);
        node.parent.childs.pop();
      }
      this.nodeplace = this.nodeplace.parent;
      this.nodelevel -= 1;
      this.nodearray.pop();
      
      if (node.mode == "inline" || node.name == "bmath") {
        if (node.name != "{}" && node.name != "[]" && node.name != "{]" && node.name != "<>") {
          var textnode = {
            type: "env",
            name: "itext",
            mode: "inline",
            from: node.to,
            to: -1,
            value: "",
            parent: node.parent,
            childs: []
          };
          node.parent.childs.push(textnode);
        } 
      } else if (node.mode == "block" && node.name != "bmath") {
        /*node.childs[node.childs.length -1].to = node.to;*/
      }
      console.log("nodelevel:", this.nodelevel);
      //this.printTree(this.innertree);
    },
    
    travelDown : function() {
      this.nodeplace = this.nodeplace.childs[0];
      this.nodelevel += 1;
    },
    
    travelUp : function() {
      this.nodeplace = this.nodeplace.parent;
      this.nodelevel -= 1;
    },
    
    printTree : function(tree, spaces) {
      if (!spaces) spaces = "";
      console.log("|" + spaces + tree.mode, tree.name, tree.from, tree.to, tree.value);
      for (var i = 0; i < tree.childs.length; i++) {
        this.printTree(tree.childs[i], spaces + "--"); 
      }
    },
    
    createTextNode: function(node) {
      if (node.mode != "main" && node.name != "bmath" && node.name != "imath") {
        var textnode = {
          type: "env",
          name: "itext",
          mode: "inline",
          from: node.from,
          to: -1,
          value: "",
          parent: node,
          childs: []
        };
        node.childs.push(textnode);
      }
    },
    
    appendArgsValue : function(index, value) {
      var node = this.nodeplace;
    },
    
    appendValue : function(node, value, position) {
      if (!node) {
        console.log("appendValue: wrong node!");
        return;
      }
      //console.log("appendValue:", node.name);
      if (node.childs.length == 0) {
        this.createTextNode(node);
      }
      if (node.name == "bmath" || node.name == "imath") {
        node.value += value;
      } else if (node.mode == "block" || node.mode == "inline") {
        node.childs[node.childs.length - 1].value += value;
      }
    },
    
    appendText : function(value, position) {
      var node = this.nodeplace;
      //console.log("appendText:", node.mode, value);
      this.appendValue(node, value, position);
    },
    
    addBracket : function(bracket, position) {
      var parent, node, i;
      switch (bracket) {
        case "{":
          if (this.nodelevel > 0) {
            parent = this.nodeplace;
            //console.log("bracket:", node.name, node.argtype);
            if (parent.argarray.length < parent.argtype.length) {
              for (i = parent.argarray.length; i < parent.argtype.length; i++) {
                if (parent.argtype[i] == "[]" || parent.argtype[i] == "<>") {
                  parent.argarray.push(null);
                } else break;
              }
              i = parent.argarray.length;
              if (parent.argtype[i] == "{}" || parent.argtype[i] == "{]") {
                this.openChild("env", "{}", position, true);
                //console.log("bracket:", this.value, this.nodearray);
              } else { // "||" for environment content
                if (parent.mode == "main") {
                  this.openNewGroup("env", "par", position);
                }
                this.openChild("cmd", "group", position);
              }
              //console.log("bracket:", this.value, this.nodearray);
              break;
            }
          }
          this.openChild("cmd", "group", position);
          break;
        case "}":
          if (this.nodelevel > 0) {
            node = this.nodeplace, parent = node.parent;
            if (node.name == "{}") {
              node.to = position + 1;
              this.closeChild(position + 1);
              if (parent.argtype[parent.argarray.length] === "||") {
                if (parent.mode == "main") {
                  this.openNewGroup("env", "par", position + 1);
                } else {
                  this.createTextNode(parent);
                }
                //console.log("bracket:", this.value, this.nodearray);
              } else {
                node.to = position + 1;
                //console.log("bracket:", this.value, this.nodearray);
                if (parent.argarray.length == parent.argtype.length) {
                  parent.to = position + 1;
                  this.endGroup(parent.type, parent.name, parent.from, parent.to);
                }
              }
              break;
            } else if (node.name == "group") {
              node.to = position + 1;
              this.closeChild(position + 1);
              break;
            }
          }
          this.addText(this.value, position);
          break;
        case "[":
          if (this.nodelevel > 0) {
            parent = this.nodeplace;
            if (parent.argarray.length < parent.argtype.length) {
              for (i = parent.argarray.length; i < parent.argtype.length; i++) {
                if (parent.argtype[i] == "{]" || parent.argtype[i] == "<>") {
                  parent.argarray.push(null);
                } else break;
              }
              i = parent.argarray.length;
              if (parent.argtype[i] == "[]") {
                this.openChild("env", "[]", position, true);
                //console.log(this.value, this.nodearray);
              } else if (parent.argtype[i] == "||") {
                if (parent.mode == "main") {
                  this.openNewGroup("env", "par", position);
                }
                //console.log(this.value, this.nodearray);
              } else if (parent.argtype[i] == "{}") {
                this.openChild("env", "{}", position, true);
                this.appendText("[", position);
                node.from = position + 1;
                //console.log(this.value, this.nodearray);
                if (parent.argarray.length == parent.argtype.length) {
                  this.endGroup(parent.type, parent.name, parent.from, parent.to);
                }
              }
              break;
            }
          }
          this.addText(this.value, position);
          break;
        case "]":
          if (this.nodelevel > 0) {
            node = this.nodeplace, parent = node.parent;
            if (node.name == "[]") {
              node.to = position + 1;
              this.closeChild(position + 1);
              if (parent.argtype[node.argarray.length] === "||") {
                if (parent.mode == "main") {
                  this.openNewGroup("env", "par", position + 1);
                } else {
                  this.createTextNode(parent);
                }
                //console.log(this.value, this.nodearray);
              } else {
                node.to = position + 1;
                //console.log(this.value, this.nodearray);
                if (parent.argarray.length == parent.argtype.length) {
                  parent.to = position + 1;
                  this.endGroup(parent.type, parent.name, parent.from, parent.to);
                }
              }
              break;
            }
          }
          this.addText(this.value, position);
          break;
        case "<":
          if (this.nodelevel > 0) {
            parent = this.nodeplace;
            if (parent.argarray.length < parent.argtype.length) {
              for (i = parent.argarray.length; i < parent.argtype.length; i++) {
                if (parent.argtype[i] == "{]" || parent.argtype[i] == "[]") {
                  parent.argarray.push(null);
                } else break;
              }
              i = parent.argarray.length;
              if (parent.argtype[i] == "<>") {
                this.openChild("env", "<>", position, true);
              } else if (parent.argtype[i] == "||") {
                if (parent.mode == "main") {
                  this.openNewGroup("env", "par", position);
                }
              } else if (parent.argtype[i] == "{}") {
                this.openChild("env", "{}", position, true);
                this.appendText("<", position);
                parent.to = posiiton + 1;
                if (parent.argarray.length == parent.argtype.length) {
                  this.endGroup(parent.type, parent.name, parent.from, parent.to);
                }
              }
            break;
            }
          }
          this.addText("&iexcl;", position);
          break;
        case ">":
          if (this.nodelevel > 0) {
            node = this.nodeplace, parent = node.parent;
            if (node.name == "<>") {
              node.to = position + 1;
              if (node.argtype[node.argarray.length] === "||") {
                if (node.mode == "main") {
                  this.openNewGroup("env", "par", position + 1);
                } else {
                  this.createTextNode(parent);
                }
              } else {
                node.to = position + 1;
                if (node.argarray.length == node.argtype.length) {
                  parent.to = position + 1;
                  this.endGroup(node.type, node.name, node.from, node.to);
                }
              }
              break;
            }
          }
          this.addText("&iquest;", position);
          break;
      }
    },
    
    addText : function(value, position) {
      //if (arguments.length == 1) console.log("no position for " + value);
      //console.log("addtext: start for", this.nodeplace.name, this.nodeplace.argtype, value);
      if (this.nodelevel > 0) {
        var n = value.length;
        var node = this.nodeplace;
        if (node.argarray.length == node.argtype.length) {
          this.appendText(value, position);
        } else {
          var i = node.argarray.length;
          while (i < node.argtype.length && value) {
            //console.log("addtext:", node.name);
            //console.log("addtext:", node.argtype[i]);
            if (node.argtype[i] == "||") {
              if (node.mode == "main") {
                this.openNewGroup("env", "par", position + n - value.length);
              }
              this.appendText(value, position + n - value.length);
              value = "";
              return;
            } else if (node.argtype[i] == "{}") {
              this.openChild("env", "{}", position + n - value.length, true);
              this.appendText(value.charAt(0), position + n - value.length);
              value = value.substring(1);
            } else {
              node.argarray.push(null);
            }
            i++;
          }
          //console.log("addtext:", node.name);
          node.to = position + n - value.length;
          if (node.argarray.length == node.argtype.length) {
            this.endGroup(node.type, node.mode, node.from, node.to);
            if (value) {
              this.addText(value, node.to);
            }
          } else if (value) {
            console.log("addText: value is not empty!");
            this.addText(value, position + n - value.length);
          }
        }
      } else {
        console.log("addText: nodelevel is zero!");
        this.addText(value, position);
      }
    },
    
    // test if group1 could include group2
    includeGroup : function(name1, name2) {
      var same1, same2, mode1, mode2;
      same1 = this.grpsame[name1]; if (!same1) same1 = name1;
      same2 = this.grpsame[name2]; if (!same2) same2 = name2;
      mode1 = this.grpmode[same1]; if (!mode1) mode1 = "inline";
      mode2 = this.grpmode[same2]; if (!mode2) mode2 = "inline";
      if (same2 == "section") return false;
      if ((same1 == "enumerate" || same1 == "itemize") && same2 == "item") return true;
      if (same1 == "tabular" || mode2 == "inline") return true;
      if (same1 == "item" && same2 == "item") return false;
      if (mode1 == "block" && same2 == "bmath") return true;
      if ((mode1 == "block" && mode2 != "inline") || (mode1 == "inline")) {
        console.log("includeGroup:", name1, name2, false);
        return false;
      }
      var out = this.grpsout[same2];
      if (out) {
        for (i = 0; i < out.length; i++) {
          if (out[i] == same1) return false;
        }
      }
      return true;
    },
    
    getArgsType : function(type, name) {
      var same = this.grpsame[name], args;
      if (!same) same = name;
      if (type == "env") {
        args = this.envargs[same];
        return args ? args : ["||"];
      } else {
        args = this.cmdargs[same]
        return args ? args : [];
      }
    },
    
    getGroupMode : function(name) {
      var same = this.grpsame[name]; if (!same) same = name;
      var mode = this.grpmode[same]; if (!mode) mode = "inline";
      return mode;
    }
  };

  //console.log("start analysis");
  syner.analysis(input);
  syner.printTree(syner.innertree);
  var i, outhtml = [], childs = syner.innertree.childs;
  for (i = 0; i < childs.length; i++) {
    outhtml.push([childs[i].name, this.builder(childs[i], false)]);
  }
  console.log("outhtml:", outhtml);
  return outhtml;
};

typejax.builder = function(tree, flag){
  var open, close, html = "";
  if (flag) {
    if (tree.mode == "inline") {
      open = "<span class='" + tree.name + "'>", close = "</span>";
      if (tree.name == "imath") {
        open += "<span class='MathJax_Preview'>" + tree.value + "</span>";
        open += "<script type='math/tex'>", close = "</script>" + close; 
      }
    } else {
      open = "<div class='envblock " + tree.name + "'>", close = "</div>";
      switch (tree.name) {
        case "bmath":
          open += "<div class='MathJax_Preview'>" + tree.value + "</div>";
          open += "<script type='math/tex; mode=display'>", close = "</script>" + close;
          break;
        case "enumerate":
          open += "<ol>", close = "</ol>" + close;
          break;
        case "itemize":
          open += "<ul>", close = "</ul>" + close;
          break;
        case "item":
          open = "<li>", close = "</li>";
          break;
      }
    }
  } else {
    switch (tree.name) {
      case "bmath":
        open = "<div class='MathJax_Preview'>" + tree.value + "</div>";
        open += "<script type='math/tex; mode=display'>", close = "</script>";
        break;
      case "enumerate":
        open = "<div><ol>", close = "</ol></div>";
        break;
      case "itemize":
        open = "<div><ul>", close = "</ul></div>";
        break;
      case "item":
        open = "<li>", close = "</li>";
        break;
      default:
        open = "", close = "";
    }
    flag = true;
  }
  if (tree.childs.length > 0) {
    for (var i = 0; i < tree.childs.length; i++) {
      html += this.builder(tree.childs[i], flag); 
    }
  } else {
    html = tree.value;
  }
  if (tree.mode == "inline" && tree.childs.length == 0 && tree.value == "") {
    return "";
  } else {
    return open + html + close;
  }
};

typejax.latex = {
  grpsame : {
    "part" : "section",
    "part*" : "section",
    "chapter" : "section",
    "chapter*" : "section",
    "section" : "section",
    "section*" : "section",
    "subsection" : "section",
    "subsection*" : "section",
    "subsubsection" : "section",  
    "subsubsection*" : "section",
    "paragraph": "paragraph",
    "paragraph*": "paragraph",
    "subparagraph": "paragraph",
    "subparagraph*": "paragraph",
    "definition" : "theorem",
    "definition*" : "theorem",
    "definitions" : "theorem",
    "definitions*" : "theorem",
    "example" : "theorem",
    "example*" : "theorem",
    "examples" : "theorem",
    "examples*" : "theorem",
    "fact" : "theorem",
    "fact*" : "theorem",
    "lemma" : "theorem",
    "lemma*" : "theorem",
    "theorem" : "theorem",
    "theorem*" : "theorem",
    "proposition" : "theorem",
    "proposition*" : "theorem",
    "corollary" : "theorem",
    "corollary*" : "theorem",
    "proof" : "theorem",
    "exercise" : "theorem",
    "remark" : "theorem",
    "solution" : "theorem",
    "transboxin": "transdissolve",
    "transboxout": "transdissolve",
    "transblindshorizontal": "transdissolve",
    "transblindsvertical": "transdissolve",
    "transsplithorizontalin": "transdissolve",
    "transsplithorizontalout": "transdissolve",
    "transsplitverticalin": "transdissolve",
    "transsplitverticalout": "transdissolve",
    "transglitter": "transdissolve",
    "transwipe": "transdissolve",
    "transdissolve": "transdissolve"
  },
  // main group could include main and block groups
  // block group cuuld include inline groups and bmath elements
  // inline group could include inline commands and itext/imath elements
  // bmath element should include display math directly
  // imath element should include inline math directly
  grpmode : {
    "bmath": "block",
    "center" : "main",
    "enumerate": "block",
    "frame": "main",
    "frametitle": "block",
    "framesubtitle": "block",
    "group": "inline",
    "item": "main",
    "itemize": "block",
    "maketitle": "block",
    "par" : "block",
    "preamble" : "main",
    "section" : "block",
    "tableofcontents" : "block",
    "tabular" : "inline",
    "textbf" : "inline",
    "theorem" : "main",
    "titlepage": "block",
    "verbatim" : "block"
  },
  // list of groups which could not include it
  grpsout : {
    "par" : ["par", "section"],
    "center" : ["par", "center"],
    "frame" : ["par", "frame", "center", "theorem"],
    "tableofcontents" : ["par"],
    "theorem" : ["par", "theorem"],
    "verbatim" : ["par"]
  },
  envargs : {
    "enumerate" : ["[]", "||"],
    "frame" :    ["<>", "[]", "[]", "{]", "{]", "||"],
    "item": ["<>", "||"],
    "itemize" : ["[]", "||"],
    "preamble": ["[]", "{}", "||"],
    "tabular" :  ["{}", "||"],
    "theorem" :  ["[]", "||"]
  },
  cmdargs : {
    "tableofcontents": ["[]"],
    "title": ["[]", "{}"],
    "author": ["[]", "{}"],
    "institute": ["{}"],
    "date": ["{}"],
    "address": ["{}"],
    "curraddr": ["{}"],
    "email": ["{}"],
    "translator": ["{}"],
    "keywords": ["{}"],
    "subjclass": ["{}"],
    "thanks": ["{}"],
    "dedicatory" : ["{}"],
    "section": ["[]", "{}"],
    "paragraph": ["[]", "{}"],
    "frametitle": ["{}"],
    "framesubtitle": ["{}"],
    "group": ["{}"],
    "newtheorem": ["{}", "[]", "{}", "[]"],
    "newtheorem*": ["{}", "{}"],    
    "textbf": ["{}"],
    "transdissolve": ["<>", "[]"],
    "transduration": ["<>", "{}"]
  },
  cmdvalues : {},
  counters : {},
  thmnames : {}
};
