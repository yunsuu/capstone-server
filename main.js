const express = require('express')
const request = require('request');
const convert = require('xml-js');
const bodyParser = require('body-parser');
const geolib = require('geolib');
const fs = require('fs');
const app = express()
const port = 3000

// ows api 만드는 방법
// 각 질문마다 배점 및 채점기준 임의로 설정
// 들어온 질문 예시마다 채점 후
// return 은 총점 100점 만점으로  return 해주기

// caps는 이거쓰자
// http://apis.data.go.kr/B552657/ErmctInfoInqireService/getEgytListInfoInqire?serviceKey=WzaM%2FMuPotmXrd0Or5PUVwI26EkhhorcTdzDdC%2Bm1vtS7aLHUlvcgyyetX50aUP9fL9mYwEJ2MuXBZ1ScHqq9A%3D%3D&

app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const getRandomInt = (min, max) => { //min ~ max 사이의 임의의 정수 반환
    return Math.floor(Math.random() * (max - min)) + min;
}


app.get('/', (req, res) => {
    // let { userLng, userLat, radius, dgsbjtCd } = req.query;
    // console.log(typeof userLng, userLat, radius, dgsbjtCd)
    // console.log(userLat === undefined)
    // console.log(geolib.isPointWithinRadius(
    //     { latitude: 51.525, longitude: 7.4575 },
    //     { latitude: 121.5175, longitude: 7.4678 },
    //     '5000'
    // ))
    res.send("hello")
})

app.get('/ows/covid-hospital', (req, res) => {
    res.send({
            "adtfrdd": 20200228,
            "hosptytpcd": "B",
            "sggunm": "강남구",
            "sidonm": "서울",
            "spcladmtycd": "A0",
            "telno": "02-2019-3114",
            "yadmnm": "연세대학교의과대학 강남세브란스병원"
        })
})


app.get('/caps/hospital', (req, res) => {
    //3번 데이터 씀
    // 파라미터로 잘 돌아가도록 하기 ,git book 쓰기
    let { user_lng, user_lat, radius, dgsbjtCd } = req.query;

    if (user_lat === undefined) user_lat = '37.492445'
    if (user_lng === undefined) user_lng = '127.063120'
    if (radius === undefined) radius = '5000'

    // const user_lat = '37.492445' //위도
    // const user_lng = '127.063120' //경도
    // const radius = 5000
    // const dgsbjtCd = '01'

    const apiKey = 'WzaM%2FMuPotmXrd0Or5PUVwI26EkhhorcTdzDdC%2Bm1vtS7aLHUlvcgyyetX50aUP9fL9mYwEJ2MuXBZ1ScHqq9A%3D%3D'
    const defualtUrl = `http://apis.data.go.kr/B552657/ErmctInfoInqireService/getEgytListInfoInqire`
    const url = `${defualtUrl}?serviceKey=${apiKey}&pageNo=1&numOfRows=500`
    console.log(url)
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

app.get('/caps/chatting', (req, res) => {
    // const text = req.body.text;
    let { text } = req.query;
    console.log(text)
    // console.log(req.body, req.body.text)
    const random = getRandomInt(0, 4) //0~3까지 나옴
    const chatArr = ["피자먹고 싶다.", "치킨먹고 싶다.", "안녕하세요", "롤하고 싶다."]
    res.json({
        resText : chatArr[random],
        reqText : text,
    })
});


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
    let {name, id, pwd, address, gender, birth } = req.query;
    console.log({name, id, pwd, address, gender, birth })
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
                    user: {name, id, pwd, address, gender, birth }
                })
            }); // write it back
        }});
})

//예시 url
//http://52.78.126.183:3000/ows/survey?as1=4&as2=1&as3=1&as4=2&as5=3&as6=1&as7=2&as8=1&as9=1&as10=1
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
    //병원 코드 추가하고 gitbook

    // let { as1 } = req.query;

    // const lat = '37.492445' //위도
    // const lng = '127.063120' //경도
    // const radius = '200' //반경

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
                console.log(url)
                res.send({
                    performance: true,
                    result:resultJson
                })
            }
        }
    })
})


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
