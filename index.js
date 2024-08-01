const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const port = 5000;

const app = express();

//middlwears

app.use(cors());
app.use(express.json());

app.get("/example",(req, res) =>{
res.send("hello world");



});

//Making Connection With MySql server

let db = mysql.createConnection({
    host     : "localhost",
    user     : "root",
    password : "",
    database : "postbook2",
  });

  db.connect((err) => {
  if(err){
    console.log("something went wrong while connecting to the database:", err);
    throw err;
  }
  else{
    console.log("MYSQL server conected...")
  }
  });

  //getting user data from sever

  app.post('/getUserInfo',(req ,res)=>{
   console.log(req.body);

   const {userId,password}= req.body;

   const getUserInfosql =`SELECT userId,userName,userImage FROM users WHERE users.userId=? AND users.userPassword =?`

   let query = db.query(getUserInfosql,[userId,password], (err,result) =>{
    if(err){
      console.log("Error getting userInfo sever:",err);
      throw err;
    }
    else{
      res.send(result);
    }
   });
  });

  app.get('/getAllposts',(req, res) =>{
    const sqlForAllpost = `SELECT users.userName AS postedUserName,users.userImage AS postedUserImage,post.postId,post.postText,post.postedTime, post.postImageUrl FROM post INNER JOIN users ON post.postedUserId = users.userId ORDER BY post.postedTime DESC
   `;

    let query = db.query(sqlForAllpost,(err, result) =>{
    if(err){
      console.log("Error loading all posts from database",err);
      throw err;
    }
    else{
      console.log(result);
      res.send(result);
    }
    });
  });

  //gatting comments of a single post

  app.get('/getAllComments/:postId', (req , res) =>{
    let id = req.params.postId;

    let sqlForAllcomments =`
   SELECT users.userName AS commentedUserName,users.userImage AS commentedUserImage,comment.commentId,comment.commentpostId,comment.commentText,comment.commentedTime
   FROM comment
   INNER JOIN users ON comment.commentedUserId=users.userId WHERE comment.commentpostId =${id}`;

let query = db.query(sqlForAllcomments, (err,result) => {
if(err){
  console.log("Error fetching comments from thr database: " ,err);
  throw err;
}
else{
  res.send(result);
}
});
 });
  //adding new comments to a post 
 app.post("/postComment", (req, res) =>{

   const {commentpostId, commentedUserId,commentText,commentedTime} =
    req.body;

   let sqlForaddingNewcomments =`INSERT INTO comment (commentId, commentpostId, commentedUserId, commentText, commentedTime) VALUES (NULL, ?, ?, ?, ?);`;

   let query = db.query(sqlForaddingNewcomments ,[
    commentpostId,commentedUserId,commentText,commentedTime],(err, result) => {
     if(err){
      console.log("error adding comment to the database:",err);
      throw err;
    }
    else{
      res.send(result);
    }
   }
  );
 });

 //  adding a new post..
 app.post("/addNewPost",(req, res) =>{
  // distructure the req.body object
  const {postedUserId,postedTime,postText,postImageUrl} = req.body;

  // sql query

  let sqlForAddingNewPost =`
  INSERT INTO post (postId, postedUserId, postedTime, postText, postImageUrl) VALUES (NULL, ?, ?,  ?, ?);`;

  let query = db.query(sqlForAddingNewPost,[postedUserId,postedTime, postText, postImageUrl],(err, result) => {
     if(err){
      console.log("Error while adding a new post in the database:", err);
      throw err;
     }
     else{
      res.send(result);
     }
  }
);

 });

app.listen(port,() =>{
    console.log(`server is running on port ${port}`);
});