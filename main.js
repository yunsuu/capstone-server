const express = require('express')
const request = require('request');
const convert = require('xml-js');
const bodyParser = require('body-parser');
const geolib = require('geolib');
const fs = require('fs');
const seedRand = require('random-seed');
const dialogflow = require('@google-cloud/dialogflow');
const app = express()
const port = 3000

// ows api 만드는 방법
// 각 질문마다 배점 및 채점기준 임의로 설정
// 들어온 질문 예시마다 채점 후
// return 은 총점 100점 만점으로  return 해주기

// caps는 이거쓰자
// http://apis.data.go.kr/B552657/ErmctInfoInqireService/getEgytListInfoInqire?serviceKey=WzaM%2FMuPotmXrd0Or5PUVwI26EkhhorcTdzDdC%2Bm1vtS7aLHUlvcgyyetX50aUP9fL9mYwEJ2MuXBZ1ScHqq9A%3D%3D&

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


const getRandomInt = (min, max) => { //min ~ max 사이의 임의의 정수 반환
    return Math.floor(Math.random() * (max - min)) + min;
}


app.get('/', (req, res) => {
    //얼마나 빠르게 응급실에서 대응을 받을 수 있는지
    //중증일때 얼마나 의료절차가 원활히 이루어 질 수 있을지
    fs.readFile('caps-senario/user1.json', 'utf8', function readFileCallback(err, data){
        if (err){
            console.log(err);
        } else {
            obj = JSON.parse(data);
            obj.hospital = ['앙']
            // console.log(obj)
        }});
    res.send("hello")
})

app.get('/caps/my-page-array', (req, res) => {
    //3번 데이터 씀
    // 파라미터로 잘 돌아가도록 하기 ,git book 쓰기
    let { user_lng, user_lat, radius } = req.query;

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
                    const now = new Date();	// 현재 날짜 및 시간
                    const hours = now.getHours();	// 시간
                    const hospitalName = apiJson[i].dutyName._text

                    const randGen1 = seedRand.create(`${hours}${hospitalName}`) //병원 총 정원
                    const randNum1 = randGen1(8) + 25
                    const randNum2 = randGen1(randNum1 - 5) + 5
                    console.log(randNum1, randNum2)
                    // apiJson[i].emgLimit = {_text: `${randNum1}`} //병원 정원 추가
                    apiJson[i].emgCurrent = {_text: `${randNum2}`} // 병원 현재인원 추가
                    if(randNum2/randNum1 > 0.55) apiJson[i].emgCongestion = {_text: `Y`}
                    else apiJson[i].emgCongestion = {_text: `N`}
                    result.push(apiJson[i])
                }
            }
            //json 정렬 후 return
            //응급실 여석 기준
            result.sort(function(a,b) {
                return parseInt(a.emgCurrent._text) - parseInt(b.emgCurrent._text);
            });

            fs.readFile(`caps-senario/array.json`, 'utf8', function readFileCallback(err, data){
                if (err){
                    console.log(err);
                } else {
                    obj = JSON.parse(data);
                    obj[0].hospital = result
                    obj[1].hospital = result
                    obj[2].hospital = result
                    res.send({
                        performance: true,
                        result: obj
                    })
                }
            });
        }
    })
})

app.get('/caps/my-page', (req, res) => {
    //3번 데이터 씀
    // 파라미터로 잘 돌아가도록 하기 ,git book 쓰기
    let { user_lng, user_lat, radius, scenario } = req.query;

    if (user_lat === undefined) user_lat = '37.492445'
    if (user_lng === undefined) user_lng = '127.063120'
    if (radius === undefined) radius = '5000'
    if ( !(scenario === '1' || scenario === '2'  || scenario === '3') ) scenario = '1'

    // const user_lat = '37.492445' //위도
    // const user_lng = '127.063120' //경도
    // const radius = 5000
    // const dgsbjtCd = '01'

    const apiKey = 'WzaM%2FMuPotmXrd0Or5PUVwI26EkhhorcTdzDdC%2Bm1vtS7aLHUlvcgyyetX50aUP9fL9mYwEJ2MuXBZ1ScHqq9A%3D%3D'
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
                    const now = new Date();	// 현재 날짜 및 시간
                    const hours = now.getHours();	// 시간
                    const hospitalName = apiJson[i].dutyName._text

                    const randGen1 = seedRand.create(`${hours}${hospitalName}`) //병원 총 정원
                    const randNum1 = randGen1(8) + 25
                    const randNum2 = randGen1(randNum1 - 5) + 5
                    console.log(randNum1, randNum2)
                    // apiJson[i].emgLimit = {_text: `${randNum1}`} //병원 정원 추가
                    apiJson[i].emgCurrent = {_text: `${randNum2}`} // 병원 현재인원 추가
                    if(randNum2/randNum1 > 0.55) apiJson[i].emgCongestion = {_text: `Y`}
                    else apiJson[i].emgCongestion = {_text: `N`}
                    result.push(apiJson[i])
                }
            }
            //json 정렬 후 return
            //응급실 여석 기준
            result.sort(function(a,b) {
                return parseInt(a.emgCurrent._text) - parseInt(b.emgCurrent._text);
            });
            fs.readFile(`caps-senario/user${scenario}.json`, 'utf8', function readFileCallback(err, data){
                if (err){
                    console.log(err);
                } else {
                    obj = JSON.parse(data);
                    obj.hospital = result
                    res.send({
                        performance: true,
                        result: obj
                    })
                }
            });
        }
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
                    const now = new Date();	// 현재 날짜 및 시간
                    const hours = now.getHours();	// 시간
                    const hospitalName = apiJson[i].dutyName._text

                    const randGen1 = seedRand.create(`${hours}${hospitalName}`) //병원 총 정원
                    const randNum1 = randGen1(8) + 25
                    const randNum2 = randGen1(randNum1 - 5) + 5
                    console.log(randNum1, randNum2)
                    // apiJson[i].emgLimit = {_text: `${randNum1}`} //병원 정원 추가
                    apiJson[i].emgCurrent = {_text: `${randNum2}`} // 병원 현재인원 추가
                    if(randNum2/randNum1 > 0.55) apiJson[i].emgCongestion = {_text: `Y`}
                    else apiJson[i].emgCongestion = {_text: `N`}
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

