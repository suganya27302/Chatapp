// Connection Between client and server.
let socket = io.connect("http://127.0.0.1:3000/");

let joinWindow = document.getElementById("join-window");
let handle = document.getElementById("handle");
let joinButton = document.getElementById("join-button");

let chatWindow = document.getElementById("chat-window");
let message = document.getElementById("message");
let output = document.getElementById("output");
let sendButton = document.getElementById("send-button");
let exit = document.getElementById("leave-chat");

let typeMessage = document.getElementById("type-message");
let joinedPrompt = document.getElementById("joined-prompt");
let userName = document.getElementById("nameofuser");
let showOnlineButton = document.getElementById("online-users");
let userContainer = document.getElementById("show-users");

// It will redirect to chat window  and update username
joinButton.addEventListener("click", () => {
  if (!handle.value) {
    alert("Please enter a Valid name!");
    window.location.reload();
  } else {
    displayTheChatWindow();
    updateUsernameAndDateInUI();
    socket.emit("newUser", handle.value);
  }
});

// when a user clicks the enter in keyboard ,message will broadcast to all users.
message.addEventListener("keypress", function (event) {
  if (event.key == "Enter") {
    event.preventDefault(); // prevent the reload of the page
    sendButton.click();
  }
});

/**
 * when a user clicks the  send button ,message will broadcast to all users and
 * users own message display in UI
 */
sendButton.addEventListener("click", () => {
  if (!message.value) alert("Message field is null!.");
  else {
    typeMessage.innerHTML = "";
    updateTheUserOwnMessageToUI();
    socket.emit("chat", {
      message: message.value,
      handle: handle.value,
    });
    message.value = "";
  }
});

//  when a user clicks the leave button, socket connection disconnects and redirect to Login page.
exit.addEventListener("click", () => {
  handle.value = "";
  if (socket) socket.disconnect(); // manually disconnect the socket connection
  displayTheJoinWindow();
  output.replaceChildren();
  hideTheOnlineUsers();
  socket.connect(); //manually connects the socket connection
});

// When users clicks the view user button ,it get the current online users available
showOnlineButton.addEventListener("click", () => {
  socket.emit("getUsers");
});

// It will receive the current users and display in UI and hide after 10 seconds.
socket.on("sendUsers", (usersList) => {
  displayOnlineUsersInUI(usersList);
  setTimeout(() => {
    hideTheOnlineUsers();
  }, 10000);
});

// when a user joins the chat, it displays a message and popup in UI and hide popup after 3 seconds
socket.on("join", (userName) => {
  updateTheStateOfUserInUIWithPopup("join", userName);
  setTimeout(() => {
    hideThePopupInUI();
  }, 3000);
  output.innerHTML += "<p>" + userName + " joined chat" + "</p>";
});

// when a user left the chat, it displays a message and popup in UI and hide popup after 3 seconds
socket.on("left", (userName) => {
  if (userName !== null) {
    updateTheStateOfUserInUIWithPopup("left", userName);
    setTimeout(() => {
      hideThePopupInUI();
    }, 3000);
    output.innerHTML += "<p>" + userName + " left chat" + "</p>";
  }
});

// It displays the other users chat in UI
socket.on("chat", (data) => {
  typeMessage.innerHTML = "";
  console.log(data);
  updateTheOtherUserMessageToUI(data);
});

// It displays the typing message when the user types.
message.addEventListener("keypress", () => {
  socket.emit("typing", handle.value);
});

// It displays the typing message when other user types.
socket.on("typing", (data) => {
  typeMessage.innerHTML =
    "<em><i>" + data + " is typing a message.." + "</i></em>";
});

// automate scroll of chat area
setInterval(() => {
  automateScroll();
}, 1000);

/**
 * It will display a popup in chat window when a user joined or lefts the chat.
 * @param {string} state whether the user is available or not
 * @param {string} userName name of the user
 * @return {void} nothing
 */
function updateTheStateOfUserInUIWithPopup(state, userName) {
  joinedPrompt.style.visibility = "visible";
  joinedPrompt.style.borderRadius = "25px";
  joinedPrompt.style.backgroundColor = "rgb(252, 231, 228)";
  if (state == "join") joinedPrompt.innerHTML = userName + " joined chat";
  else joinedPrompt.innerHTML = userName + " left chat";
}

/**
 * It will hide the popup in chat window
 * @params {void}
 * @return {void} nothing
 */
function hideThePopupInUI() {
  joinedPrompt.innerHTML = "";
  joinedPrompt.style.padding = 0;
  joinedPrompt.style.borderRadius = 0;
  joinedPrompt.style.backgroundColor = "none";
  joinedPrompt.style.visibility = "hidden";
}

