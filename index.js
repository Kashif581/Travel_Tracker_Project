import express from "express";
import bodyParser from "body-parser";
import pg from "pg"

const app = express();
const port = 3000;

//CONNECTING TO DATABASE
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password:"mpo58190",
  port: 5432,
 });
 db.connect()

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function checkVisisted() {
  //QUERY TO DATBASE
  // GRAPING ALL THE COUNTRIES CODE FROM VISITED_COUNTRIES TABLE
  const result = await db.query("SELECT country_code FROM visited_countries")

  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code)
  });
  return countries;

}

app.get("/", async (req, res) => {
  //Write your code here.
   
  const countries = await checkVisisted();
  res.render("index.ejs", {countries: countries, total: countries.length});
});

// INSERTING DATA
app.post("/add", async (req, res) =>{
  const input = req.body["country"];
  //console.log(country)
  // QUERY TO DATABASE IF USER INPUT SOMTHING OTHER THEN NAME OF COUNTRY THEN GO TO CATCH BLOCK
  try {
    const result = await db.query("SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';", [input.toLowerCase()]);
    
    // IF COUNTRY EXIST 
    const data = result.rows[0]
    const countryCode = data.country_code;
    //INSERT COUNTRY_CODE INTO VISITED_COUNTRIES TABLE IF ALREADY EXIST THEN GO CATCH BLOCK.
    try {
      await db.query("INSERT INTO visited_countries (country_code) VALUES $1", [countryCode]);
      res.redirect("/")
    } catch (err) {
      const countries = await checkVisisted();
      res.render("index.js", {countries: countries, total:contries.length, error: "Country has already been added, try again"})
    }

  } catch (err) {
    // PASSING ERROR IF USER INPUT SOMTHING OTHER THEN NAME OF COUNTRY
    const countries = await checkVisisted();
    res.render("index.js", {countries: countries, total: countries.length, error: "Country does not exist, try again"})
  }
  
});
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