app.get('/caps/chatting', async (req, res) => {
    let { text, session } = req.query;
    if(session === undefined) session = 'yunsuu'
    if(text === undefined) text = '안녕'
    const projectId = 'emergency-voice-pqkk'
    const inputText = text
    const sessionId = session
    
    const sessionClient = new dialogflow.SessionsClient({
        keyFilename:
            'emergency-voice-pqkk-cbcd5db76d30.json',
    });
    const sessionPath = sessionClient.projectAgentSessionPath(
        projectId,
        sessionId
    );

    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: inputText,
                languageCode: 'kr-KR',
            },
        },
    };

    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;
    res.json({
        resText : result.fulfillmentText,
        reqText : result.queryText,
    })
});

app.get('/caps/get-survey', (req, res) => {
    let {user } = req.query;
    // console.log(user)
    fs.readFile('caps-survey.json', 'utf8', function readFileCallback(err, data){
        if (err){
            console.log(err);
        } else {
            obj = JSON.parse(data);
            for(let i=0; i<obj.length; i++){
                if(obj[i].user === user){
                    return res.json({
                        performance:true,
                        message:"설문 찾기 성공!",
                        data: obj[i]
                    })
                }
            }
            return res.json({
                performance:false,
                message:"설문 찾기 실패",
            })
        }});
})

app.get('/caps/write-survey', (req, res) => {
    let {user, smoking, drink, excrcise, medicalHistory, familyHistory } = req.query;
    fs.readFile('caps-survey.json', 'utf8', function readFileCallback(err, data){
        if (err){
            console.log(err);
        } else {
            obj = JSON.parse(data);
            const inputData = {user, smoking, drink, excrcise, medicalHistory, familyHistory }
            // console.log(obj)
            obj.unshift(inputData); //add some data
            json = JSON.stringify(obj); //convert it back to json
            fs.writeFile('caps-survey.json', json, 'utf8', ()=>{
                res.json({
                    performance:true,
                    message:"설문 성공!",
                    data: inputData
                })
            }); // write it back
        }});
})

app.get('/caps/login', (req, res) => {
    let { id, pwd } = req.query;
    // console.log({ id, pwd })
    fs.readFile('user.json', 'utf8', function readFileCallback(err, data){
        if (err){
            console.log(err);
        } else {
            obj = JSON.parse(data); //now it an object            console.log(json)
            for(let i = 0; i<obj.length; i++){
                // console.log(obj[i])
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
    // console.log({name, id, pwd, address, gender, birth })
    fs.readFile('user.json', 'utf8', function readFileCallback(err, data){
        if (err){
            console.log(err);
        } else {
            obj = JSON.parse(data);
            for(let i = 0; i<obj.length; i++){
                // console.log(obj[i])
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
    res.send([{
        "adtfrdd": 20200304,
        "hosptytpcd": "A",
        "sggunm": "광진구",
        "sidonm": "서울",
        "spcladmtycd": "A0",
        "telno": "02-2049-9036",
        "yadmnm": "혜민병원",
        "lat" : "37.5353418",
        "lng" : "127.0813546",
        "addr" : "서울특별시 광진구 자양동 627-3"
    },
        {
            "adtfrdd": 20200309,
            "hosptytpcd": "B",
            "sggunm": "광진구",
            "sidonm": "서울",
            "spcladmtycd": "A0",
            "telno": "02-1588-1533",
            "yadmnm": "건국대학교병원",
            "lat" : "37.5410304",
            "lng" : "127.0720742",
            "addr" : "서울특별시 광진구 화양동 4-12"
        }])
})


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
