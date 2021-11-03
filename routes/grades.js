import express from "express";
import { promises as fs } from "fs";

const router = express.Router();

const { readFile, writeFile } = fs;

const GRADE_FILE = "grades.json"; //Caminho do arquivo de grades

/**
 * 1. Crie um endpoint para criar uma grade. Este endpoint deverá receber como parâmetros
 * os campos student, subject, type e value.
 */
router.post("/create", async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
});

/**
 * 2. Crie um endpoint para atualizar uma grade. Este endpoint deverá receber como
 * parâmetros o id da grade a ser alterada e os campos student, subject, type e value. O
 * endpoint deverá validar se a grade informada existe, caso não exista deverá retornar um
 * erro. Caso exista, o endpoint deverá atualizar as informações recebidas por parâmetros
 * no registro, e realizar sua atualização com os novos dados alterados no arquivo
 * grades.json.
 */
router.put("/update", async (req, res, next) => {
  try {
    const data = await JSON.parse(await readFile(GRADE_FILE)); //Carrega os arquivo
    const newGrade = req.body; //Carrega os parâmetros
    const gradeExist = data.grades.some((grade) => {
      return grade.id === newGrade.id;
    });
    if (gradeExist) {
      for (let i = 0; i < data.grades.length; i += 1) {
        if (data.grades[i].id === newGrade.id) {
          newGrade.student ? (data.grades[i].student = newGrade.student) : null;
          newGrade.subject ? (data.grades[i].subject = newGrade.subject) : null;
          newGrade.type ? (data.grades[i].type = newGrade.type) : null;
          newGrade.value ? (data.grades[i].value = newGrade.value) : null;
          break; //Interrompe o laço economizando tempo
        }
      }
    } else {
      throw new Error("Grade don't found, please check the id!");
    }

    await writeFile("grades.json", JSON.stringify(data));
    const newData = await JSON.parse(await readFile(GRADE_FILE));
    res.send(newData);
  } catch (error) {
    next(error);
  }
});

/**
 * 3. Crie um endpoint para excluir uma grade. Este endpoint deverá receber como
 * parâmetro o id da grade e realizar sua exclusão do arquivo grades.json.
 */
router.delete("/delete/:id", async (req, res, next) => {
  try {
    const data = await JSON.parse(await readFile(GRADE_FILE));

    //Procura pelo id
    const idExist = data.grades.some((grade) => {
      return grade.id === parseInt(req.params.id);
    });

    //Verifica se existe item com o id especificado
    if (idExist) {
      for (let i = 0; i < data.grades.length; i += 1) {
        if (data.grades[i].id === parseInt(req.params.id)) {
          data.grades.splice(i, 1); //Remove 1 elemento no indice "i"
          break; //Interrompe o laço economizando tempo
        }
      }
      //Escreve as alterações, ler novamente e mostra na tela
      await writeFile(GRADE_FILE, JSON.stringify(data));
      const newData = await JSON.parse(await readFile(GRADE_FILE));
      res.send(newData);
    } else {
      throw new Error("Grade don't exist!");
    }
  } catch (error) {
    next(error);
  }
});

/**
 * 4. Crie um endpoint para consultar uma grade em específico. Este endpoint deverá
 * receber como parâmetro o id da grade e retornar suas informações.
 */
router.get("/consult/:id", async (req, res, next) => {
  try {
    const data = await JSON.parse(await readFile(GRADE_FILE));

    //Procura pelo id
    const grade = data.grades.find(
      (grade) => grade.id === parseInt(req.params.id)
    );

    //Verifica se id existe
    if (grade) {
      res.send(grade);
    } else {
      throw new Error("Grade don't exist!");
    }
  } catch (error) {
    next(error);
  }
});

/**
 * 5. Crie um endpoint para consultar a nota total de um aluno em uma disciplina. O
 * endpoint deverá receber como parâmetro o student e o subject, e realizar a soma de
 * todas os as notas de atividades correspondentes a aquele subject para aquele student. O
 * endpoint deverá retornar a soma da propriedade value dos registros encontrados.
 */
router.get("/consult-subject", async (req, res, next) => {
  try {
    const data = await JSON.parse(await readFile(GRADE_FILE));
    const student = req.body.student;
    const subject = req.body.subject;
    let countOfSubject = 0;

    //Procura pelo estudante e disciplina especificados
    const studentAndSubjectExist = data.grades.some((grade) => {
      return grade.student == student && grade.subject == subject;
    });

    //Verifica se existe o estudante e disciplina especificados
    if (studentAndSubjectExist) {
      data.grades.forEach((grade) => {
        if (grade.student == student && grade.subject == subject) {
          countOfSubject += grade.value;
        }
      });

      res.send(
        `Student: ${student} || Subject: ${subject} || Total value: ${countOfSubject}!`
      );
    } else {
      throw new Error("Dont't exists student and subject specified!");
    }
  } catch (error) {
    next(error);
  }
});

/**
 * 6. Crie um endpoint para consultar a média das grades de determinado subject e type. O
 * endpoint deverá receber como parâmetro um subject e um type, e retornar a média. A
 * média é calculada somando o registro value de todos os registros que possuem o subject
 * e type informados, e dividindo pelo total de registros que possuem este mesmo subject e
 * type.
 */
router.get("/consult-avg", async (req, res, next) => {
  try {
    const data = await JSON.parse(await readFile(GRADE_FILE));
    const subject = req.body.subject;
    const type = req.body.type;
    let sumOfValues = 0;
    let countValues = 0;

    //Procura pelo subject e type
    const subjectAndTypeExists = data.grades.some((grade) => {
      return grade.subject == subject && grade.type == type;
    });

    //Verifica se existe subject e type
    if (subjectAndTypeExists) {
      for (let i = 0; i < data.grades.length; i += 1) {
        if (data.grades[i].subject == subject && data.grades[i].type == type) {
          sumOfValues += data.grades[i].value;
          countValues++;
        }
      }
      const avgValue = sumOfValues / countValues;
      res.send(
        `A média geral da matéria ${subject} na modalidade ${type} é de ${avgValue.toFixed(
          2
        )}!`
      );
    } else {
      throw new Error("Don't exists subject and type specified!");
    }
  } catch (error) {
    next(error);
  }
});

/**
 * 7. Crie um endpoint para retornar as três melhores grades de acordo com determinado
 * subject e type. O endpoint deve receber como parâmetro um subject e um type retornar
 * um array com os três registros de maior value daquele subject e type. A ordem deve ser
 * do maior para o menor.
 */
router.get("/top3", async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
});

/**
 * 8. (OPCIONAL) Lista todas as grades
 */
router.get("/list-all", async (req, res, next) => {
  try {
    const data = await JSON.parse(await readFile(GRADE_FILE));
    res.send(data.grades);
  } catch (error) {
    next(error);
  }
});

router.use((err, req, res, next) => {
  console.log(err.message);
  res.status(400).send(err.message);
});

export default router;
