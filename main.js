const express = require('express');
const request = require('request');
const convert = require('xml-js');
const fs = require('fs');
const app = express();
const port = 3000;

// ows api 만드는 방법
// 각 질문마다 배점 및 채점기준 임의로 설정
// 들어온 질문 예시마다 채점 후
// return 은 총점 100점 만점으로  return 해주기

app.get('/caps/hospital', (req, res) => {
  const requestUrl = `http://apis.data.go.kr/B552657/ErmctInfoInqireService/getEmrrmRltmUsefulSckbdInfoInqire?serviceKey=WzaM%2FMuPotmXrd0Or5PUVwI26EkhhorcTdzDdC%2Bm1vtS7aLHUlvcgyyetX50aUP9fL9mYwEJ2MuXBZ1ScHqq9A%3D%3D&STAGE1=%EC%84%9C%EC%9A%B8%ED%8A%B9%EB%B3%84%EC%8B%9C&STAGE2=%EA%B0%95%EB%82%A8%EA%B5%AC&pageNo=1&numOfRows=10`;
  request.get(requestUrl, (err, response, body) => {
    if (err) {
      console.log(`err => ${err}`);
    } else {
      if (response.statusCode == 200) {
        const result = body;
        // console.log(`body data => ${result}`)
        const xmlToJson = convert.xml2json(result, {
          compact: true,
          spaces: 4,
        });
        console.log(`xml to json => ${xmlToJson}`);
        res.send(xmlToJson);
      }
    }
  });
});

// ows api 만드는 방법
// 각 질문마다 배점 및 채점기준 임의로 설정
// 들어온 질문 예시마다 채점 후
// return 은 총점 100점 만점으로  return 해주기

app.get('/caps/hospital', (req, res) => {
  const requestUrl = `http://apis.data.go.kr/B552657/ErmctInfoInqireService/getEmrrmRltmUsefulSckbdInfoInqire?serviceKey=WzaM%2FMuPotmXrd0Or5PUVwI26EkhhorcTdzDdC%2Bm1vtS7aLHUlvcgyyetX50aUP9fL9mYwEJ2MuXBZ1ScHqq9A%3D%3D&STAGE1=%EC%84%9C%EC%9A%B8%ED%8A%B9%EB%B3%84%EC%8B%9C&STAGE2=%EA%B0%95%EB%82%A8%EA%B5%AC&pageNo=1&numOfRows=10`;
  request.get(requestUrl, (err, response, body) => {
    if (err) {
      console.log(`err => ${err}`);
    } else {
      if (response.statusCode == 200) {
        const result = body;
        // console.log(`body data => ${result}`)
        const xmlToJson = convert.xml2json(result, {
          compact: true,
          spaces: 4,
        });
        console.log(`xml to json => ${xmlToJson}`);
        res.send(xmlToJson);
      }
    }
  });
});

app.get('/caps/login', (req, res) => {
  let { id, pwd } = req.query;
  console.log({ id, pwd });
  fs.readFile('user.json', 'utf8', function readFileCallback(err, data) {
    if (err) {
      console.log(err);
    } else {
      obj = JSON.parse(data); //now it an object            console.log(json)
      for (let i = 0; i < obj.length; i++) {
        console.log(obj[i]);
        if (id === obj[i].id && pwd === obj[i].pwd) {
          return res.json({
            performance: true,
            id: id,
            pwd: pwd,
          });
        }
      }
      return res.json({ performance: false });
    }
  });
});

app.get('/caps/sign-up', (req, res) => {
  let { id, pwd } = req.query;
  console.log({ id, pwd });
  fs.readFile('user.json', 'utf8', function readFileCallback(err, data) {
    if (err) {
      console.log(err);
    } else {
      obj = JSON.parse(data);
      for (let i = 0; i < obj.length; i++) {
        console.log(obj[i]);
        if (id === obj[i].id) {
          return res.json({
            performance: false,
            message: '아이디가 중복됩니다.',
          });
        }
      }
      obj.push({ id: id, pwd: pwd }); //add some data
      json = JSON.stringify(obj); //convert it back to json
      fs.writeFile('user.json', json, 'utf8', () => {
        res.json({
          performance: true,
          message: '회원가입 성공!',
          user: { id: id, pwd: pwd },
        });
      }); // write it back
    }
  });
});

