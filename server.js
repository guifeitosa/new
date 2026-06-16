const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const PDFParse = require('pdf-parse');

const app = express();
const upload = multer({ dest: path.join(__dirname, 'uploads/') });
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = await fs.promises.readFile(filePath);
    const data = await PDFParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('Erro ao extrair texto do PDF:', error.message);
    return '';
  }
}

app.post('/upload', upload.single('invoice'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  }

  try {
    const filePath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();
    let amount = null;
    let content = '';

    if (ext === '.pdf' || req.file.mimetype === 'application/pdf') {
      content = await extractTextFromPDF(filePath);
      console.log('Texto extraído do PDF:');
      console.log(content);
      console.log('---');
    } else if (ext === '.txt' || ext === '.csv' || req.file.mimetype.startsWith('text/')) {
      content = await fs.promises.readFile(filePath, 'utf8');
    } else {
      return res.status(400).json({ 
        error: 'Formato não suportado. Envie PDF ou TXT.' 
      });
    }

    if (content) {
      amount = parseAmountFromText(content);
    }

    if (amount === null) {
      amount = 0;
    }

    res.json({ amount, message: 'Fatura processada com sucesso.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao processar o arquivo.' });
  } finally {
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, () => {});
    }
  }
});

function parseAmountFromText(text) {
  const patterns = [
    /total\s+da\s+fatura[:\s]+R\$?\s*([0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]{2})?)/gi,
    /pagamento\s+total[:\s]+R\$?\s*([0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]{2})?)/gi,
    /total\s+a\s+pagar[:\s]+R\$?\s*([0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]{2})?)/gi,
    /total\s*[:\s]+R\$?\s*([0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]{2})?)/gi,
    /R\$\s*([0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]{2})?)/gi,
    /valor\s*[:\-]?\s*R\$?\s*([0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]{2})?)/gi
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match && match[1]) {
      const raw = match[1].replace(/\./g, '').replace(/,/g, '.');
      const value = parseFloat(raw);
      if (!Number.isNaN(value) && value > 0) {
        return Math.round(value * 100) / 100;
      }
    }
  }

  return null;
}

app.listen(port, () => {
  console.log(`Servidor ativo em http://localhost:${port}`);
});
