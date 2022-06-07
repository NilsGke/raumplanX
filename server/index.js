const path = require("path");
require("dotenv").config();
const express = require("express");
const PORT = process.env.PORT || 3001;
const app = express();

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, "../client/build")));

if (process.env.USE_DB == "true") {
  console.log("\x1b[36m%s\x1b[0m", "Using Database!");
  app.use("/api", require("./dbBackend"));
} else {
  console.log(
    "\x1b[31m%s\x1b[0m",
    "\nUsing local json-file storage!\nOnly for development!\n"
  ); //cyan
  app.use("/api", require("./localBackend"));
}
// All other GET requests not handled before will return our React app
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`🌎 ==> API server now listening on port ${PORT}!`);
});
