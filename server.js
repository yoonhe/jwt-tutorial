require("dotenv").config();
const express = require("express");
const app = express();

const jwt = require("jsonwebtoken");

app.use(express.json());

const posts = [
  {
    username: "heaeun",
    title: "Post 1",
  },
  {
    username: "daeun",
    title: "Post 2",
  },
];

app.get("/posts", authenticateToken, (req, res) => {
  console.log("post 요청입니다");
  res.json(
    posts.filter((post) => {
      console.log(
        "post username? ",
        post.username,
        "req.user.name ? ",
        req.user.name
      );
      return post.username === req.user.name;
    })
  );
});

// app.post("/login", (req, res) => {
//   // Authenticate User

//   const username = req.body.username;
//   const user = { name: username };

//   const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
//   res.json({ accessToken: accessToken });
// });

function authenticateToken(req, res, next) {
  // 토큰 인증, 요청 응답을 받는 함수
  // 이 함수 내에서 우리가 할 일은 ? 토큰 얻기
  // 올바른 사용자인지 확인

  const authHeader = req.headers["authorization"]; // Bearer 형식의 인증헤더를 얻어온다
  console.log("authHeader ? ", authHeader);
  console.log("authHeader split [1] ? ", authHeader.split(" ")[1]);
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    console.log("req.user ? ", req.user);
    next();
  });
}

app.listen(3000, () => {
  console.log("listen port 3000");
});
