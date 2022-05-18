let vnames = document.getElementsByClassName("vn");
let vnDivs = document.getElementsByClassName("videoName");
let buttons = document.getElementsByClassName("delete");
let addbtn = document.getElementById("button2");
let playbtn = document.getElementById("button1");

function playGame() {
  window.location = "/compare.html";
}

playbtn.addEventListener("click",playGame);


function grayOutAdd() {
  addbtn.style.opacity = "0.5";
  addbtn.disabled = "disabled";
  addbtn.style.cursor = "default";
  addbtn.classList.remove("hover");
}

function grayOutPlay() {
  playbtn.style.opacity = "0.5";
  playbtn.disabled = "disabled";
  playbtn.style.cursor = "default";
  playbtn.classList.remove("hover");
}

async function sendGetRequest(url) {
  let response = await fetch(url, {
    method: 'GET', 
    headers: {'Content-Type': 'application/json'}
  });
  if (response.ok) {
    let data = await response.text();
    return data;
  } else {
    throw Error(response.status);
  }
}

async function sendDeletePostRequest(url,data) {
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

// get the nickname
sendGetRequest('/getNicknames') 
  .then(function(result) {
    sessionStorage.clear();
    sessionStorage.setItem("allNicknames", JSON.parse(result));
    let jsonObject = JSON.parse(result);
    // Gray out button
    if (jsonObject.length >= 8) {
      grayOutAdd();
    }
    else if (jsonObject.length < 8) {
      grayOutPlay();
    }
    for (let i=0; i<8; i++) {
      vnames[i].textContent = jsonObject[i].nickname;
      vnDivs[i].style.border = "1px solid #808080";
      let button = buttons[i];
      button.addEventListener("click",function(){
        buttonAction(jsonObject[i].nickname)
      });
    }
  })
  .catch(function(error) {
     console.error('Error:', error);
  });


function buttonAction(nickToDelete) {
  let NumId = JSON.stringify({"numId": nickToDelete});
  sendDeletePostRequest('/deleteVideo', NumId)
    .then(function(result){
      location.reload();
      console.log("result was sent");
    })
    .catch(function(error){
      console.error('Error:', error);
    }); 
}
