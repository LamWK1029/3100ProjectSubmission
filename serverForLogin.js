// serverForLogin.js
var mysql = require('mysql');
const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();
const bodyParser = require('body-parser');
var nodemailer = require('nodemailer');

// userData
var gUserName;
var gUserEmail;
var gLoyPoint;

var verifyCode = Math.floor(Math.random() * 9999999);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

//mySQL
var mc = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "12345678",
    insecureAuth : true,
    database: "userDB"
});
mc.connect();

//express
app.use(express.static('public'));
// homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname+'/public/Login.html'));
});

// when login button be clicked
app.post('/homePage', (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    //read database
    mc.query('SELECT * FROM userTable', function (error, results, fields) {
        if (error) throw error;
        // userLogin
        var loginSuccess = false;
        for(var i=0; i<results.length; i++){
            if(results[i].userName == req.body.userName  && results[i].email == req.body.userEmail && results[i].password == req.body.userPassword){
                if(results[i].userType == 0) {
                    res.sendFile(path.join(__dirname + '/public/MainpageLocked.html'));
                    console.log("userLogin Success!");
                    loginSuccess = true;
                    gUserName = req.body.userName;
                    gUserEmail = req.body.userEmail;
                    gLoyPoint = results[i].loyaltyPoint;
                    break;
                } else {
                    res.sendFile(path.join(__dirname + '/public/adminPage.html'));
                    console.log("adminLogin Success!");
                    loginSuccess = true;
                    break;
                }
            } else {
                console.log("Login fail!");
            }
        }
        // after db checking
        if(loginSuccess == false){
            res.sendFile(path.join(__dirname+'/public/LoginUnsuccess.html'));
        }
    });
});

// when sign up button be clicked
app.post('/signUp', (req, res) => {
    res.sendFile(path.join(__dirname+'/public/SignUp.html'));
});

// registration button
var userNameForReg = "";
var userPasswordForReg = "";
var userEmailForReg = "";

app.post('/registration', (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    //read database
    mc.query('SELECT * FROM userTable', function (error, results, fields) {
        if (error) throw error;
        // userLogin
        var loginSuccess = false;
        var userNameExisted = false;
        var userEmail = false;

        for(var i=0; i<results.length; i++){
            var exist = false;
            for(var i=0; i<results.length; i++) {
                    if(results[i].userName == req.body.userRegName){
                        userNameExisted = true;
                    }
                    if(results[i].email == req.body.userRegEmail){
                        userEmail = true;
                    }
            }

            // input available
            if(userNameExisted == true && userEmail == true){
                res.sendFile(path.join(__dirname+'/public/SignUpBothError.html'));
            }
            if(userNameExisted == true) {
                res.sendFile(path.join(__dirname+'/public/SignUpUserNameError.html'));
            }
            if(userEmail == true){
                res.sendFile(path.join(__dirname+'/public/SignUpUserEmailError.html'));
            }
            if (userNameExisted == false && userEmail == false){
                var nodemailer = require('nodemailer');

                // sd email
                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: '3100echoproject@gmail.com',
                        pass: '3100project'
                    }
                });

                var mailOptions = {
                    from: '3100echoproject@gmail.com',
                    to: req.body.userRegEmail,
                    subject: 'Verification code from ECHO',
                    text: 'Hi ' + req.body.userRegName + ',\n' +
                        '\n' +
                        'We just need to verify your email address before you can access ECHO.\n' +
                        '\n' +
                        'Enter the code,\n' + verifyCode +
                        '\n\n' +
                        'Thanks! – The ECHO team\n'
                };

                transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response + " " + verifyCode);

                    }
                });
                res.sendFile(path.join(__dirname+'/public/verifyCode.html'));

                //store data for /verify
                userNameForReg = req.body.userRegName;
                userPasswordForReg = req.body.userRegPassword;
                userEmailForReg = req.body.userRegEmail;
            }
        }
    });
});

app.post('/verify', (req, res) => {
    if(req.body.userVerifyCode == verifyCode){
        // insert data to mysqlDB
        var  addSql = 'INSERT INTO userTable (userName, password, email, loyaltyPoint, userType) VALUES (?, ?, ?,0,0);';
        var  addSqlParams = [userNameForReg, userPasswordForReg,userEmailForReg];

        mc.query(addSql, addSqlParams, function (err, result) {
            if (err) throw err;
            console.log("1 record inserted");
        });

        res.sendFile(path.join(__dirname+'/public/AfterSubmission.html'));
    }
});

app.post('/reject', (req, res) => {
    res.sendFile(path.join(__dirname+'/public/fileProcessed.html'));
});

