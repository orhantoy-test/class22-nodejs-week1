const knex = require("knex")({
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "my-secret-pw",
    database: process.env.DB_NAME || "hyf_node_week1",
  },
})
const express = require("express")
const app = express()
const port = process.env.PORT || 3000

app.get("/", (req, res) => {
  res.send(`
<head>
  <title>HyF Node.js | Week 1</title>
</head>
<body>
  <p>This page shows the number of users.</p>
  <div id="user-count" style="font-size: 72px; color: blue; text-align: center">
    N/A
  </div>
  <div style="color: blue; text-align: center">
    user(s)
  </div>
  <script type="text/javascript">
    let interval = null

    async function updateUserCount() {
      try {
        const response = await fetch("/user-count")
        const { count } = await response.json()
        document.getElementById("user-count").innerHTML = count
      } catch (e) {
        console.error(e)

        if (interval !== null) {
          clearInterval(interval)
        }
      }
    }

    updateUserCount().finally(() => {})
    interval = setInterval(updateUserCount, 2000)
  </script>
</body>
  `)
})

app.get("/info", async (req, res) => {
  try {
    const [rows] = await knex.raw("SELECT VERSION()")

    res.json({
      nodeVersion: process.version,
      mysqlVersion: rows[0]["VERSION()"],
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: "Internal server error" })
  }
})

/*
  /all-users should respond with all users sorted by ID
*/
app.get("/all-users", async (req, res) => {
  try {
    const [rows] = await knex.raw("SELECT * FROM users ORDER BY id")
    res.json(rows)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: "Internal server error" })
  }
})

/*
  /unconfirmed-users should respond with unconfirmed users
*/
app.get("/unconfirmed-users", async (req, res) => {
  try {
    const [rows] = await knex.raw("SELECT * FROM users WHERE confirmed_at IS NULL")
    res.json(rows)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: "Internal server error" })
  }
})

/*
  /gmail-users should respond with users with an @gmail.com email
*/
app.get("/gmail-users", async (req, res) => {
  try {
    const [rows] = await knex.raw("SELECT * FROM users WHERE email LIKE '%@gmail.com'")
    res.json(rows)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: "Internal server error" })
  }
})

/*
  /2022-users should respond with users created in 2022
*/
app.get("/2022-users", async (req, res) => {
  try {
    const [rows] = await knex.raw("SELECT * FROM users WHERE YEAR(created_at) = 2022")
    res.json(rows)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: "Internal server error" })
  }
})

/*
  /user-count should respond with the number of users
*/
app.get("/user-count", async (req, res) => {
  try {
    const [rows] = await knex.raw("SELECT COUNT(*) AS count FROM users")
    res.json(rows[0])
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: "Internal server error" })
  }
})

/*
  /last-name-count should respond with how many users there are with a given last name, sorted alphabetically
*/
app.get("/last-name-count", async (req, res) => {
  try {
    const [rows] = await knex.raw("SELECT last_name, COUNT(*) AS count FROM users GROUP BY last_name")
    res.json(rows)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: "Internal server error" })
  }
})

/*
  /first-user should respond with the first user. If there are no users in the table, respond with a 404
*/
app.get("/first-user", async (req, res) => {
  try {
    const [rows] = await knex.raw("SELECT * FROM users ORDER BY id LIMIT 1")
    if (rows.length > 0) {
      res.json(rows[0])
    } else {
      res.status(404).json({ error: "No user found" })
    }
  } catch (e) {
    console.error(e)
    res.status(500).send("Internal server error")
  }
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})
