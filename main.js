const express = require('express')
const fs = require('fs');
const app = express()
const port = 3000

app.get('/caps/login', (req, res) => {
    let { id, pwd } = req.query;
    console.log({ id, pwd })
    fs.readFile('user.json', 'utf8', function readFileCallback(err, data){
        if (err){
            console.log(err);
        } else {
            obj = JSON.parse(data); //now it an object            console.log(json)
            for(let i = 0; i<obj.length; i++){
                console.log(obj[i])
                if (id === obj[i].id && pwd === obj[i].pwd){
                    return res.json({
                        performance:true,
                        id: id,
                        pwd: pwd
                    })
                }
            }
            return res.json({performance:false})
        }});
})

app.get('/caps/sign-up', (req, res) => {
    let { id, pwd } = req.query;
    console.log({ id, pwd })
    fs.readFile('user.json', 'utf8', function readFileCallback(err, data){
        if (err){
            console.log(err);
        } else {
            obj = JSON.parse(data);
            for(let i = 0; i<obj.length; i++){
                console.log(obj[i])
                if (id === obj[i].id){
                    return res.json({
                        performance:false,
                        message:"아이디가 중복됩니다."
                    })
                }
            }
            obj.push({"id": id, "pwd":pwd}); //add some data
            json = JSON.stringify(obj); //convert it back to json
            fs.writeFile('user.json', json, 'utf8', ()=>{
                res.json({
                    performance:true,
                    message:"회원가입 성공!",
                    user: {id: id, pwd:pwd}
                })
            }); // write it back
        }});
})

// app.get('/', async (req, res) => {
//     // const data = JSON.parse(fs.readFileSync("data.json"));
//     fs.readFile('data.json', 'utf8', function readFileCallback(err, data){
//         if (err){
//             console.log(err);
//         } else {
//             obj = JSON.parse(data); //now it an object
//             console.log(obj)
//             obj.push({id: 2, square:3}); //add some data
//             json = JSON.stringify(obj); //convert it back to json
//             console.log(json)
//             fs.writeFile('data.json', json, 'utf8', ()=>{}); // write it back
//         }});
//     res.json({name:"hello"})
// })

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
