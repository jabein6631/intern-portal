const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({
  origin: "*"
}));

app.use(express.json());

// TEST ROUTE
app.get("/", (req, res) => {
  res.json({ status: "Backend Running" });
});

// LOGIN ROUTE
app.post("/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Missing fields" });
  }

  let role = "intern";

  if (email.toLowerCase().includes("mentor")) {
    role = "mentor";
  } else if (email.toLowerCase().includes("admin")) {
    role = "admin";
  } else if (email.toLowerCase().includes("institution")) {
    role = "institution";
  }

  return res.json({
    token: "demo-token",
    user: {
      email,
      role
    }
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});