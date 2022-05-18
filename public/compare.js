let videoElmts = document.getElementsByClassName("tiktokDiv");

let reloadButtons = document.getElementsByClassName("reload");
let heartButtons = document.querySelectorAll("div.heart");
let nextButton = document.getElementById("next");
nextButton.addEventListener("click",nextAction);

let vidTitle1 = document.getElementById("vidTitle1");
let vidTitle2 = document.getElementById("vidTitle2");

// Insert Preference Variables

let pref1 = 0, pref2 = 0;
let pref1Id, pref2Id, prefObj;


for (let i=0; i<2; i++) {
  let reload = reloadButtons[i]; 
  reload.addEventListener("click",function() { reloadVideo(videoElmts[i]) });
  heartButtons[i].classList.add("unloved");
  let hearts = heartButtons[i];
  hearts.addEventListener("click",function() { heartAction(i) });
}

function heartAction(val) {
  if (val == 0) {
    document.getElementById("heart1").classList.add('fas', 'fa-heart');
    if (heartButtons[val].classList.contains('unloved')) {
      heartButtons[val].classList.remove('unloved'); 
    }
    document.getElementById("heart2").classList.remove('fas', 'fa-heart');
    document.getElementById("heart2").classList.add('far', 'fa-heart');
    heartButtons[val + 1].classList.add('unloved');
    pref1 = 1;
    pref2 = 0;
    createPrefObj();
  }
  else if (val == 1) {
    document.getElementById("heart2").classList.add('fas', 'fa-heart');
    if (heartButtons[val].classList.contains('unloved')) {
      heartButtons[val].classList.remove('unloved'); 
    }
    document.getElementById("heart1").classList.remove('fas', 'fa-heart');
    document.getElementById("heart1").classList.add('far', 'fa-heart');
    heartButtons[val - 1].classList.add('unloved');
    pref2 = 1;
    pref1 = 0;
    createPrefObj();
  }
}

function createPrefObj() {
   if (pref1 > pref2) {
   prefObj = {
      "better": pref1Id,
      "worse": pref2Id
     }; 
  }
  else if (pref2 > pref1) {
     prefObj = {
      "better": pref2Id,
      "worse": pref1Id
     }; 
  } 
}

function nextAction() {
    console.log(prefObj);
    sendPostRequest('/insertPref', prefObj)
  .then(function(data) {
    let checkFull = data;
    if (checkFull === "continue") {
      window.location = "/compare.html";
    }
    else {
      window.location = "/winner.html";
    }
  })
  .catch(function(error) {
     console.error('Error:', error);
  });
}

sendGetRequest('/getTwoVideos') 
  .then(function(result) {
    let jsonObject = result;
    for (let i=0; i<2; i++) {
      addVideo(jsonObject[i].url ,videoElmts[i]);
    }
    vidTitle1.textContent = jsonObject[0].nickname;
    vidTitle2.textContent = jsonObject[1].nickname;
    pref1Id = jsonObject[0].rowIdNum;
    pref2Id = jsonObject[1].rowIdNum;
    loadTheVideos();
  })
  .catch(function(error) {
     console.error('Error:', error);
  });