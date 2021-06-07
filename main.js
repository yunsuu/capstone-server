const express = require('express')
const request = require('request');
const convert = require('xml-js');
const bodyParser = require('body-parser');
const geolib = require('geolib');
const fs = require('fs');
const mysql = require('mysql');
const dialogflow = require('@google-cloud/dialogflow');
const app = express()
const port = 3000

const db_info = {
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: 'ljsql934',
    database: 'ows',
  };
  
  const dbConnect = mysql.createConnection(db_info);
  
  dbConnect.connect();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));



//오픈소스 라우터
app.get('/ows/survey', (req, res) => {
    let { as1, as2, as3, as4, as5, as6, as7, as8, as9, as10 } = req.query;
    const as1Arr = [10,5,0,0,8,10]
    const as5Arr = [10, 7, 0]
    const yesOrNoArr = [10, 0]
    let score = 0
    if(as1 !== undefined) score += as1Arr[parseInt(as1)-1]
    if(as2 !== undefined) score += yesOrNoArr[parseInt(as2)-1]
    if(as3 !== undefined) score += yesOrNoArr[parseInt(as3)-1]
    if(as4 !== undefined) score += yesOrNoArr[parseInt(as4)-1]
    if(as5 !== undefined) score += as5Arr[parseInt(as5)-1]
    if(as6 !== undefined) score += yesOrNoArr[parseInt(as6)-1]
    if(as7 !== undefined) score += yesOrNoArr[parseInt(as7)-1]
    if(as8 !== undefined) score += yesOrNoArr[parseInt(as8)-1]
    if(as9 !== undefined) score += yesOrNoArr[parseInt(as9)-1]
    if(as10 !== undefined) score += yesOrNoArr[parseInt(as10)-1]
    console.log(score)
    res.json({
        performance:true,
        score: score,
    })
})

app.get('/ows/hospital', (req, res) => {

    let { lat, lng, radius, dgsbjtCd } = req.query;

    if (lat === undefined) lat = '37.492445'
    if (lng === undefined) lng = '127.063120'
    if (radius === undefined) radius = '300'
    if (dgsbjtCd === undefined) dgsbjtCd = ''
    else dgsbjtCd = `&dgsbjtCd=${dgsbjtCd}`

    const apiKey = 'sj%2BWTC5BgpdCGFnbM3m%2FZgFNLlJpv5tn88rFwi1pO4nJRkNELOdE1Hb1bYqEvPSUsEgsZRhMhixUjeJ6uD2BWw%3D%3D'
    const defualtPath = 'http://apis.data.go.kr/B551182/hospInfoService/getHospBasisList'
    const url = `${defualtPath}?serviceKey=${apiKey}&pageNo=1&numOfRows=999999&sidoCd=110000&xPos=${lng}&yPos=${lat}&radius=${radius}${dgsbjtCd}`
    request.get(url, (err, response, body)=> {
        if (err) {
            console.log(`err => ${err}`)
        } else {
            if (response.statusCode == 200) {
                const result = body
                let xmlToJson = convert.xml2json(result, {compact: true, spaces: 4});
                xmlToJson = JSON.parse(xmlToJson)
                let resultJson = xmlToJson.response.body.items.item
                // console.log(resultJson)
                // console.log(url)
                res.send({
                    performance: true,
                    result:resultJson
                })
            }
        }
    })
})

app.get('/ows/covid-hospital', (req, res) => {

    let { user_lng, user_lat, radius, dgsbjtCd } = req.query;

    if (user_lat === undefined) user_lat = '37.492445'
    if (user_lng === undefined) user_lng = '127.063120'
    if (radius === undefined) radius = '5000'

    const apiKey = 'WzaM%2FMuPotmXsdfrd0Or5PUVwI26EkhhorcTdzDdC%2Bm1vtS7aLHUlvcgyyetX50aUP9fL9mYwEJ2MuXBZ1ScHqq9A%3D%3D'
    const defualtUrl = `http://apis.data.go.kr/B552657/ErmctInfoInqireService/getEgytListInfoInqire`
    const url = `${defualtUrl}?serviceKey=${apiKey}&pageNo=1&numOfRows=500`
    // console.log(url)
    request.get(url, (err, response, body)=> {
        if (err) {console.log(`err => ${err}`)}
        if (response.statusCode == 200) {
            let xmlToJson = convert.xml2json(body, {compact: true, spaces: 4});
            xmlToJson = JSON.parse(xmlToJson)
            let apiJson = xmlToJson.response.body.items.item
            // console.log(apiJson)
            const result = []
            for(let i = 0 ; i<apiJson.length; i++){
                const _lat =apiJson[i].wgs84Lat._text
                const _lng = apiJson[i].wgs84Lon._text
                const isInRadius = geolib.isPointWithinRadius(
                    { latitude: user_lat, longitude: user_lng },
                    { latitude: _lat, longitude: _lng },
                    radius
                );
                if(isInRadius){
                    result.push(apiJson[i])
                }
            }
            res.send({
                performance: true,
                result:result
            })
        }
    })
})


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
