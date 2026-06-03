const fs = require('fs');
const path = require('path');
const { logger } = require('../middleware/logger');

/**
 * Parse a file (PDF or DOCX) and extract raw text content
 * @param {string} filePath - Path to the file
 * @param {string} originalName - Original filename (for extension detection)
 * @returns {Promise<string>} - Extracted text content
 */
async function parseFile(filePath, originalName) {
  const ext = path.extname(originalName).toLowerCase();

  try {
    if (ext === '.pdf') {
      return await parsePDF(filePath);
    } else if (ext === '.docx') {
      return await parseDOCX(filePath);
    } else {
      throw new Error(`Unsupported file type: ${ext}. Only PDF and DOCX are supported.`);
    }
  } catch (error) {
    logger.error(`Failed to parse file: ${originalName}`, { error: error.message });
    throw error;
  }
}

/**
 * Extract text from a PDF file
 */
async function parsePDF(filePath) {
  const pdfParse = require('pdf-parse');
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);

  if (!data.text || data.text.trim().length === 0) {
    throw new Error('Could not extract text from PDF. The file may be image-based or corrupted.');
  }

  logger.info(`PDF parsed successfully: ${data.numpages} pages, ${data.text.length} characters`);
  return cleanText(data.text);
}

/**
 * Extract text from a DOCX file
 */
async function parseDOCX(filePath) {
  const mammoth = require('mammoth');
  const result = await mammoth.extractRawText({ path: filePath });

  if (!result.value || result.value.trim().length === 0) {
    throw new Error('Could not extract text from DOCX. The file may be empty or corrupted.');
  }

  if (result.messages && result.messages.length > 0) {
    logger.warn('DOCX parsing warnings:', { warnings: result.messages });
  }

  logger.info(`DOCX parsed successfully: ${result.value.length} characters`);
  return cleanText(result.value);
}

/**
 * Clean extracted text by normalizing whitespace and removing artifacts
 */
function cleanText(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/ +/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

module.exports = { parseFile };
