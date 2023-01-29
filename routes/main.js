const e = require("express");

module.exports = function (app, appData) {
  //for redirection when a user attempts accessing pages that requires them to be logged in
  const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
      res.redirect("./login");
    } else {
      next();
    }
  };

  const { check, validationResult } = require("express-validator");

  //Handle our routes
  // ------------------------------- HOME ROUTE
  app.get("/", function (req, res) {
    res.render("index.ejs", appData);
  });

  // ------------------------------- ABOUT ROUTE
  app.get("/about", function (req, res) {
    res.render("about.ejs", appData);
  });

  // ------------------------------- REGISTER and REGISTERED ROUTES
  //Instructions on how to register are in the README document
  app.get("/register", function (req, res) {
    res.render("register.ejs", appData);
  });

  //each field has a specific criteria which the user has to meet
  app.post(
    "/registered",
    [
      //validation
      check("username").isLength({ min: 3 }).escape(),
      //cannot be left empty and removes whitespaces
      check("firstname").notEmpty().trim().escape(),
      check("lastname").notEmpty().trim().escape(),
      check("email").isEmail().normalizeEmail().escape(),
      check("password").isLength({ min: 8 }).escape(),
    ],
    function (req, res) {
      const errors = validationResult(req);
      //If the field is empty it gets redirected to register page
      if (!errors.isEmpty()) {
        res.redirect("https://www.doc.gold.ac.uk/usr/433/register");
       // res.redirect("/register");
      } else {
        const bcrypt = require("bcrypt");
        const saltRounds = 10;
        //input sanitized
        const plainPassword = req.sanitize(req.body.password);
        const user = req.sanitize(req.body.username);
        const fname = req.sanitize(req.body.firstname);
        const lname = req.sanitize(req.body.lastname);
        const email = req.sanitize(req.body.email);

        // Store hashed password in your database
        bcrypt.hash(plainPassword, saltRounds, function (err, hashedPassword) {
          //saving user's data into the USERS database
          let sqlquery = `INSERT INTO USERS (Username, FirstName, LastName, Email, hashedPassword) VALUES ('${user}','${fname}', '${lname}', '${email}', '${hashedPassword}')`;
          //execute SQL query
          let newrecord = [user, fname, lname, email, plainPassword];
          db.query(sqlquery, newrecord, (err, result) => {
            if (err) {
              throw err;
            } else
              result =
                "Hello " +
                fname +
                " " +
                lname +
                " you are now registered! Your username is " +
                user +
                ". We will send an email to you at " +
                email;
            result +=
              ". Your password is: " +
              plainPassword +
              " and your hashed password is: " +
              hashedPassword +
              "<a href=" +
              "./" +
              ">Home</a>";
            res.send(result);
          });
        });
      }
    }
  );

  // ------------------------------- LOGIN and LOGGED IN ROUTES
  //Displays the login.ejs file that contains the form
  app.get("/login", function (req, res) {
    res.render("login.ejs", appData);
  });

  //logged in route
  app.post(
    "/loggedin",
    [
      //Form validated
      check("username").isLength({ min: 3 }).escape(),
      check("password").isLength({ min: 8 }).escape(),
    ],
    function (req, res) {
      const errors = validationResult(req);
      //If the field is empty it gets redirected to login page
      if (!errors.isEmpty()) {
        res.redirect("https://www.doc.gold.ac.uk/usr/433/login");
        //res.redirect("/login");
      } else {
        const bcrypt = require("bcrypt");
        const saltRounds = 10;
        //input field sanitised
        const pass = req.sanitize(req.body.password);
        const usern = req.sanitize(req.body.username);

        //Query to retrieve hashed password for the user from the database
        let sqlQuery = "SELECT hashedPassword FROM USERS WHERE Username=?";
        db.query(sqlQuery, [usern], function (err, results) {
          if (err) throw err;

          //Goes through the list of usernames to check if it exists
          if (results.length === 0) {
            res.send("Username does not exist! <a href=" + "./" + ">Home</a>");
          }
          //if username exists it will check the password
          else {
            let hash = results[0].hashedPassword;

            //Compare password supplied with the password retrieved from the database
            bcrypt.compare(pass, hash, function (err, result) {
              if (err) throw err;

              if (result == true) {
                //Save user session here when login is successful
                req.session.userId = req.body.username;
                res.send(
                  "You have successfully logged in!!! <a href=" +
                    "./" +
                    ">Home</a>"
                );
              } else {
                res.send(
                  "Wrong Password. Try again!!! <a href=" + "./" + ">Home</a> "
                );
              }
            });
          }
        });
      }
    }
  );

  // ------------------------------- LOGOUT ROUTE
  app.get("/logout", redirectLogin, (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.redirect("./");
      }
      res.send("You are now logged out!! <a href=" + "./" + ">Home</a>");
    });
  });

  // ------------------------------- ADD FOOD and FOOD ADDED ROUTES
  app.get("/addFood", redirectLogin, function (req, res) {
    res.render("addFood.ejs", appData);
  });

  app.post(
    "/foodAdded",
    redirectLogin,
    [
      //validation 
      check("name").notEmpty().isLength({ min: 1 }),
      check("TypeVal").isInt().isLength({ min: 1 }),
      check("unit").notEmpty().isLength({ min: 1 }),
      check("carbs").isInt().isLength({ min: 1 }),
      check("fat").isInt().isLength({ min: 1 }),
      check("protein").isInt().isLength({ min: 1 }),
      check("salt").isInt().isLength({ min: 1 }),
      check("sugar").isInt().isLength({ min: 1 }),
    ],
    function (req, res) {
      const errors = validationResult(req);
      //If the field is empty it gets redirected to addfood
      if (!errors.isEmpty()) {
        res.redirect("https://www.doc.gold.ac.uk/usr/433/addFood");
        //res.redirect("/addFood");
      } else {
        // sanitises data before saving data in database
        let sqlquery = req.sanitize(
          `INSERT INTO food (FoodName, TypeVal, Unit, Carbs, Fat, Protein, Salt, Sugar, USERID) VALUES ('${req.body.name}','${req.body.TypeVal}', '${req.body.unit}', '${req.body.carbs}', '${req.body.fat}', '${req.body.protein}' ,'${req.body.salt}', '${req.body.sugar}', '${req.session.userId}')`
          //add another column to the food db (user ID)
        );

        // execute sql query + add userID
        let newrecord = [
          req.body.name,
          req.body.TypeVal,
          req.body.unit,
          req.body.carbs,
          req.body.fat,
          req.body.protein,
          req.body.salt,
          req.body.sugar,
          req.session.userId,
        ];
        db.query(sqlquery, newrecord, (err, result) => {
          if (err) {
            return console.error(err.message);
          } else
            res.send(
              " This ingredient " +
                req.body.name +
                " with the typical value per " +
                req.body.TypeVal +
                " and its unit is " +
                req.body.unit +
                ". Carbs value of " +
                req.body.carbs +
                ", fat value is " +
                req.body.fat +
                ", protein value is " +
                req.body.protein +
                ", salt value is " +
                req.body.salt +
                " and sugar value is " +
                req.body.sugar +
                ". It has been created by " +
                req.session.userId +
                ". <a href=" +
                "./" +
                ">Home</a>"
            );
        });
      }
    }
  );

  // ------------------------------- SEARCH FOOD AND SEARCH RESULT ROUTES
  app.get("/search", function (req, res) {
    res.render("searchfood.ejs", appData);
  });

  app.get(
    "/search-result",
    //validated
    [check("keyword").isLength({ min: 1 }).notEmpty().escape()],
    function (req, res) {
      const errors = validationResult(req);
      console.log(errors);
      //If the field is empty it gets redirected to search page
      if (!errors.isEmpty()) {
        res.redirect("/search");
      } else {
        console.log(req.query);
        //searching in the database and sanitisation
        let sqlquery =
          "SELECT * FROM food WHERE FoodName LIKE '%" +
          req.query.keyword +
          "%'";
        // query database to get all the food
        console.log("Query: " + req.query.keyword);

        // execute sql query
        db.query(sqlquery, (err, result) => {
          if (err) {
            res.redirect("./");
          }
          //Returns the foood the user has searched for
          let newData = Object.assign({}, appData, { availableFood: result });
          console.log(newData);
          res.render("list.ejs", newData);
        });
      }
    }
  );

  // -------------------------------UPDATE FOOD ROUTES
  app.get("/updateSearch", redirectLogin, function (req, res) {
    res.render("updateSearch.ejs", appData);
  });

  //displays food searched from update
  app.get(
    "/updateFood",
    redirectLogin,
    [check("keyword").isLength({ min: 1 }).notEmpty().escape()],
    function (req, res) {
      const errors = validationResult(req);
      console.log(errors);
      //If the field is empty it gets redirected to search page
      if (!errors.isEmpty()) {
        //res.redirect("/updateFood");
        res.redirect("https://www.doc.gold.ac.uk/usr/433/updateFood");
      } else {
        console.log(req.query);
        //searching in the database and sanitisation
        let sqlquery = `SELECT * FROM food WHERE FoodName ="${req.query.keyword}"`;
        // query database to get all the food
        console.log("Query: " + req.query.keyword);

        // execute sql query
        db.query(sqlquery, (err, result) => {
          if (err) {
            res.redirect("./");
          }
          //Returns the foood the user has searched for
          let newData = Object.assign({}, appData, { availableFood: result });
          console.log(newData);
          res.render("updateForm.ejs", newData);
        });
      }
    }
  );

  //update form
  app.get("/updateForm", redirectLogin, function (req, res) {
    res.render("updateForm.ejs", appData);
  });

  app.post(
    "/updated",
    redirectLogin,
    [
      check("name").notEmpty().isLength({ min: 1 }),
      check("TypeVal").isInt().isLength({ min: 1 }),
      check("unit").notEmpty().isLength({ min: 1 }),
      check("carbs").isInt().isLength({ min: 1 }),
      check("fat").isInt().isLength({ min: 1 }),
      check("protein").isInt().isLength({ min: 1 }),
      check("salt").isInt().isLength({ min: 1 }),
      check("sugar").isInt().isLength({ min: 1 }),
    ],
    function (req, res) {
      const errors = validationResult(req);
      //If the field is empty it gets redirected to addfood
      if (!errors.isEmpty()) {
        res.redirect("https://www.doc.gold.ac.uk/usr/433/addFood");
        //res.redirect("/updated");
      } else {
        // sanitises data before saving data in database
        let sqlquery = req.sanitize(
          `UPDATE FOOD SET FoodName=?, TypeVal=?, Unit=?, Carbs=?, Fat=?, Protein=?, Salt=?, Sugar=?, userId=? WHERE FoodName=? AND userId=?`
          //add another column to the food db (user ID)
        );

        // execute sql query + add userID
        let newrecord = [
          req.body.name,
          req.body.TypeVal,
          req.body.unit,
          req.body.carbs,
          req.body.fat,
          req.body.protein,
          req.body.salt,
          req.body.sugar,
          req.session.userId,
          req.body.name,
          req.session.userId,
        ];
        db.query(sqlquery, newrecord, (err, result) => {
          if (err) {
            return console.error(err.message);
          } else
            res.send(
              " This ingredient " +
                req.body.name +
                " with the typical value per " +
                req.body.TypeVal +
                " and its unit is " +
                req.body.unit +
                ". Carbs value of " +
                req.body.carbs +
                ", fat value is " +
                req.body.fat +
                ", protein value is " +
                req.body.protein +
                ", salt value is " +
                req.body.salt +
                " and sugar value is " +
                req.body.sugar +
                ". has been updated " +
                ". <a href=" +
                "./" +
                ">Home</a>"
            );
        });
      }
    }
  );

  // -------------------------------DELETE FOOD ROUTE
  app.get("/delete", redirectLogin, function (req, res) {
    res.render("delete.ejs", appData);
  });

  app.post(
    "/deleted",
    redirectLogin,
    [check("name").isLength({ min: 1 })],
    function (req, res) {
      const errors = validationResult(req);
      //If the field is empty it gets redirected to delete page
      if (!errors.isEmpty()) {
        res.redirect("https://www.doc.gold.ac.uk/usr/433/delete");
        //res.redirect("/delete");
      } else {
        const foodName = req.sanitize(req.body.name);
        //query for deleting food based on ID
        //instead of using req.session.userId, "?" is used as the query is making a prepared statement
        //and a a prepared statement uses ? as values
        let sqlQuery = `DELETE FROM food WHERE foodName=? AND USERID=?`;
        //db.query takes 3 arguments, one query, the values we want to pass into the query and we want to do with the query which can either give us an error or a result
        db.query(
          sqlQuery,
          [foodName, req.session.userId],
          function (err, result) {
            if (err) throw err;

            //if the input username does not exist it will give the following message
            if (result.affectedRows === 0) {
              res.send(
                "The food you have entered either does not exist or it has been added by another user! Therefore, you cannot delete another user's food <a href=" +
                  "./" +
                  ">Home</a>"
              );
            }

            //if it exists, it will delete it
            else {
              FG;
              res.send(
                "Record has been deleted! <a href=" + "./" + ">Home</a>"
              );
            }
          }
        );
      }
    }
  );

  // -------------------------------lIST FOOD ROUTE
  app.get("/list", function (req, res) {
    // query database to get all the food
    let sqlquery = "SELECT * FROM food";
    // execute sql query
    db.query(sqlquery, (err, result) => {
      if (err) {
        res.redirect("./");
      }
      //Returns all the food added to the database
      let newData = Object.assign({}, appData, { availableFood: result });
      console.log(newData);
      res.render("list.ejs", newData);
    });
  });

  // -------------------------------API
  //GET
  //API route
  //https://www.doc.gold.ac.uk/usr/433/api?keyword=flour
  //Compared to the list route it's output in JSON format
  //ejs file not required as well
  app.get("/api", function (req, res) {
    // Query database to get all the food
    let sqlquery = "SELECT * FROM food";

    //feature to the API to allow a parameter to add a search term
    if (req.query.keyword !== undefined) {
      sqlquery =
        "SELECT * FROM food WHERE FoodName LIKE '%" + req.query.keyword + "%'";
    }
    // Execute the sql query
    db.query(sqlquery, (err, result) => {
      if (err) {
        res.redirect("./");
      } else {
        // Return results as a JSON object
        res.json(result);
      }
    });
  });

  //POST
  //Instruction example: 
  //curl -X POST -H "Content-Type: application/json" -d '{"FoodName": "banana", "TypeVal": 4, "Unit": "cup", "Carbs": 3, "Fat": 2, "Protein": 5, "Salt": 3, "Sugar": 3, "USERID": "username"}' https://www.doc.gold.ac.uk/usr/433/api/food
  app.post("/api/food", (req, res) => {
    const FoodName = req.body.name;
    const TypeVal = req.body.TypeVal;
    const Unit = req.body.unit;
    const Carbs = req.body.carbs;
    const Fat = req.body.fat;
    const Protein = req.body.protein;
    const Salt = req.body.salt;
    const Sugar = req.body.sugar;
    const username = req.session.username;

    //inserting into the database
    let sqlQuery = `INSERT INTO food (FoodName, TypeVal, Unit, Carbs, Fat, Protein, Salt, Sugar, USERID) VALUES (?,?,?,?,?,?,?,?,?)`;
    const foodInfo = [
      FoodName,
      TypeVal,
      Unit,
      Carbs,
      Fat,
      Protein,
      Salt,
      Sugar,
      username,
    ];
    db.query(sqlQuery, foodInfo, (err, result) => {
      if (err) {
        res.send("Food cannot be added to the database");
      } else {
        res.send("Food has been added to the database");
      }
    });
  });

  //PUT
  //instruction example
  //curl -X PUT -H "Content-Type: application/json" -d '{"FoodName": "banana", "TypeVal": 4, "Unit": "cup", "Carbs": 3, "Fat": 2, "Protein": 5, "Salt": 3, "Sugar": 3, "USERID": "username"}' http://localhost:3000/api/food/FoodName
  app.put("/api/food/FoodName", (req, res) => {
    // Parse the item data and id from the request body and params
    const FoodName = req.body.name;
    const TypeVal = req.body.TypeVal;
    const Unit = req.body.unit;
    const Carbs = req.body.carbs;
    const Fat = req.body.fat;
    const Protein = req.body.protein;
    const Salt = req.body.salt;
    const Sugar = req.body.sugar;
    const username = req.session.userId;

    //inserting into the database
    let sqlquery = `UPDATE food SET FoodName=?, TypeVal=?, Unit=?, Carbs=?, Fat=?, Protein=?, Salt=?, Sugar=?, userId=? WHERE FoodName=? AND userId=?`;
    const foodInfo = [
      FoodName,
      TypeVal,
      Unit,
      Carbs,
      Fat,
      Protein,
      Salt,
      Sugar,
      username,
    ];

    db.query(sqlQuery, foodInfo, (error, results) => {
      if (err) {
        // If there was an error, send an error message
        res.send("Error updating food");
      } else {
        // If the query was successful, send food has been updated message
        res.send("The food " + FoodName + " has been updated!");
      }
    });
  });

  //DELETE
  //Instruction examples
  //https://www.doc.gold.ac.uk/usr/433/food/:FoodName
  app.delete("/food/:FoodName", (req, res) => {
    db.query(
      "DELETE FROM food WHERE FoodName = ?",
      [req.body.name],
      (err, rows, fields) => {
        if (!err) res.send("Deleted!!!!");
        else console.log(err);
      }
    );
  });
};
