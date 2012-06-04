
// copyright (c) 2012 zoho@ctex

WL.Event.subscribe("auth.login", onLoginComplete);

WL.init({
  client_id: "00000000400A3032",
  redirect_uri: "http://jaxedit.googlecode.com/svn/trunk/jaxedit/editor/skydrive.htm",
  scope: "wl.signin",
  response_type: "token"
});

function greetUser(session) {
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
}

function onLoginComplete() {
  var session = WL.getSession();
  if (session.error) {
    alert("Error signing in: " + session.error);
  }
  else {
    greetUser(session);
  }
}

function signUserIn() {
  var scopesArr = ["wl.signin", "wl.offline_access", "wl.skydrive"];
  WL.login({ scope: scopesArr });
}

var myspan = document.createElement("span");
myspan.innerHTML = "<button onclick='signUserIn()'>Login</button>";
document.getElementById("ltop").appendChild(myspan);