/**
 * It will display the chat window, when the user clicks the join button.
 * @params {void}
 * @return {void} nothing
 */
function displayTheChatWindow() {
  joinWindow.style.display = "none";
  chatWindow.style.display = "flex";
  document.body.style.backgroundColor = "#CEBDCF";
  document.body.style.backgroundImage = "none";
}

/**
 * It will display the login page window, when the user clicks the leave button.
 * @params {void}
 * @return {void} nothing
 */
function displayTheJoinWindow() {
  joinWindow.style.display = "block";
  chatWindow.style.display = "none";
  document.body.style.backgroundColor = "none";
  document.body.style.backgroundImage = "url('ASSETS/pagebackground.jpg')";
}

/**
 * It will display the user name in chat window and today date in chat area.
 * @params {void}
 * @return {void} nothing
 */
function updateUsernameAndDateInUI() {
  let newUser = handle.value;
  userName.innerHTML =
    newUser.charAt(0).toUpperCase() + newUser.slice(1) + "<em>&#128516;</em>";
  output.innerHTML += "<p class='chat-date'>" + getChatOpenDate() + "</p>";
}

/**
 * It will display the users own message in their chat area with time.
 * @params {void}
 * @return {void} nothing
 */
function updateTheUserOwnMessageToUI() {
  let ourMessage = `<div class="our-message"><div class="heading-username"><span class="username">
  <i>you</i>
   </span>
   <span class="message-time">${getMessageReceiveTime()}</span></div>
   <p class="usermessage">
   ${message.value} 
   </p></div>`;
  output.innerHTML += ourMessage;
}

/**
 * It will display the other users message in their chat area with time.
 * @params {object} data (object containing username and message)
 * @return {void} nothing
 */
function updateTheOtherUserMessageToUI(data) {
  let othersMessage = `<div class="other-message"><div class="heading-username"><span class="username">
  <i> ${data.handle}</i>
   </span>
   <span class="message-time">${getMessageReceiveTime()}</span></div>
   <p class="usermessage">
   ${data.message} 
   </p></div>`;
  output.innerHTML += othersMessage;
}

/**
 * It will display the users own message in their chat area with time.
 * @params {object} usersList (object containing socketid and username)
 * @return {void} nothing
 */

function displayOnlineUsersInUI(usersList) {
  userContainer.replaceChildren();
  userContainer.style.display = "block";
  let marqueeElement = document.createElement("Marquee");
  marqueeElement.innerHTML += "&#128488;" + " ";
  for (let user in usersList) {
    marqueeElement.innerHTML +=
      "<strong>" + usersList[user] + "&#128060;" + "  " + "</strong>";
  }
  userContainer.appendChild(marqueeElement);
}

/**
 * It will hide the current online uers container
 * @params {void}
 * @return {void} nothing
 */
function hideTheOnlineUsers() {
  userContainer.style.display = "none";
}

/**
 * It will automatically scroll the chat area when the message overflows the chat area height.
 * @params {void}
 * @return {void} nothing
 */
function automateScroll() {
  let scrollheight = output.scrollHeight;
  let clientheight = output.clientHeight;
  let difference = scrollheight - clientheight;

  output.scrollTo({
    top: difference,
    behavior: "smooth",
  });
}

/**
 * To update the time of the message received.
 * By using date object and its methods live date is fetched and  using hour value am or pm is decided.
 * @params {void}
 * @return {string} dateTime (message reveiced time)
 */
function getMessageReceiveTime() {
  let dateTime = new Date();

  let partOfTime;
  var hour = dateTime.getHours();
  var minute = dateTime.getMinutes();

  hour == 0
    ? ((hour = 12), (partOfTime = "AM"))
    : hour < 12
    ? (partOfTime = "AM")
    : hour == 12
    ? (partOfTime = "PM")
    : ((partOfTime = "PM"), (hour = hour - 12));

  hour < 10 ? (hour = "0" + hour + ":") : (hour = hour + ":");
  minute < 10 ? (minute = "0" + minute) : (minute = minute);

  dateTime = hour + minute + " " + partOfTime;
  return dateTime;
}

/**
 * To update the date when the user joins the chat.
 * todayDate function is used to append prefix as zero to the date as it satisfies the condition.
 * @params {void}
 * @return {string} todayDate (date of the user joins the chat)
 */
function getChatOpenDate() {
  var dateTime = new Date();
  let date = new Date(dateTime).getDate();
  let month = new Date(dateTime).toLocaleString("en-US", {
    month: "long",
  });
  let year = new Date(dateTime).getFullYear();

  let todayDate = (function () {
    return date >= 1 && date <= 9
      ? `${month} 0${date}, ${year}`
      : `${month} ${date}, ${year}`;
  })();
  return todayDate;
}
