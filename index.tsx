
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

console.log("React sedang memulai proses render...");

const rootElement = document.getElementById('root');
const loaderElement = document.getElementById('initial-loader');

if (!rootElement) {
  console.error("Gagal menemukan elemen #root!");
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  // Hapus loader setelah React mulai bekerja
  if (loaderElement) {
    setTimeout(() => {
        loaderElement.style.opacity = '0';
        setTimeout(() => loaderElement.remove(), 500);
    }, 500);
  }
  
  console.log("Render berhasil dieksekusi!");
} catch (error) {
  console.error("Terjadi error saat merender aplikasi:", error);
}
