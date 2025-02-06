# Menggunakan image Node.js versi 16
FROM node:16

# Menentukan direktori aplikasi di dalam container
WORKDIR /usr/src/app

# Menyalin file package.json dan package-lock.json ke dalam container
COPY package*.json ./

# Menginstal dependensi aplikasi
RUN npm install

# Menyalin seluruh kode aplikasi ke dalam container
COPY . .

# Menentukan port yang digunakan aplikasi
EXPOSE 3000

# Menjalankan aplikasi
CMD ["node", "server.js"]
