const express = require('express');
const app = express();

const request = require('request')

const mysql = require('mysql');

const connection = mysql.createConnection({
    user : "아이디",
    password : "비밀번호",
    host:"127.0.0.1",
    database : "fit",
    port:"3306"
});

connection.connect()

// server/바지부위/길이 로 요청이 왔을 때 해당되는 바지 응답
app.get('/:val/:centi', (req, res) => {
    var part = req.params.val
    var size = parseFloat(req.params.centi)

    var sql = 'SELECT * FROM pants WHERE id in (SELECT DISTINCT id FROM pants_size WHERE ' + String(part) + ' BETWEEN ' + String(size - 1) + ' AND ' + String(size + 1) + ') order by sales desc'
    connection.query(sql, (err, result) => {
        if (err) {
            console.log(err)
        }

        console.log('mobile server send : ', result)

        res.json(result)
    })
})

// server/mysize/총장/허리/허벅지/밑위/밑단 요청 왔을 때 AI 서버로 POST 후 그 응답을 다시 모바일로 응답
app.get('/mysize/:length/:waist/:thigh/:rise/:hem', (req, ress) => {
    var length = parseFloat(req.params.length)
    var waist = parseFloat(req.params.waist)
    var thigh = parseFloat(req.params.thigh)
    var rise = parseFloat(req.params.rise)
    var hem = parseFloat(req.params.hem)

    const options = {
        url: 'http://localhost:3001',
        json: true,
        body: {
            "length": length,
            "waist": waist,
            "thigh": thigh,
            "rise": rise,
            "hem": hem
        }
    };

    request.post(options, (err, res, body) => {
        if (err) {
            return console.log(err);
        }
        console.log(`Status: ${res.statusCode}`);
        console.log('mobile server send to AI server : ',options.body);
        ress.send(body)
    });

})


const PORT = 3000
app.listen(PORT, () => {
    console.log('Mobile server is running on port' + PORT)
})