//예시 url
//http://52.78.126.183:3000/ows/survey?as1=4&as2=1&as3=1&as4=2&as5=3&as6=1&as7=2&as8=1&as9=1&as10=1
app.get('/ows/survey', (req, res) => {
  let { as1, as2, as3, as4, as5, as6, as7, as8, as9, as10 } = req.query;
  const as1Arr = [10, 5, 0, 0, 8, 10];
  const as5Arr = [10, 7, 0];
  const yesOrNoArr = [10, 0];
  let score = 0;
  if (as1 !== undefined) score += as1Arr[parseInt(as1) - 1];
  if (as2 !== undefined) score += yesOrNoArr[parseInt(as2) - 1];
  if (as3 !== undefined) score += yesOrNoArr[parseInt(as3) - 1];
  if (as4 !== undefined) score += yesOrNoArr[parseInt(as4) - 1];
  if (as5 !== undefined) score += as5Arr[parseInt(as5) - 1];
  if (as6 !== undefined) score += yesOrNoArr[parseInt(as6) - 1];
  if (as7 !== undefined) score += yesOrNoArr[parseInt(as7) - 1];
  if (as8 !== undefined) score += yesOrNoArr[parseInt(as8) - 1];
  if (as9 !== undefined) score += yesOrNoArr[parseInt(as9) - 1];
  if (as10 !== undefined) score += yesOrNoArr[parseInt(as10) - 1];
  console.log(score);
  res.json({
    performance: true,
    score: score,
  });
});

//예시 url
//http://52.78.126.183:3000/ows/survey?as1=4&as2=1&as3=1&as4=2&as5=3&as6=1&as7=2&as8=1&as9=1&as10=1
app.get('/ows/survey', (req, res) => {
  let { as1, as2, as3, as4, as5, as6, as7, as8, as9, as10 } = req.query;
  const as1Arr = [10, 5, 0, 0, 8, 10];
  const as5Arr = [10, 7, 0];
  const yesOrNoArr = [10, 0];
  let score = 0;
  if (as1 !== undefined) score += as1Arr[parseInt(as1) - 1];
  if (as2 !== undefined) score += yesOrNoArr[parseInt(as2) - 1];
  if (as3 !== undefined) score += yesOrNoArr[parseInt(as3) - 1];
  if (as4 !== undefined) score += yesOrNoArr[parseInt(as4) - 1];
  if (as5 !== undefined) score += as5Arr[parseInt(as5) - 1];
  if (as6 !== undefined) score += yesOrNoArr[parseInt(as6) - 1];
  if (as7 !== undefined) score += yesOrNoArr[parseInt(as7) - 1];
  if (as8 !== undefined) score += yesOrNoArr[parseInt(as8) - 1];
  if (as9 !== undefined) score += yesOrNoArr[parseInt(as9) - 1];
  if (as10 !== undefined) score += yesOrNoArr[parseInt(as10) - 1];
  console.log(score);
  res.json({
    performance: true,
    score: score,
  });
});

app.get('/ows/hospital', (req, res) => {
  let { as1 } = req.query;
  fs.readFile(
    'ows-hospital-data.json',
    'utf8',
    function readFileCallback(err, data) {
      if (err) {
        console.log(err);
      } else {
        obj = JSON.parse(data); //now it an object
        console.log(obj);
        const result = [];
        for (let i = 0; i < obj.length; i++) {
          console.log(obj[i]);
        }
        return res.json({ data: obj });
      }
    }
  );
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
