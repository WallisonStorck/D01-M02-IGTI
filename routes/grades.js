import express from "express";
import { promises as fs, read } from "fs";

const router = express.Router();

const { readFile, writeFile } = fs;

const GRADE_FILE = "grades.json"; //Caminho do arquivo de grades

/**
 * 1. Crie um endpoint para criar uma grade. Este endpoint deverá receber como parâmetros
 * os campos student, subject, type e value.
 */
router.post("/", async (req, res) => {
  const data = await JSON.parse(await readFile(GRADE_FILE)); //Carrega o arquivo.
  const newGrade = req.body; //Carrega os parâmetros
  newGrade.id = data.nextId++; //Adiciona na nova grade o atual id e depois incrementa o próprio
  newGrade.timestamp = new Date(); //Adiciona o timestamp.
  const { id, ...grade } = newGrade; //Usando destructuring para separar;
  const orderedGrade = { id, ...grade }; //Usando spread para ordenar

  data.grades.push(orderedGrade); //Adiciona a nova grade junto as outras
  await writeFile("grades.json", JSON.stringify(data)); //Escreve tudo no arquivo

  const newData = await JSON.parse(await readFile(GRADE_FILE)); //Leia de novo o arquivo
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
  const data = await JSON.parse(await readFile(GRADE_FILE)); //Carrega os arquivo
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
  const newData = await JSON.parse(await readFile(GRADE_FILE));
  res.send(newData);
});

/**
 * 3. Crie um endpoint para excluir uma grade. Este endpoint deverá receber como
 * parâmetro o id da grade e realizar sua exclusão do arquivo grades.json.
 */
router.delete("/:id", async (req, res) => {
  const data = await JSON.parse(await readFile(GRADE_FILE));
  for (let i = 0; i < data.grades.length; i++) {
    if (data.grades[i].id == req.params.id) {
      data.grades.splice(i, 1); //Remove 1 elemento no indice "i"
      break;
    }
  }
  await writeFile(GRADE_FILE, JSON.stringify(data));
  const newData = await JSON.parse(await readFile(GRADE_FILE));
  res.send(newData);
});

/**4. Crie um endpoint para consultar uma grade em específico. Este endpoint deverá
 * receber como parâmetro o id da grade e retornar suas informações.
 */
router.get("/:id", async (req, res) => {
  const data = await JSON.parse(await readFile(GRADE_FILE));
  const grade = data.grades.find((grade) => grade.id == req.params.id);
  res.send(grade);
});

/**
 * 5. Crie um endpoint para consultar a nota total de um aluno em uma disciplina. O
 * endpoint deverá receber como parâmetro o student e o subject, e realizar a soma de
 * todas os as notas de atividades correspondentes a aquele subject para aquele student. O
 * endpoint deverá retornar a soma da propriedade value dos registros encontrados.
 */
// router.get("/", async (req, res) => {
//   const data = await JSON.parse(await readFile(GRADE_FILE));
//   const student = req.body.student;
//   const subject = req.body.subject;
//   let countOfSubject = 0;
//   data.grades.forEach((grade) => {
//     if (grade.student == student && grade.subject == subject) {
//       countOfSubject += grade.value;
//     }
//   });
//   res.send(
//     `Student: ${student} || Subject: ${subject} || Total value: ${countOfSubject}!`
//   );
// });

/**
 * 6. Crie um endpoint para consultar a média das grades de determinado subject e type. O
 * endpoint deverá receber como parâmetro um subject e um type, e retornar a média. A
 * média é calculada somando o registro value de todos os registros que possuem o subject
 * e type informados, e dividindo pelo total de registros que possuem este mesmo subject e
 * type.
 */
// router.get("/", async (req, res) => {
//   const data = await JSON.parse(await readFile(GRADE_FILE));
//   const subject = req.body.subject;
//   const type = req.body.type;
//   let sumOfValues = 0;
//   let countValues = 0;
//   for (let i = 0; i < data.grades.length; i++) {
//     if (data.grades[i].subject == subject && data.grades[i].type == type) {
//       sumOfValues += data.grades[i].value;
//       countValues++;
//     }
//   }
//   const avgValue = sumOfValues / countValues;
//   res.send(
//     `A média geral da matéria ${subject} na modalidade ${type} é de ${avgValue.toFixed(
//       2
//     )}!`
//   );
// });

/**
 * 7. Crie um endpoint para retornar as três melhores grades de acordo com determinado
 * subject e type. O endpoint deve receber como parâmetro um subject e um type retornar
 * um array com os três registros de maior value daquele subject e type. A ordem deve ser
 * do maior para o menor.
 */
router.get("/", async (req, res) => {
  const data = await JSON.parse(await readFile(GRADE_FILE));
  const subject = req.body.subject;
  const type = req.body.type;
  const ranking = []; //Array que vai conter o top 3
  data.grades.forEach((grade) => {
    if (grade.subject == subject && grade.type == type) {
      ranking.push(grade.value);
    }
  });
  ranking.sort((a, b) => {
    return b - a;
  });
  ranking.splice(3);
  res.send(
    `As maiores grades do subject '${subject}' e type '${type}' são ${ranking}!`
  );
});

router.use((req, res) => {
  res.send("Server is running!");
  res.end();
});

export default router;
