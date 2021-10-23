import express from "express";
import gradesRouter from "./routes/grades.js";

const app = express();
const port = 3000;
app.use(express.json());

app.use("/grades", gradesRouter); //Redireciona a rota

app.listen(port, () => {
  console.log(`Server is running, access at http://localhost:3000/`);
});
