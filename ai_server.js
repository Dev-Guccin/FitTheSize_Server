const express = require('express');
const app = express();
app.use(express.json())

app.post('/', function(req,res){
    console.log('AI server received : ',req.body)
    res.send('3')
})

const PORT = 3001
app.listen(PORT, () => {
    console.log('AI server is running on port' + PORT)
})