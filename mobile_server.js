const express = require('express');
const request = require('request')
const mysql = require('sync-mysql');
//const mysql = require('mysql');

let dbconfig = require('./db.js')
let connection = new mysql(dbconfig)
//let connection = mysql.createConnection(dbconfig)

/*
const connection = mysql.createConnection({
    user : "root",
    password : "비밀번호",
    host:"127.0.0.1",
    database : "fit",
    port:"3306"
});*/

//connection.connect()
const app = express();

// server/바지부위/길이/정렬방식/성별 로 요청이 왔을 때 해당되는 바지 응답
app.get('/:val/:centi/:order/:sex', (req, res) => {
    var part = req.params.val
    var size = parseFloat(req.params.centi)
    var order = req.params.order
    var sex = req.params.sex

    var sort_method;
    console.log('mobile server send : ' + part + ' ' + size + ' ' + sex);

    if(order == "sales" || order == "popular")
      sort_method = "DESC";
    else
      sort_method = "ASC";

    var result = connection.query('SELECT * FROM pants WHERE id in (SELECT DISTINCT id FROM pants_size WHERE ' + String(part) + ' BETWEEN ' + String(size - 1) + ' AND ' + String(size + 1)
              + ') and sex = "'+sex+'" order by '+String(order)+' '+sort_method);
    res.json(result)
})

// server/mysize/총장/허리/허벅지/밑위/밑단/정렬방식/성별 요청 왔을 때 AI 서버로 POST 후 그 응답을 다시 모바일로 응답
// 아직은 임시로 /mysize/바지부위/길이/정렬방식/성별
app.get('/mysize/:val/:centi/:order/:sex', (req, ress) => {
    var part = req.params.val
    var size = parseFloat(req.params.centi)
    var order = req.params.order;
    var sex = req.params.sex;

    var sort_method;
    if(order == "sales" || order == "popular")
      sort_method = "DESC";
    else
      sort_method = "ASC";

    console.log('AI : ' + part + ' ' + size + ' ' + sex);

    //var sql = 'SELECT DISTINCT id FROM pants_size WHERE ' + String(part) + ' BETWEEN ' + String(size - 1) + ' AND ' + String(size + 1)
    let result = connection.query(
    'SELECT * FROM pants_size WHERE ' + String(part) + ' BETWEEN ' + String(size - 1) + ' AND ' + String(size + 1)
    + ' limit 1');

    const options = {
        url: 'http://54.209.118.235:8081',
        json: true,
        body:{
          "length": result[0].length,
          "waist": result[0].waist,
          "thigh": result[0].thigh,
          "rise": result[0].rise,
          "hem": result[0].hem
        }
    };
// app.get('/mysize/:length/:waist/:thigh/:rise/:hem/:order/:sex', (req, ress) => {
//     var length = parseFloat(req.params.length)
//     var waist = parseFloat(req.params.waist)
//     var thigh = parseFloat(req.params.thigh)
//     var rise = parseFloat(req.params.rise)
//     var hem = parseFloat(req.params.hem)
//
//     var order = req.params.order
//     var sex = req.params.sex
//
//     const options = {
//         url: 'http://localhost:3001',
//         json: true,
//         body: {
//             "length": length,
//             "waist": waist,
//             "thigh": thigh,
//             "rise": rise,
//             "hem": hem
//         }
//     };

    request.post(options, (err, res, body) => {
        if (err) {
            return console.log(err);
        }
        //console.log(`Status: ${res.statusCode}`);
        //console.log('mobile server send to AI server : ',options.body);

        var result = connection.query('SELECT * FROM pants WHERE id in (SELECT DISTINCT id FROM pants_size where model_group='+String(body)+')'
                  +'and sex = "'+sex+'" order by '+ String(order)+' '+sort_method);

        ress.json(result)
    });
})

const PORT = 80
app.listen(PORT, () => {
    console.log('Mobile server is running on port' + PORT)
})
