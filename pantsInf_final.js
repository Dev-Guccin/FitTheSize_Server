const express = require('express');
const request = require('request')
//connst mysql = require('sync-mysql');
const mysql = require('mysql');

//let dbconfig = require('./db.js')
//let connection = new mysql(dbconfig)

const connection = mysql.createConnection({
	user : "root",
	password : "prj2020",
	host:"127.0.0.1",
	database : "fit",
	port:"3306"
});

connection.connect()
const app = express();

app.get('/:part/:size/:order/:sex', (req, res) => {
	var part = req.params.part
	var size = parseFloat(req.params.size)
	var order = req.params.order
	var sex = req.params.sex

	if (String(order)=='price'){
		var sql = 'SELECT * FROM pants WHERE sex = "'+String(sex)+'" AND id IN (SELECT DISTINCT id FROM pants_size WHERE ' + String(part) + ' BETWEEN ' + String(size - 1) + ' AND ' + String(size + 1) + ') order by '+ String(order)
	}
	else{
		var sql = 'SELECT * FROM pants WHERE sex = "'+String(sex)+'" AND id IN (SELECT DISTINCT id FROM pants_size WHERE ' + String(part) + ' BETWEEN ' + String(size - 1) + ' AND ' + String(size + 1) + ') order by '+ String(order)+' DESC'
	}

	connection.query(sql, (err, result) => {
		if (err) {
			console.log(err)
		}

		console.log('mobile server send : ', result)

		res.json(result)
	})
})

app.get('/mysize/:length/:waist/:thigh/:rise/:hem/:order/:sex', (req, ress) => {
	var length = parseFloat(req.params.length)
	var waist = parseFloat(req.params.waist)
	var thigh = parseFloat(req.params.thigh)
	var rise = parseFloat(req.params.rise)
	var hem = parseFloat(req.params.hem)

	var order = req.params.order
	var sex = req.params.sex

	const options = {
		url: 'http://localhost:8000/search/',
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
		console.log('AI sever send to mobile server : ',body)
		console.log('order  : ',order)
		if (String(order)=='price'){
			var sql = 'SELECT * FROM pants WHERE sex = "'+String(sex)+'" AND id in (SELECT DISTINCT id FROM pants_size where model_group='+String(body)+')' + ' order by '+ String(order)
		}
		else{
			var sql = 'SELECT * FROM pants WHERE sex = "'+String(sex)+'" AND id in (SELECT DISTINCT id FROM pants_size where model_group='+String(body)+')' + ' order by '+ String(order)+' DESC'
		}

		connection.query(sql, (err, result) => {
			if (err) {
				console.log(err)
			}
			ress.json(result)
		})
	});
})


const PORT = 80
app.listen(PORT, () => {
	console.log('Mobile server is running on port' + PORT)
})
