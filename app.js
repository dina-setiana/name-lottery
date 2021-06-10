// Imports
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

// Static Files
app.use(express.static("public"));
// Specific folder example
// app.use('/css', express.static(__dirname + 'public/css'))
// app.use('/js', express.static(__dirname + 'public/js'))
// app.use('/img', express.static(__dirname + 'public/images'))

// Set View's
app.set("views", "./views");
app.set("view engine", "ejs");

//Configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Navigation
const fs = require("fs");

function readNames(callback) {
  fs.readFile("./public/names.json", "utf8", function (err, data) {
    if (err) {
      console.log(err);
    } else {
      let names = JSON.parse(data);
      callback(names);
    }
  });
}

function writeNamesSync(names) {
  fs.writeFileSync(
    "./public/names.json",
    JSON.stringify(names, null, 2),
    "utf8"
  );
}

app.get("/", (req, res) => {
  readNames(function (names) {
    res.render("index", { nameList: names });
  });
});

app.post("/add-name", (req, res) => {
  const postData = {
    name: req.body.name,
    status: "waiting",
  };
  // TODO check duplicate
  readNames(function(names) {
    names.push(postData);
    writeNamesSync(names);
    res.json(postData);
  });
});

app.get("/delete-name/:name", (req, res) => {
  const getData = req.params.name;
  console.log(getData);
  readNames(function (names) {
    const filteredNames = [];
    Object.keys(names).forEach(index => {
      if (names[index].name != getData) filteredNames.push(names[index]);
    });

    writeNamesSync(filteredNames);
    res.json({
      result: "OK"
    });
  })
});

app.get("/set-complete/:name", (req, res) => {
  const getData = req.params.name;
  console.log(getData);
  readNames(function (names) {
    const selectedIndex = Object.keys(names).find(index => names[index].name == getData);
    names[selectedIndex].status = "completed";
    writeNamesSync(names);
    res.json({
      result: "OK",
      ...names[selectedIndex]
    });
  })
});

app.get("/reset-all/", (req, res) => {
  readNames(function (names) {
    Object.keys(names).forEach(index => names[index].status = "waiting");
    writeNamesSync(names);
    res.json({
      result: "OK",
      ...names
    });
  })
});

app.listen(port, () => console.info(`App listening on port ${port}`));
