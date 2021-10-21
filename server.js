import express from "express";
import path from "path";

const app = express();
const __dirname = path.resolve();

app.use(express.static(__dirname));

app.get('/*', function(req,res) {
    res.sendFile(path.join(__dirname, '/static/', req.path));
});

// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 8080);