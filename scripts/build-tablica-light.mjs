#!/usr/bin/env node
// Strażnik 2026-10-18: lumina-tablica-light.html jest GENEROWANA z lumina-tablica.html.
// Jedno źródło kodu tablicy — wariant jasny różni się wyłącznie zablokowanym motywem jasnym
// (style jasne pochodzą z /css/lumina-light-edition.css, tak jak po przełączeniu motywu).
// Nie edytuj lumina-tablica-light.html ręcznie — zmieniaj lumina-tablica.html.
import fs from 'node:fs';
const src = fs.readFileSync('lumina-tablica.html', 'utf8');
const eol = src.match(/\r?\n/)?.[0] ?? '\n';
const marker = '<!-- PLIK GENEROWANY przez scripts/build-tablica-light.mjs z lumina-tablica.html — nie edytuj ręcznie -->';
const out = src.replace(/<html(\s[^>]*)?>/i, (m, attrs = '') => {
  const clean = String(attrs).replace(/\sdata-lumina-theme(-lock)?="[^"]*"/g, '');
  return `<html${clean} data-lumina-theme="light" data-lumina-theme-lock="light">${eol}${marker}`;
});
if (out === src || !out.includes('data-lumina-theme-lock="light"')) throw new Error('Nie znaleziono <html> w lumina-tablica.html');
const prev = fs.existsSync('lumina-tablica-light.html') ? fs.readFileSync('lumina-tablica-light.html', 'utf8') : '';
if (prev !== out) fs.writeFileSync('lumina-tablica-light.html', out);
console.log(prev === out ? 'lumina-tablica-light.html: bez zmian' : 'lumina-tablica-light.html: wygenerowano z lumina-tablica.html');
