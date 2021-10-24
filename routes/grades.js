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
  const newGrade = req.body; //Carrega os parâmetros
  newGrade.id = data.nextId++; //Adiciona na nova grade o atual id e depois incrementa o próprio
  newGrade.timestamp = new Date(); //Adiciona o timestamp.
  const { id, ...grade } = newGrade; //Usando destructuring para separar;
  const orderedGrade = { id, ...grade }; //Usando spread para ordenar

  data.grades.push(orderedGrade); //Adiciona a nova grade junto as outras
  await writeFile("grades.json", JSON.stringify(data)); //Escreve tudo no arquivo

  const newData = await JSON.parse(await readFile("grades.json")); //Leia de novo o arquivo
  res.send(newData);
});

/**
 * 2. Crie um endpoint para atualizar uma grade. Este endpoint deverá receber como
 * parâmetros o id da grade a ser alterada e os campos student, subject, type e value. O
 * endpoint deverá validar se a grade informada existe, caso não exista deverá retornar um
 * erro. Caso exista, o endpoint deverá atualizar as informações recebidas por parâmetros
 * no registro, e realizar sua atualização com os novos dados alterados no arquivo
 * grades.json.
 */
router.put("/", async (req, res) => {
  const data = await JSON.parse(await readFile("grades.json")); //Carrega os arquivo
  const newGrade = req.body; //Carrega os parâmetros
  const gradeExist = data.grades.some((grade) => {
    return grade.id === newGrade.id;
  });
  if (gradeExist) {
    const index = newGrade.id - 1; //Ajustando parâmetro com indice do array
    data.grades[index] = {
      id: newGrade.id,
      student: newGrade.student,
      subject: newGrade.subject,
      type: newGrade.type,
      value: newGrade.value,
      timestamp: new Date(),
    };
  }
  await writeFile("grades.json", JSON.stringify(data));
  const newData = await JSON.parse(await readFile("grades.json"));
  res.send(newData);
});

router.use((req, res) => {
  res.send("Server is running!");
});

export default router;
