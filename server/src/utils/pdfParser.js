const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

async function parseFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.pdf') {
    return parsePDF(filePath);
  } else if (ext === '.docx') {
    return parseDocx(filePath);
  } else if (ext === '.txt') {
    return parseTxt(filePath);
  }
  throw new Error(`不支持的文件格式: ${ext}`);
}

async function parsePDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return cleanText(data.text);
}

async function parseDocx(filePath) {
  const result = await mammoth.extractRawText({ path: filePath });
  return cleanText(result.value);
}

function parseTxt(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return cleanText(content);
}

function cleanText(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

module.exports = { parseFile };
