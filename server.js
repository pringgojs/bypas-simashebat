const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const PORT = 3000; // Port di mana server akan berjalan

// Middleware untuk parsing body request
app.use(express.json()); // Mendukung data JSON
app.use(express.urlencoded({ extended: true })); // Mendukung data URL-encoded

app.post("/bypass-api", async (req, res) => {
  const { username, password } = req.body; // Hanya ambil username dan password dari body POST

  if (!username || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Username dan password diperlukan" });
  }

  try {
    // URL tujuan yang dilindungi oleh Cloudflare
    // const targetUrl = "https://simashebat.ponorogo.go.id/simple-login-api.php";
    const targetUrl = "https://simashebat.ponorogo.go.id";

    // Luncurkan Puppeteer
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Akses URL tujuan
    await page.goto(targetUrl, { waitUntil: "networkidle2" });

    // Kirim POST request langsung ke API setelah melewati proteksi Cloudflare
    const response = await page.evaluate(async () => {
      const url = "https://simashebat.ponorogo.go.id/simple-login-api.php"; // URL API

      // Buat FormData
      const formData = new FormData();
      formData.append("username", username); // Ganti dengan username yang benar
      formData.append("password", password); // Ganti dengan password yang benar
      formData.append("domain", "simashebat.ponorogo.go.id"); // Jika diperlukan
      console.log(formData);

      // Konversi FormData ke format yang bisa dikirim dengan fetch
      const data = new URLSearchParams([...formData.entries()]);

      // Kirim POST request
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: data,
      });

      // Ambil status dan headers dari response
      const status = response.status;
      const headers = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      const responseText = await response.text();

      return {
        status,
        headers,
        responseText,
      };
    });

    console.log(response);
    // Tutup browser
    await browser.close();

    // Kirim respon ke aplikasi Anda
    // res.status(200).json({ success: true, data: response });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mem-bypass Cloudflare",
      error,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
