const express = require("express");
const app = express();
const mysql = require("mysql2");
const path = require("path");




app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/public")));


const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "Hospital_DB",
  password: "root@123",
});

app.listen(6060, (req, res) => {
  console.log("http://localhost:6060/home");
});
app.get("/", (req, res) => {
  res.render("home");
});
app.get("/home", (req, res) => {
  res.render("newhome");
});

app.get("/newPatient", (req, res) => {
  res.render("addPatient");
});

app.post('/addPatient', (req, res) => {
  const { Name, Age, Gender, Phone, Email, Address, Date_registered } = req.body;

  const sql = `INSERT INTO patients (Name, Age, Gender, Phone, Email, Address, Date_registered)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;

  const values = [Name, parseInt(Age), Gender, Phone, Email, Address, Date_registered];

  con.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error inserting data:', err.message);
      return res.status(500).send('Database error');
    } else {
      console.log(result);
      res.redirect("/home");

    }
  });
});

app.get("/newDoctor", (req, res) => {
  res.render("addDoctor");
});

app.post('/addDoctor', (req, res) => {
  const { Name, specialization, department, Phone, email, experience_years } = req.body;

  const sql = `INSERT INTO Doctors (Name, specialization, department, Phone, email, experience_years) VALUES (?, ?, ?, ?, ?, ?)`;
  let newDoctor = [Name, specialization, department, Phone, email, experience_years];
  con.query(sql, newDoctor, (err, result) => {
    if (err) {
      console.error('Error inserting doctor:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    console.log(result);

    res.redirect("/home");
  });
});


app.get("/newAppointment", (req, res) => {
  res.render("addAppointment");
});

// Route to get all patients
app.get('/patients', (req, res) => {
  con.query('SELECT * FROM patients', (err, results) => {
    if (err) return res.status(500).json({ error: 'Error fetching patients' });
    res.json(results);
  });
});

// Route to get all doctors
app.get('/doctors', (req, res) => {
  con.query('SELECT * FROM Doctors', (err, results) => {
    if (err) return res.status(500).json({ error: 'Error fetching doctors' });
    res.json(results);
  });
});

app.get("/appointments", (req, res) => {
  const query = `
    SELECT 
      a.appointment_id,
      p.name AS patient_name,
      d.name AS doctor_name,
      a.appointment_date,
      a.appointment_time,
      a.status_appointment
    FROM Appointments a
    JOIN Patients p ON a.patient_id = p.patients_id
    JOIN Doctors d ON a.doctor_id = d.doctor_id
    ORDER BY a.appointment_date DESC, a.appointment_time DESC
  `;

  con.query(query, (err, results) => {
    if (err) return res.status(500).send("Database error");
    res.json(results);
  });
});


// Handle appointment form submission
app.post('/addAppointment', (req, res) => {
  const { patient_id, doctor_id, appointment_date, appointment_time, status_appointment } = req.body;

  const sql = `
    INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status_appointment)
    VALUES (?, ?, ?, ?, ?)
  `;

  con.query(sql, [patient_id, doctor_id, appointment_date, appointment_time, status_appointment], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to insert appointment' });
    console.log(result);
    res.redirect("/home");
  });
});

app.get("/allDoctors", (req, res) => {
  res.render("allDoctors");
});
app.get("/allPatients", (req, res) => {
  res.render("allPatients");
});
app.get("/allAppointments", (req, res) => {
  res.render("allAppointments");
});

app.get("/newBill", (req, res) => {
  res.render("addBill");
});

app.post("/addbill", (req, res) => {
  const { patient_id, amount, billing_date, payment_date, status_bill } = req.body;
  const sql = `INSERT INTO Billing (patient_id, amount, billing_date, payment_date, status_bill) VALUES (?, ?, ?, ?, ?)`;
  con.query(sql, [patient_id, amount, billing_date, payment_date, status_bill], (err, result) => {
    if (err) return res.status(500).send("Error saving bill");
    res.redirect("/home");
  });
});

app.get("/allbills", (req, res) => {
  res.render("allBills");
});

app.get("/bills", (req, res) => {
  const sql = `
    SELECT b.bill_id, p.name AS patient_name, b.amount, b.billing_date, b.payment_date, b.status_bill
    FROM billing b
    JOIN patients p ON b.patient_id = p.patients_id
    ORDER BY b.billing_date DESC
  `;
  con.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching bills:", err);
      return res.status(500).send("Database error");
    }
    console.log(results);
    res.json(results);
  });
});


app.delete("/delete-bill/:id", (req, res) => {
  const billId = req.params.id;
  con.query("DELETE FROM billing WHERE bill_id = ?", [billId], (err, result) => {
    if (err) return res.status(500).send("Delete error");
    res.send("Bill deleted");
  });
});


