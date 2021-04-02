const e = require('express');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const cookiesession  = require('cookie-session');
app.set('view engine', 'ejs');

app.use(e.urlencoded({ extended: false }));
app.use(cookiesession({
   name: 'session',
   keys: ['JsiL', 'JsiW'],
   maxAge: 24 * 60 * 60 * 1000 // 24 hodin
}))
var jmeno;

app.get('/chat', function(req, res) {
   if(req.session.username){
      jmeno = req.session.username;
      res.render("index");
   }else{
      res.redirect("/")
   }
});
app.get("/", function(req, res) {
   if(req.session.username){
      res.redirect("/chat")
   }else{
      res.render("user");
   }
});

app.post("/user", function(req, res){
   if(!req.session.username){
      const name = req.body.usernameinput;
      if(name.length != 0){
         req.session.username = name;
         res.redirect("/chat");
      }else{
         res.redirect("/");
      }
   }else{
      res.redirect("/chat")
   }
});

app.get("/logout", function(req, res){
   if(req.session.username){
      req.session.username = null;
      res.redirect("/");
   }else{
      res.redirect("/");
   }
});




const User = {};

io.on('connection', socket => {


   User[socket.id] = jmeno;
   socket.broadcast.emit("connected", jmeno);
   socket.emit("UserConnect", {user: User[socket.id]}); 
   socket.on("message-input", msg => {
      socket.broadcast.emit("message", {message: msg, user: User[socket.id]});
   });



   socket.on('disconnect', function () {
      socket.broadcast.emit("UserDisconnect", jmeno); 
   });
});

http.listen(8080, function() {
   console.log('Appka běží');
});