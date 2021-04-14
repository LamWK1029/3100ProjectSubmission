// JavaScript source code
const express = require('express');
const http = require('http');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const fs = require("fs");
const multer  = require('multer');
const app = express();
var server = http.createServer(app);
 
//將request進來的 data 轉成 json()
app.use(bodyParser.urlencoded({ extended: true}))
app.use(bodyParser.json())

var connection = mysql.createConnection({
	host:"localhost",
	user:"root",
	password:"password",
	database:"test_db",
	port:"3306",
    multipleStatments:true
})

connection.connect((err) => {
	if(err){
		throw err
	}else{
		console.log("connected")
	}
})

app.get("/", function(req, res) {
    res.sendfile(__dirname + '/NewPost.html', function(err) {
        if (err) res.send(404);
    }); 
});


//connection.query('create table tabletest(id INT(255) UNSIGNED AUTO_INCREMENT PRIMARY KEY, thing VARCHAR(255) NOT NULL,filename VARCHAR(255) UNIQUE))',(err,rows) => {
//	if(err){
//		throw err
//	}else{
//		console.log("DATA SENT")
//		console.log(rows)
//	}	
//})

//connection.query('insert into tabletest (id,thing) values (DEFAULT,"test2")',(err,rows) => {
//	if(err){
//		throw err
//	}else{
//		console.log("DATA SENT")
//		console.log(rows)
//	}	
//})

app.get('/show', function (req, res) {
    // 是為了修復 CORS 的問題而設
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    
    connection.query('SELECT * FROM tabletest', function (error, results, fields) {
        if (error) throw error;
        return res.send({ error: false, data: results, message: 'all list.' });
    });
});

//
app.set('view engine', 'ejs');
 app.get('/trytry', function(req, res) {  
 var obj = {};
 connection.query('SELECT * FROM tabletest', function (error, results, fields) {
        if (error) {throw error;}else{
        results = JSON.stringify(results);//把results对象转为字符串，去掉RowDataPacket
  console.log(results);//'[{"count":"1","type":"RangeError"},{"count":"3","type":"ReferenceError"}]'
  results = JSON.parse(results);//把results字符串转为json对象
        obj={data: results};
       console.log(obj);
        res.render('default', obj);
        }        
    }); 
 });  

 app.get('/test3/:name', function (req, res) {
res.download(req.params.name);
})

app.get('/show/:id', function (req, res) {
    // by id
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    console.log('ID:', req.params.id);
    connection.query('SELECT * FROM tabletest WHERE testid = ?',req.params.id, function (error, results, fields) {
        if (error) throw error;
        return res.send({data:results});
    }); 
        
        
});

// 新增

app.post('/add', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    var addtData = req.body
    console.log(req.body)


    //  ? 會讀取後面的 addData
    connection.query('INSERT INTO tabletest SET ?', addData, function (error, results, fields) {
        if (error) throw error;
        return console.log({ error: false, data: results, message: 'id insert.' });
    });
});

//two input
app.get('/test', function (req, res) {
   res.sendFile( __dirname + "/" + "HTMLPage1.html" );
})
var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.post('/process_post', urlencodedParser, function (req, res) {
 
   // 输出 JSON 格式
   var response = {
       "testid":req.body.testid,
       "thing":req.body.thing
   };

   console.log(response);

   connection.query('INSERT INTO tabletest SET ?', response, function (error, results, fields) {
        if (error) throw error;
        return console.log({ error: false, data: response, message: 'id insert.' });
    });

   res.end(JSON.stringify(response));
})
//file upload
app.use(multer({ dest: '/tmp/'}).array('image'));
 
app.get('/test2', function (req, res) {
   res.sendFile( __dirname + "/" + "HTMLPage2.html" );
})
 
app.post('/file_upload', urlencodedParser, function (req, res) {
 
   console.log(req.files[0]);  // 上传的文件信息
 
   var des_file = __dirname + "/" + req.files[0].originalname;
   fs.readFile( req.files[0].path, function (err, data) {
        fs.writeFile(des_file, data, function (err) {
         if( err ){
              console.log( err );
         }else{
               response = {
                   message:'File uploaded successfully',
                   "testid":req.body.testid,
                   "filename":req.files[0].originalname
              };
          }
    connection.query('UPDATE tabletest SET filename = ? WHERE testid = ?', [response.filename, response.testid], function (error, results, fields) {
        if (error) throw error;
        return console.log({ error: false, data: results, message: 'id update.' });
    });
          console.log( response );
          res.end( JSON.stringify( response ) );
       });
   });
})

//open file
const openExplorer = require('open-file-explorer');

app.get('/test3', function (req, res) {
//$.ajax('C:\Users\User\Desktop\testfile\download.png')
res.download("download.png");
//res.send('<a href="FTP:///C:\Users\User\Desktop\testfile\download.png">Link 1</a>');
})


// 修改

app.post('/update', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    var updateData = req.body
    var updateId = req.body.testid
    console.log(req.body)


    // ? ? 會讀取陣列裡的值
    connection.query('UPDATE tabletest SET ? WHERE testid = ?', [updateData, updateId], function (error, results, fields) {
        if (error) throw error;
        return console.log({ error: false, data: results, message: 'id update.' });
    });
});



//刪除

app.post('/remove', function (req, res) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    
   var deleteId = req.body.testid
   //res.json(deleteId);
   console.log(deleteId)

  connection.query('DELETE FROM tabletest WHERE testid = ?', deleteId, function (error, results, fields) {
  if (error) throw error;
  return console.log({ error: false, data: results, message: 'id delete.' });
  });
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log("App is listening on port "+port)
