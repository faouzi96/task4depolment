const express = require("express")
const mysql = require("mysql")
const { createHash } = require("node:crypto")
const cors = require("cors")

const getLastConnectionTime = require("./getLastConnectionTime.js")

const app = express()
const PORT = process.env.PORT || 5000
app.use(express.json())
app.use(cors())

app.use(express.static(path.join(__dirname, "/client/build")))

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "/client/build", "index.html"))
})

var con = mysql.createConnection({
    host: "localhost",
    user: "USERNAME",
    password: "PASSWORD",
    database: "NAME_OF_YOUR_DB",
})

if (!con._connectCalled) con.connect()

app.post("/api/login", (req, res) => {
    const data = req.body
    const hash = createHash("SHA3-256")
    hash.update(data.password)
    const password = hash.digest("hex")

    const sql = `SELECT * FROM users WHERE username="${data.username}" AND password="${password}"`

    con.query(sql, function (err, result) {
        if (err) res.status(400).json({ msg: "DB Error" })
        else if (result.length === 0)
            res.status(404).json({ msg: "User unidentified" })
        else if (result[0].status !== "blocked")
            res.status(200).json({ msg: "successed", id: result[0].id })
        else res.status(200).json({ msg: "You are blocked" })
    })
})

app.post("/api/signin", (req, res) => {
    const data = req.body
    const date = new Date()
    const registration = date.toLocaleDateString()
    const lastConnection = date.toLocaleString()

    const hash = createHash("SHA3-256")
    hash.update(data.password)
    const password = hash.digest("hex")

    const sql = `INSERT INTO users (username, password, email, registration_date, last_connection, status) VALUES ("${data.username}", "${password}", "${data.email}","${registration}","${lastConnection}","active")`

    con.query(sql, function (err, result) {
        if (err) res.send({ msg: "DB Error" })
        else {
            const sql1 = `SELECT id FROM users WHERE email="${data.email}"`

            con.query(sql1, function (err, result1) {
                if (err) res.send({ msg: "DB Error" })
                else res.send({ msg: "successed", id: result1[0].id })
            })
        }
    })
})

app.get("/api/recuperationdata", (req, res) => {
    const sql =
        "SELECT id, username, email, registration_date, last_connection, status FROM users"

    con.query(sql, function (err, result) {
        if (err) res.send({ msg: "DB Error", users: [] })
        else if (result.length === 0) res.send({ msg: "empty", users: [] })
        else {
            const data = result.map((element) => {
                element.last_connection = getLastConnectionTime(
                    Date.now() - Date.parse(element.last_connection)
                )
                return element
            })
            res.send({ msg: "successed", users: data })
        }
    })
})

app.post("/api/manipulationdata", (req, res) => {
    const action = req.body.action
    const usersId = req.body.usersId

    if (action === "delete") {
        usersId.forEach((userId, index) => {
            const sql = `DELETE FROM users WHERE id=${userId}`

            con.query(sql, (err) => {
                if (err) res.send({ msg: "DB Error" })
                else if (userId.length - 1 === index) res.send({ msg: action })
            })
        })
    } else {
        const status = action === "block" ? "blocked" : "active"

        usersId.forEach((userId) => {
            const sql = `UPDATE users SET status="${status}" WHERE id=${userId}`

            con.query(sql, (err) => {
                if (err) res.send({ msg: "DB Error" })
            })
        })
        res.send({ msg: action })
    }
})

app.post("/api/logout", (req, res) => {
    const data = req.body
    const last_connection = new Date().toLocaleString()
    const sql = `UPDATE users SET last_connection="${last_connection}" WHERE id=${data.userId}`

    con.query(sql, (err) => {
        if (err) res.send({ msg: "DB Error" })
        else res.send({ msg: "Updated" })
    })
})

app.listen(PORT, () => {
    console.log("Server running on port 5000 ...")
})
