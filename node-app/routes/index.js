var express = require('express');
var router = express.Router();
const { Connection, Request } = require("tedious");

//GETアクセスの処理
router.get('/', function (req, res, next) {

//Use Azure App Service Managed Identity to connect to the SQL database

  const connection = new Connection({
    server: process.env["db_server"],
    authentication: {
      type: 'azure-active-directory-msi-app-service',
    },
    options: {
      database: process.env["db_database"],
      encrypt: true,
      port: 1433
    }
  });

  var content = [];

  // Attempt to connect and execute queries if connection goes through
  connection.on("connect", err => {
    if (err) {
      console.error(err.message);
    } else {
      queryDatabase();
    }
  });

  connection.connect();

  connection.on('end', function(){
    console.log("disconnected");
    res.render('index', { title: 'Index', content: content });
  });

  function queryDatabase() {
    console.log("Reading rows from the Table...");
  
    // Read all rows from table
    const request = new Request(
//      `SELECT * FROM [Certification]`,  //  for local env.
      `SELECT * FROM [trprivate].[certification]`,
      (err, rowCount) => {
        if (err) {
          console.error(err.message);
        } else {
          console.log(`${rowCount} row(s) returned`);
        }
      }
    );
  
    var result = {};
    request.on("row", columns => {
      columns.forEach(column => {
        if(column.value === null){
          console.log('NULL');
        }else{
          result[column.metadata.colName] = column.value;
        } 
      });
      content.push(result);
      result = {};
    });
  
    request.on('requestCompleted', function(){
      console.log('requestCompleted');
      connection.close();
    });

    connection.execSql(request);
  }

});

/*

//新規作成ページへのアクセス
router.get('/add', (req, res, next) => {
  var data = {
    title: 'Add',
    content: '新しいレコードを入力'
  }
  res.render('add', data);
});

//新規作成フォーム送信の処理
router.post('/add', (req, res, next) => {
  var data = {
    'name': req.body.name,
    'mail': req.body.mail,
    'age': req.body.age
  };

  //データベースの設定情報
  var connection = mysql.createConnection(mysql_setting);
  //データベースに接続
  connection.connect();

  //データを登録する
  connection.query('insert into mydata set ?', data, function (error, results, fields) {
    res.redirect('/');
  });
  //接続を解除
  connection.end();
});

//指定IDのレコードを表示する
router.get('/edit', (req, res, next) => {
  var id = req.query.id;
  //データベースの設定情報
  var connection = mysql.createConnection(mysql_setting);
  //データベースに接続
  connection.connect();
  //データを取り出す
  connection.query('SELECT * from mydata where id = ?', id, function (error, results, dields) {
    //データベースアクセス完了時の処理
    if (error == null) {
      var data = {
        title: 'Edit',
        content: 'id = ' + id + 'のレコードを更新します。',
        mydata: results[0]
      }
      res.render('edit', data);
    }
  });
  //接続を解除
  connection.end();
});

//編集フォーム送信の処理
router.post('/edit', (req, res, next) => {
  var id = req.body.id;
  var data = {
    'name': req.body.name,
    'mail': req.body.mail,
    'age': req.body.age
  };
  //データベースの設定情報
  var connection = mysql.createConnection(mysql_setting);
  //データベースに接続
  connection.connect();
  //データを更新する
  connection.query('update mydata set ? where id = ?', [data, id], function (error, results, fields) {
    res.redirect('/');
  });
  //接続を解除
  connection.end();
});

//指定レコードの削除
router.get('/delete', (req, res, next) => {
  var id = req.query.id;

  //データベースの設定情報
  var connection = mysql.createConnection(mysql_setting);
  //データベースに接続
  connection.connect();
  //データを取り出す
  connection.query('SELECT * from mydata where id = ?', id, function (error, results, dields) {
    //データベースアクセス完了時の処理
    if (error == null) {
      var data = {
        title: 'Delete',
        content: 'id = ' + id + 'のレコードを削除します。',
        mydata: results[0]
      }
      res.render('delete', data);
    }
  });
  //接続を解除
  connection.end();
});

//削除フォームの送信処理
router.post('/delete', (req, res, next) => {
  var id = req.body.id;

  //データベースの設定情報
  var connection = mysql.createConnection(mysql_setting);
  //データベースに接続
  connection.connect();
  //データを削除する
  connection.query('delete from mydata where id = ?', id, function (error, results, fields) {
    res.redirect('/');
  });
  //接続を解除
  connection.end();
});

*/

module.exports = router;