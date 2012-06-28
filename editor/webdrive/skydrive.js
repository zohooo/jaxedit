
// Copyright (c) 2012 JaxEdit Project

var skydrive = {
  homeid: null,
  thisid: null,

  initDrive: function() {
    var cid, url = location.protocol + '//' + location.host + location.pathname;
    switch(location.hostname) {
      case "jaxedit.sourceforge.net":
        cid = "000000004C0BD522";
        break;
      case "jaxedit.com":
        cid = "000000004C0BD523";
        break;
      case "www.jaxedit.com":
        cid = "000000004C0BD524";
        break;
      case "zohooo.github.com":
        cid = "000000004C0BDA05";
        break;
      case "jaxedit.googlecode.com":
        cid = "00000000400A3032";
        break;
    }

    WL.init({
      client_id: cid,
      redirect_uri: url + "editor/webdrive/skydrive.htm",
      scope: ["wl.signin", "wl.skydrive", "wl.skydrive_update"],
      response_type: "token",
      logging: true
    });

    WL.Event.subscribe("auth.login", this.onLoginComplete);
    WL.Event.subscribe("auth.logout", this.onLogoutComplete);
    WL.Event.subscribe("auth.sessionChange", this.onSessionChange);
    WL.Event.subscribe("auth.statusChange", this.onStatusChange);
    WL.Event.subscribe("wl.log", this.onErrorOccur);
  },

  signUserIn: function() {
    WL.login();
  },

  signUserOut: function() {
    WL.logout();
  },

  signUserInOut: function() {
    var el = document.getElementById("loginbtn");
    if (el.value == "Login") {
      WL.login();
    } else {
      WL.logout();
    }
  },
  
  greetUser: function(session) {
    var strGreeting = "";
    WL.api(
    {
      path: "me",
      method: "GET"
    },
    function (response) {
      if (!response.error) {
        strGreeting = "Hi, " + response.name + "!"
        alert(strGreeting);
      }
    });
  },

  getFoldersList: function() {
    WL.api(
    {
      path: "/me/skydrive/files",
      method: "GET"
    },
    function(response) {
      if (!response.error) {
        var exist = false, data, id;
        for (var i = 0; i < response.data.length; i++) {
          data = response.data[i];
          console.log(data.type, data.name);
          if (data.type == "folder" && data.name == "JaxEdit") {
            exist = true;
            skydrive.homeid = data.id;
            console.log("skydrive: homeid = ", data.id);
            break;
          }
        }
        if (!exist) {
          skydrive.createMainFolder();
        }
      } else {
        alert('Error in reading skydrive files!');
      }
    });
  },

  createMainFolder: function() {
    WL.api({
      path: "me/skydrive",
      method: "POST",
      body: {
        name: "JaxEdit"
      }
    },
    function(response){
      if (!response.error) {
        skydrive.homeid = response.id;
        console.log("skydrive: homeid = ", response.id);
      } else {
        alert('Error in creating jaxedit folder!');
      }
    });
  },

  getFilesList: function(fid, callback) {
    console.log("skydrive: getFilesList with fid = ", fid);
    WL.api(
    {
      path: fid + "/files",
      method: "GET"
    }, callback);
    skydrive.thisid = fid;
  },

  onLoginComplete: function() {
    var session = WL.getSession();
    if (session.error) {
      alert("Error signing in: " + session.error);
    }
    else {
      alert("You have been logged into SkyDrive.");
      skydrive.access_token = session.access_token;
      skydrive.getFoldersList();
    }
  },

  onLogoutComplete: function() {
    alert("You have been logged out of SkyDrive.");
  },

  onSessionChange: function() {
    var session = WL.getSession();
    if (session) {
      skydrive.access_token = session.access_token;
      console.log("Your session has changed.");
    }
  },

  onStatusChange: function() {
    WL.getLoginStatus(function(response) {
      if (response.status == "connected") {
        jaxedit.changeLoginButton("Logout");
      } else {
        jaxedit.changeLoginButton("Login");
      };
    });
  },

  onErrorOccur: function() {
    alert("Error in Skydrive!");
  }
};
