/* this will run after DOM is created */
/* grab user input from the website */
let continueButton = document.getElementById("button1");
continueButton.addEventListener("click",buttonAction);


/* function gets called by eventListener when button is clicked */

async function sendPostRequest(url,data) {
  let response = await fetch(url, {
    method: 'POST', 
    headers: {'Content-Type': 'application/json'},
    body: data });
  if (response.ok) {
    let data = await response.text(); 
    return data;
  } else {
    throw Error(response.status);
  }
}

function buttonAction() {
  let uname = document.getElementById("uname").value;
  let turl = document.getElementById("turl").value;
  let vnick = document.getElementById("vnick").value;
  let vidObj = JSON.stringify({
    "userid": uname,
    "url": turl,
    "nickname": vnick
   });
  // at this point, we should send a POST request
  // send relative url and data as inputs and returns a Promise object
  sendPostRequest('/videoData', vidObj)
  .then(function(data) {
    sessionStorage.setItem("vid_obj", data);
    let checkFull = data;
    if (checkFull === "database is full") {
      alertPopUp();
    }
    else {
      window.location = "/videoPreview.html";
    }
  })
  .catch(function(error) {
     console.error('Error:', error);
  });
}

function alertPopUp() {
  alert("Database full, can only add 8 videos!");
}

