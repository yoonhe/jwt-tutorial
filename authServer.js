// 인증서버
// 새로고침 토큰이 필요한 이유?
//

require("dotenv").config();
const express = require("express");
const app = express();

const jwt = require("jsonwebtoken");
let refreshTokens = [];

app.use(express.json());

app.delete("/logout", (req, res) => {
  refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
  res.sendStatus(204);
});

app.post("/token", (req, res) => {
  console.log("/token");
  const refreshToken = req.body.token;

  if (!refreshToken) {
    return res.sendStatus(401);
  }

  if (!refreshTokens.includes(refreshToken)) {
    console.log("토큰에 없음!");
    return res.sendStatus(403);
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }

    const accessToken = generateAccessToken({ name: user.name });
    console.log("accessToken ? ", accessToken);
    res.json({ accessToken: accessToken });
  });
});

app.post("/login", (req, res) => {
  // Authenticate User

  const username = req.body.username;
  const user = { name: username };

  const accessToken = generateAccessToken(user);

  // 15초 후에 만료되므로 새로고침토큰을 만들어야한다
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
  refreshTokens.push(refreshToken);
  res.json({ accessToken: accessToken, refreshToken: refreshToken });
});

// 액세스 토큰을 생성하는 함수
function generateAccessToken(user) {
  // 만료 날짜 추가
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15s" });
}

app.listen(4000, () => {
  console.log("listen port 4000");
});

// 3000번에서 post요청을 통해 토큰을 받아서 4000번에서 get요청을 보내도 원하는 결과를 얻을 수 있다
// 세션은 특정서버에 저장되어 있지만,
// JWT는 모든 정보가 토큰에 있으므로 서로 다른 서버에서도 사용이 가능합니다.
