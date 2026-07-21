import express, { type Request, type Response } from 'express';

// import middleware
import morgan from "morgan";

// import database
import { students } from '@db/db.js';
import { type Student, type Course } from "@libs/types.js";
import {
  zStudentDeleteBody,
  zStudentPostBody,
  zStudentPutBody,
} from "@libs/studentValidator.js";

const app = express();
const port = process.env.PORT || 3000;

// use middleware
app.use(morgan("dev", { immediate: false }));
app.use(express.json());    // parses request's payload into 'req.body'

// Endpoints
app.get("/", (req: Request, res: Response) => {
  res.send("API services for Student Data");
});

// GET /students
// get students (by program or studentId)
app.get("/api/students", (req: Request, res: Response) => {
  try {
    const program = req.query.program;
    const studentId = req.query.studentId;
    let filtred_students = students;
    if (studentId) {
        filtred_students = students.filter(
        (student) => student.studentId === studentId
      );
    }

    if (program) {
       filtred_students = filtred_students.filter(
        (student) => student.program === program
      );
    }
    return res.json({
      success: true,
      count: filtred_students.length,
      data: filtred_students,
    });
  } catch (err) {
    return res.json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

// POST /students, body = {new student data}
// add a new student
app.post("/api/students", (req: Request, res: Response) => {
  try {
    const body = req.body as Student;
    // validate req.body with predefined validator
    const result = zStudentPostBody.safeParse(body); // check zod
    if (!result.success) {
      return res.json({
        message: "Validation failed",
        errors: result.error.issues[0]?.message,
      });
    }

    //check duplicate studentId
    const found = students.find(
      (student) => student.studentId === body.studentId
    );
    if (found) {
      return res.json({
        success: false,
        message: "Student is already exists",
      });
    }

    // add new student
    const new_student = body;
    students.push(new_student);

    // add response header 'Link'
    res.set("Link", `/students/${new_student.studentId}`);

    return res.json({
      success: true,
      data: new_student,
    });
    // return res.json({ ok: true, message: "successfully" });
  } catch (err) {
    return res.json({
      success: false,
      message: "Somthing is wrong, please try again",
      error: err,
    });
  }
});

// PUT /students, body = {studentId}
// Update specified student
app.put("/students", (req: Request, res: Response) => {
  try {
    const body = req.body as Student;

    // validate req.body with predefined validator
    const result = zStudentPutBody.safeParse(body); // check zod
    if (!result.success) {
      return res.json({
        errors: result.error.issues[0]?.message,
      });
    }

    //check duplicate studentId
    const foundIndex = students.findIndex(
      (student) => student.studentId === body.studentId
    );

    if (foundIndex === -1) {
      return res.json({
        success: false,
        message: "Student does not exists",
      });
    }

    // update student data
    students[foundIndex] = { ...students[foundIndex], ...body };

    // add response header 'Link'
    res.set("Link", `/students/${body.studentId}`);

    return res.json({
      success: true,
      message: `Student ${body.studentId} has been updated successfully`,
      data: students[foundIndex],
    });
  } catch (err) {
    return res.json({
      success: false,
      message: "Somthing is wrong, please try again",
      error: err,
    });
  }
});

// DELETE /students, body = {studentId}
app.delete("/api/students", (req: Request, res: Response) => {
  try {
    const body = req.body as { studentId?: string };
    const result = zStudentDeleteBody.safeParse(body);
    if (!result.success) {
      return res.status(404).json({
        ok: false,
        errors: result.error.issues[0]?.message,
      });
    }

    const { studentId } = result.data;
    const foundIndex = students.findIndex(
      (student) => student.studentId === studentId
    );

    if (foundIndex === -1) {
      return res.status(404).json({
        ok: false,
        message: "Student ID does not exist",
      });
    }

    const removedStudent = students.splice(foundIndex, 1);

    return res.json({
      ok: true,
      message: `Student Id ${studentId} has been deleted`,
    });
  } catch (err) {
    return res.status(404).json({
      ok: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});
app.get("/api/me",(require,res) =>{
  return res.json({
    ok:"true",
    fullname:"Parattakorn Klaikaeo",
    studentId:"680610691"
  })
})

app.listen(port, async () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});

export default app;