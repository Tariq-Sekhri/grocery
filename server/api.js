// server/api.js
const express = require("express");
const pgp = require("pg-promise")();
const cn = require("./DatabaseAccess.js");
const crypto = require("crypto");
const bodyParser = require("body-parser");
const sendMail = require("./email.js");
const email = require("./email.js");
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const db = pgp(cn);

const port = 3000;

app.post("/sendEmail", async (req, res) => {
  const mailOptions = {
    from: email,
    to: req.query.toemail,
    subject: req.query.subject,
    text: req.query.text,
  };
  sendMail(mailOptions, (error, result) => {
    if (error) {
      res.status(500).json({ error: "Failed to send mail" });
    } else {
      res.status(200).json({ message: result });
    }
  });
});

app.post("/login", async (req, res) => {
  const username = req.query.username;
  const password = req.query.password;
  const data = await db.any(
    "SELECT * FROM users WHERE username = $1 AND password = $2",
    [username, password]
  );
  res.json({
    loggedIn: data.length > 0 ? true : false,
  });
});

app.post("/logout", async (req, res) => {
  const session_token = req.query.session_token;
  const data = await db.any("DELETE FROM session WHERE session_token = $1", [
    session_token,
  ]);
  res.json({
    loggedIn: false,
  });
});

app.post("/addItem", async (req, res) => {
  const location_id = req.query.location_id;
  const user_id = req.query.user_id;
  const quantity = req.query.quantity;
  const name = req.query.name;
  const price = req.query.price;

  try {
    const insertResult = await db.any(
      `INSERT INTO item (location_id, user_id, name, price,quantity) VALUES ($1, $2, $3, $4, $5)`,
      [location_id, user_id, name, price, quantity]
    );

    res.json({
      success: true,
      message: "Insert operation was successful",
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Insert operation failed: " + error.message,
    });
  }
});

app.post("/getLocations", async (req, res) => {
  const locations = await db.any("SELECT * FROM location");
  res.json({
    list: locations,
  });
});

app.post("/addLocation", async (req, res) => {
  const name = req.query.name;
  const address = req.query.address;

  try {
    const insertResult = await db.any(
      `INSERT INTO location (name, address)
VALUES ($1, $2);`,
      [name, address]
    );

    res.json({
      success: true,
      message: "Insert operation was successful",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Insert operation failed: " + error.message,
    });
  }
});

app.post("/updateLocation", async (req, res) => {
  const location_id = req.query.location_id;
  const name = req.query.name;
  const address = req.query.address;

  try {
    const updateResult = await db.any(
      `UPDATE location SET name = $1, address = $2 WHERE location_id = $3`,
      [name, address, location_id]
    );

    res.json({
      success: true,
      message: "Update operation was successful",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Update operation failed: " + error.message,
    });
  }
});

app.post("/getListByLocation", async (req, res) => {
  const location_id = req.query.location_id;

  const data = await db.any("SELECT * FROM item WHERE location_id = $1", [
    location_id,
  ]);
  res.json({
    list: data,
  });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running at http://localhost:${port}`);
});

app.post("/newDevice", async (req, res) => {
  console.log(`New device`);
  let device_token;
  let selectRes;
  try {
    do {
      device_token = crypto.randomBytes(20).toString("hex");

      selectRes = await db.any(
        `SELECT * FROM device WHERE device_token = '${device_token}'`
      );
    } while (selectRes.length > 0);

    await db.any(
      `INSERT INTO device (device_token) VALUES ('${device_token}')`
    );

    res.status(200).json({ device_token: device_token, known_device: true });
  } catch (error) {
    console.error("Error creating new device:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/checkdevice_token", async (req, res) => {
  const device_token = req.query.device_token;

  // Check if the token exists in the devices table
  const selectRes = await db.any(
    `SELECT * FROM device WHERE device_token = '${device_token}'`
  );

  if (selectRes.length > 0) {
    res.status(200).json({ known_device: true });
  } else {
    res.status(200).json({ known_device: false });
  }
});

//--------------------------------------
app.post("/newSession", async (req, res) => {
  let sessionToken;
  do {
    sessionToken = crypto.randomBytes(20).toString("hex");

    selectRes = await db.any(
      `SELECT * FROM session WHERE session_token = '${sessionToken}'`
    );
  } while (selectRes.length > 0);

  await db.any(`INSERT INTO device (device_token) VALUES ('${sessionToken}')`);

  res.status(200).json({ valid_session: valid_session, valid_session: false });
});

app.post("/checkSessionToken", async (req, res) => {
  const sessionToken = req.query.sessionToken;

  // Check if the token exists in the devices table
  const selectRes = await db.any(
    `SELECT * FROM device WHERE device_token = '${sessionToken}'`
  );

  if (selectRes.length > 0) {
    res.status(200).json({ valid_session: true });
  } else {
    res.status(200).json({ valid_session: false });
  }
});

app.post("/sessionVerify", async (req, res) => {
  const session_token = req.query.session_token;
  const data = await db.any("SELECT * FROM session WHERE session_token = $1", [
    session_token,
  ]);

  if (data.length > 0) {
    const session = data[0];
    const currentTime = new Date();
    const expirationDate = new Date(session.expiration_date);

    if (currentTime > expirationDate) {
      await db.any("DELETE FROM session WHERE session_token = $1", [
        session_token,
      ]);
      res.json({ loggedIn: false });
    } else {
      res.json({ loggedIn: true });
    }
  } else {
    res.json({ loggedIn: false });
  }
});

app.post("/appStart", async (req, res) => {
  const known_device = await getKnownDevice(req.query.device_token);
  const valid_session = await getSessionValidity(req.query.session_token);

  res.json({
    known_device: known_device,
    valid_session: known_device ? valid_session : false,
    message: known_device && valid_session ? "send to list" : "send to log in",
  });
});

async function getKnownDevice(device_token) {
  const data = await db.any("SELECT * FROM device WHERE device_token = $1", [
    device_token,
  ]);
  return data.length > 0;
}

async function getSessionValidity(session_token) {
  const data = await db.any("SELECT * FROM session WHERE session_token = $1", [
    session_token,
  ]);
  return data.length > 0;
}
