import express from "express";
import { promises as fs } from "fs";

const router = express.Router();

const { readFile, writeFile } = fs;

/**
 * 1. Crie um endpoint para criar uma grade. Este endpoint deverá receber como parâmetros
 * os campos student, subject, type e value.
 */
router.post("/", async (req, res) => {
  const data = await JSON.parse(await readFile("grades.json")); //Carrega o arquivo.
  const newGrade = req.body; //Guarda corpo da requisição
  newGrade.id = data.nextId++; //Adiciona na nova grade o atual id e depois incrementa o próprio
  newGrade.timestamp = new Date(); //Adiciona o timestamp.
  const { id, ...grade } = newGrade; //Usando destruturing para separar;
  const orderedGrade = { id, ...grade }; //Usando spread para rodenar

  data.grades.push(orderedGrade); //Adiciona a nova grade junto as outras
  await writeFile("grades.json", JSON.stringify(data)); //Escreve tudo no arquivo

  const newData = await JSON.parse(await readFile("grades.json"));
  res.send(newData);
});

router.use((req, res) => {
  res.send("Server is running!");
});

export default router;
