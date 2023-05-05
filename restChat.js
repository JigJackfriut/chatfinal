// Rest based chat client
// Jim Skon 2022
// Kenyon College

var baseUrl = 'http://54.198.38.17:5005';
var state="off";
var myname="";
var inthandle;
var inthandleUsers;
var currentUsers = [];
var masterUsers = [];

/* Start with text input and status hidden */
document.getElementById('chatinput').style.display = 'none';
document.getElementById('status').style.display = 'none';
document.getElementById('leave').style.display = 'none';


// Action if they push the leave button
document.getElementById('leave-btn').addEventListener("click", (e) => {
        leaveSession();
})
document.getElementById('send-btn').addEventListener("click", sendText);
// Action if they push enter on message box
document.getElementById('message').addEventListener("keydown", (e)=> {
    if (e.code == "Enter") {
        e.preventDefault();
        sendText();
        document.getElementById('message').value = "";
        return false;
    }   
});



// Call function on page exit
window.onbeforeunload = leaveSession;




function completeSend(results) {
        var status = results['status'];
        if (status == "success") {
                console.log("Send succeeded")
        } else {
                alert("Error sending message!");
        }
}

//function called on submit or enter on text input
function sendText() {
    var message = document.getElementById('message').value;
    console.log("Send: "+myname+":"+message);
        fetch(baseUrl+'/chat/send/'+myname+'/'+message, {
        method: 'get'
    })                                                        

    .then (response => response.json() )
    .then (data => completeSend(data))
    .catch(error => {
        {alert("Error: Something went wrong:"+error);}
    })    
        document.getElementById('message').value = "";
}

function completeFetch(result) {
        // Messages
        messages = result["messages"];
        messages.forEach(function (m,i) {
                name = m['user'];
                message = m['message'];
                document.getElementById('chatBox').innerHTML +=
                "<font color='red'>" + name + ": </font>" + message + "<br />";
        });
        // Users
        users = result["userList"];
        users.forEach(function (m,i) {
                name = m['user'] + ", ";
                if (masterUsers.includes(name) == false) {
                        masterUsers.push(name);
                }
        });
}

/* Check for new messaged */
function fetchMessage() {
        fetch(baseUrl+'/chat/fetch/'+myname, {
        method: 'get'
    })
    .then (response => response.json() )
    .then (data =>completeFetch(data))
    .catch(error => {
        {console.log("Server appears down");}
    })          
}



/* Functions to set up visibility of sections of the display */
function startSession(name){
    state="on";
    document.getElementById('yourname').value = "";
    document.getElementById('register').style.display = 'none';
    document.getElementById('user').innerHTML = "User: " + name;
    document.getElementById('chatinput').style.display = 'block';
    document.getElementById('status').style.display = 'block';
    document.getElementById('members').innerHTML = name;
    document.getElementById('leave').style.display = 'block';
    /* Check for messages every 500 ms */
    inthandle=setInterval(fetchMessage,500);
    /* Check for current users every 500 ms */
    //inthandleUsers=setInterval(updateUsers,500);
}
function leaveSession(){
    state="off";
    logout();
    document.getElementById('yourname').value = "";
    document.getElementById('register').style.display = 'block';
    document.getElementById('user').innerHTML = "";
    document.getElementById('chatinput').style.display = 'none';
    document.getElementById('members').style.display = 'none';
    document.getElementById('status').style.display = 'none';
    document.getElementById('leave').style.display = 'none';
        clearInterval(inthandle);
        //clearInterval(inthandleUsers);
}

function logout() {
        fetch(baseUrl+'/chat/logout/'+myname, {
                method: 'get'
        })
        .then (response => response.json() )
        .then (data => completeLogout(data) )
        .catch(error => {
                {console.log("Service Unavailable");}
        })
}

function completeLogout(user) {
        removeUser(user);
}

// I wrote code for registration

// Define a function to handle registration form submission


function registerUser() { 
  // Get the form input values
  const name = document.getElementById("orangeForm-name").value;
  const email = document.getElementById("orangeForm-email").value;
  const password = document.getElementById("orangeForm-pass").value;

  // Validate the input
  if (!name || !email || !password) {
    alert("Please fill out all fields");
    return;
  } else if (password.length < 6) {
    alert("Password must be at least 6 characters long");
    return;
  } else if (checkIfUsernameExists(name)) {
    alert("Username already exists");
    return;
  } else {
    // Save user credentials to localStorage
    const users = JSON.parse(localStorage.getItem("users")) || [];
    users.push({ name, password });
    localStorage.setItem("users", JSON.stringify(users));

    alert("Registration successful!");
        startSession(name);
    myname= name;
  }
}


function loginUser() {
  // Get the form input values
  const name = document.getElementById("myname").value;
  const password = document.getElementById("mypass").value;

  // Validate the input
  if (!name || !password) {
    alert("Please enter your name and password");
    return;
  }

  // Get the stored users data from localStorage
  const users = JSON.parse(localStorage.getItem("users")) || [];

  // Find the user with the matching name and password
  const user = users.find(u => u.name === name && u.password === password);

  if (!user) {
    alert("Invalid name or password");
    return;
  }

  // Start the user session and store the user name
  startSession(name);
  myname = name;

  alert("Login successful!");
}


  
        
function checkIfUsernameExists(username) {
  // Check if username exists in localStorage
  const users = JSON.parse(localStorage.getItem("users")) || [];
  return users.some(user => user.name === username);
}

// Attach the registerUser function to the form submit button
const submitButton = document.getElementById("saveChangesButton");
submitButton.addEventListener("click", registerUser);

