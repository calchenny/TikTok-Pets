'use strict'
// index.js
// This is our main server file

// A static server using Node and Express
const express = require("express");

// local modules
const db = require("./sqlWrap");
const win = require("./pickWinner");

// gets data out of HTTP request body 
// and attaches it to the request object
const bodyParser = require('body-parser');

/* might be a useful function when picking random videos */
function getRandomInt(max) {
  let n = Math.floor(Math.random() * max);
  // console.log(n);
  return n;
}

/* start of code run on start-up */
// create object to interface with express
const app = express();
// Get JSON out of HTTP request body, JSON.parse, and put object into req.body
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(express.json());

// Code in this section sets up an express pipeline

app.post("/deleteVideo", (req, res) =>{
    console.log("sending Response");
    console.log("video id to delete: ", req.body);
    deleteVid(req.body)
    .then(function(data){
      res.send("deleting vid");
      dumpTable().then(function(result){
          console.log("reprint: ",result);
        });
    })
    .catch(function(error){
      console.error("Error: ", error);
    });
    res.send("success");
});

// This is where the server receives and responds to POST requests
app.post("/videoData", (req, res) =>{
    console.log("sending Response")
    console.log(req.body);
    // insert video into database
    insertAndCount(req.body);

    // checking if full, if so then show popup
    dumpTable().then(function(result){
      if (result.length >= 8) {
      // notifies the browser that the database is full
      res.send("database is full");
    }
    else {
      res.send("database is not full");
    }
    });
});

app.post("/insertPref", (req, res) =>{
    console.log("sending Response");
    console.log("insert pref request: ", req.body);
    insertAndCountPref(req.body);

    dumpPrefTable().then(function(result) {
      if (result.length >= 15) {
        res.send("pick winner");
      }
      else {
        res.send("continue");
      }
    });
});

// print info about incoming HTTP request 
// for debugging
app.use(function(req, res, next) {
  console.log(req.method,req.url);
  next();
})
// make all the files in 'public' available 
app.use(express.static("public"));

// if no file specified, return the main page
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/public/tiktokPets.html");
});

app.get("/getTwoVideos", (req, res) => {
  twoRandVids().then(function(result) {
    res.json(result);
  });
});

app.get("/getWinner", async function(req, res) {
  console.log("getting winner");
  try {
  // change parameter to "false" to get it to computer real winner based on PrefTable 
  // with parameter="true", it uses fake preferences data and gets a random result.
  // winner should contain the rowId of the winning video.
  let winner = await win.computeWinner(8,false);
  let returnVid = await getVid(winner);
  // you'll need to send back a more meaningful response here.
  res.json(returnVid);
  } catch(err) {
    res.status(500).send(err);
  }
});

// responds to the getMostRecent request and sends back the most recent vid
app.get("/getMostRecent", (req, res) => {
  mostRecent().then(function(result) {
    res.json(result);
  });
});

// responds to the getNickname request and sends back all the nicknames
app.get("/getNicknames", (req, res) => {
  getNicknames().then(function(result) {
    res.json(result);
  });
});


async function getVid(Id) {
  let sqlCommand = 'select * from VideoTable where rowIdNum = "'+ Id + '"';
  let result = await db.get(sqlCommand);
  return result;
}

async function twoRandVids() {
  let sqlCommand = "select * from VideoTable order by random() limit 2";
  let result = await db.all(sqlCommand);
  return result;
}

async function mostRecent() {
  let sqlCommand = "select * from VideoTable where flag = 1";
  let result = await db.get(sqlCommand);
  return result;
}

async function getNicknames() {
  let sqlCommand = "select nickname from VideoTable";
  let result = await db.all(sqlCommand);
  return result;
}

async function deleteVid(rowNum) {
  let sqlCommand = 'delete from VideoTable where nickname = "' + rowNum.numId + '"';
  await db.run(sqlCommand);

  // debugging purposes
  dumpTable().then(function(result){
    console.log("Updated VideoTable: ", result);
  });
  
}

// Page not found
app.use(function(req, res){
  res.status(404); 
  res.type('txt'); 
  res.send('404 - File '+req.url+' not found'); 
});

// end of pipeline specification

// Now listen for HTTP requests
// it's an event listener on the server!
const listener = app.listen(3000, function () {
  console.log("The static server is listening on port " + listener.address().port);
});

// database code

// set up the database
const fetch = require("cross-fetch");

async function updateDB() {
  let sqlCommand = "UPDATE VideoTable SET FLAG = 0 WHERE FLAG = 1";
	await db.run(sqlCommand);
}

// ============== Insert & Count Video ================ //
async function insertAndCount(vidObj) {
  try {
    // Gain access to the entire table in sql
    dumpTable()
    .then(function(result) {
      let n = result.length;
      console.log(n + " items in the database");
      console.log("Before: ",result);
      if (n >= 8){
        console.log("Database is full");
        // will edit later --> include pop up
      }
      else {
        updateDB();
        console.log("Database is not full, inserting")
        insertVideo(vidObj);
        dumpTable().then(function(result){
          console.log("After: ",result);
        });
        return 0;
      }
    })
    .catch(function(err) {
    console.log("SQL error",err)} );
    
  } catch (err) {console.log("ERROR!!!", err);}
}

async function insertAndCountPref(prefObj) {
    try {
    // Gain access to the entire table in sql
    dumpPrefTable()
    .then(function(result) {
      let n = result.length;
      console.log(n + " items in the database");
      console.log("Before: ",result);
      if (n >= 15){
        console.log("Pref Database is full");
      }
      else {
        console.log("Pref Database is not full, inserting")
        insertPrefVideo(prefObj);
        dumpPrefTable().then(function(result){
          console.log("After: ",result);
        });
        return 0;
      }
    })
    .catch(function(err) {
    console.log("SQL error",err)} );
    
  } catch (err) {console.log("ERROR!!!", err);}
}

  
// ******************************************** //
// Define async functions to perform the database 
// operations we need

// An async function to insert a video into the database
async function insertVideo(v) {
  const sql = "insert into VideoTable (userid,url,nickname,flag) values (?,?,?,TRUE)";
  await db.run(sql,[v.userid, v.url, v.nickname]);
}

async function insertPrefVideo(v) {
    const sql = "insert into PrefTable (better,worse) values (?,?)";
    await db.run(sql,[v.better, v.worse]);
}

// an async function to get a video's database row by its nickname
async function getVideo(nickname) {
  // warning! You can only use ? to replace table data, not table name or column name.
  const sql = 'select * from VideoTable where nickname = ?';
  let result = db.get(sql, [nickname]);
  return result;
}

// an async function to get the whole contents of the database 
async function dumpTable() {
  const sql = "select * from VideoTable"
  let result = await db.all(sql)
  return result;
}

async function dumpPrefTable() {
  const sql = "select * from PrefTable"
  let result = await db.all(sql)
  return result;
}

// End of database code