app.post('/approve', (req, res) => {
    // get userLoyaltyPoint
    var userLoyaltyPoint;
    var updatePointInt;
    var updatePointChar;

    //update mysql data
    var  Sql = "SELECT * FROM userTable WHERE email = '1155137893@link.cuhk.edu.hk'";
    mc.query(Sql,function (err, result) {
        if (err) throw err;
        userLoyaltyPoint = result[0].loyaltyPoint;
        updatePointInt = parseInt(req.body.userLoyaltyPoint) + parseInt(userLoyaltyPoint);
        updatePointChar = updatePointInt.toString();
        console.log("first " + updatePointChar);

        var  addSql = "UPDATE userTable SET loyaltyPoint = ? WHERE email = '1155137893@link.cuhk.edu.hk'";
        var  addSqlParams = [updatePointChar];

        mc.query(addSql, addSqlParams,function (err, result) {
            if (err) throw err;
            console.log("1 record updated");
        });
    });
    res.sendFile(path.join(__dirname+'/public/adminPageNoFile.html'));
});

app.post('/post', (req, res) => {
    res.sendFile(path.join(__dirname+'/public/MainpageLocked.html'));
});

app.post('/profile', (req, res) => {
    res.send("userName:" + gUserName + "   ||   userEmail:" + gUserEmail + "   ||    LoyPoint:" + gLoyPoint);
});

app.post('/NewPost', (req, res) => {
    res.sendFile(path.join(__dirname+'/public/NewPost.html'));
});

app.post('/edit', (req, res) => {
    res.sendFile(path.join(__dirname+'/public/Edit.html'));
});

app.post('/changeNP', (req, res) => {
    // check sameName
    var Sql = 'SELECT * FROM userTable';
    var userNameCheck = false;

    mc.query(Sql,function (err, results) {
        if (err) throw err;
        for(var i=0; i<results.length; i++){
            if(results[i].userName == req.body.UserNameEdit){
                userNameCheck = true;
            }
        }

        console.log(userNameCheck);
        if(userNameCheck == false){
            var  addSql = "UPDATE userTable SET userName = ? WHERE email = ?";
            var  addSqlParams = [req.body.UserNameEdit,gUserEmail];

            mc.query(addSql, addSqlParams,function (err, result) {
                if (err) throw err;
                console.log("1 record updated");
            });

            addSql = "UPDATE userTable SET password = ? WHERE email = ?";
            addSqlParams = [req.body.pwEdit, gUserEmail];

            mc.query(addSql, addSqlParams,function (err, result) {
                if (err) throw err;
                console.log("2 record updated");
            });
            res.sendFile(path.join(__dirname+'/public/submission.html'));
        } else {
            res.sendFile(path.join(__dirname+'/public/EditError.html'));
        }
    });
});

app.post('/buy', (req, res) => {
    if(gLoyPoint >= 10){
        var Sql = "SELECT * FROM userTable WHERE email = ?";
        var target = [gUserEmail];

        mc.query(Sql,target,function (err, result) {
            if (err) throw err;
            userLoyaltyPoint = result[0].loyaltyPoint;
            updatePointInt = parseInt(userLoyaltyPoint) - 10;
            gLoyPoint = gLoyPoint - 10;
            updatePointChar = updatePointInt.toString();
            console.log("New" + updatePointChar);
            console.log("1 record updated");

            var  addSql = "UPDATE userTable SET loyaltyPoint = ? WHERE email = ?";
            var  addSqlParams = [updatePointChar,gUserEmail];

            mc.query(addSql, addSqlParams,function (err, result) {
                if (err) throw err;
                console.log("1 record updated");
            });

            });
        res.sendFile(path.join(__dirname+'/public/MainpageUnlocked.html'));
    } else {
        res.sendFile(path.join(__dirname+'/public/MainpageNoPoint.html'));
    }
});

app.post('/LogOut', (req, res) => {
    res.sendFile(path.join(__dirname+'/public/LogOut.html'));
});

app.post('/newFile', (req, res) => {
    // insert data to mysqlDB
    var  addSql = 'INSERT INTO fileTable (fileTopic, emailAuthor, description, message) VALUES (?, ?, ?, ?);';
    var  addSqlParams = [req.body.topic, gUserEmail, req.body.description, req.body.message];

    mc.query(addSql, addSqlParams, function (err, result) {
        if (err) throw err;
        console.log("1 record inserted");
    });

    res.sendFile(path.join(__dirname+'/public/MainPageWithNewPost.html'));
});

app.listen(3000, function() {
    console.log('ECHO listening on port 3000!');
});
