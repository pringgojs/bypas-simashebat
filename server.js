const express = require("express");
const puppeteer = require("puppeteer");
const fs = require("fs");

const app = express();
app.use(express.json()); // Untuk menangani request dengan JSON body
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username dan password harus diisi!" });
  }
  const browser = await puppeteer.launch({ headless: true }); // Gunakan headless: false agar bisa melihat prosesnya
  const page = await browser.newPage();

  // 1️⃣ Buka halaman login untuk mendapatkan session dan cookie
  await page.goto("https://simashebat.ponorogo.go.id/login", {
    waitUntil: "networkidle2",
  });

  // 2️⃣ Ambil semua cookie setelah halaman terbuka
  const cookies = await page.cookies();

  // 3️⃣ Buat request ke API login menggunakan cookie yang sudah didapat
  const response = await page.evaluate(
    async (cookies, username, password) => {
      const res = await fetch(
        "https://simashebat.ponorogo.go.id/simple-login-api.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Cookie: cookies.map((c) => `${c.name}=${c.value}`).join("; "), // Kirim cookie agar lolos Cloudflare
          },
          body: new URLSearchParams({
            username: username,
            password: password,
          }),
        }
      );
      // console.log("user", username, "pass", password);

      return res.json();
    },
    cookies,
    username,
    password
  );

  await browser.close();
  return res.status(200).json(response);
});

app.post("/", async (req, res) => {
  return res.status(200).json({ success: "working well!" });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
