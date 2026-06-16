const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const upload = multer({ dest: path.join(__dirname, 'uploads/') });
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.post('/upload', upload.single('invoice'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  }

  try {
    const filePath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();
    let amount = null;
    let content = '';

    if (ext === '.txt' || ext === '.csv' || req.file.mimetype.startsWith('text/')) {
      content = await fs.promises.readFile(filePath, 'utf8');
    } else {
      // Para PDF, imagem, ou outro formato, retornamos uma mensagem
      return res.status(400).json({ 
        error: 'Por favor, envie um arquivo TXT com o conteúdo da fatura. Você pode copiar e colar o texto do PDF no Bloco de Notas.' 
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
