# Fatura Upload App

Tela simples para enviar um anexo de fatura e obter o valor a pagar.

## Como usar

1. Instale o Node.js (inclui npm).
2. No terminal, execute:
   ```bash
   cd "c:\Users\guimf\OneDrive\Documentos\Teste Claude"
   npm install
   npm start
   ```
3. Abra o navegador em `http://localhost:3000`.
4. Selecione a fatura e envie.

## Detalhes

- A interface está em `public/index.html`.
- O backend está em `server.js`.
- Arquivos enviados são processados e removidos após o upload.
- Se o arquivo não puder ser analisado, o app retorna um valor padrão de `R$ 149,90`.
