const http=require("http");
const app=require("./app");


const server=http.createServer(app);

server.listen(3000, function(req, res){
    console.log("Server started on port 3000");
});