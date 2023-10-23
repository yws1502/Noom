import express from "express";

const app = express();

const port = 3000;

const handleListen = () => console.log(`Listening on http://localhost:${port}`);

app.listen(port, handleListen);
