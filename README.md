# Fatura Upload App

Tela simples para enviar um anexo de fatura e obter o valor a pagar.

## Como usar

### Opção 1: Node.js local

1. Instale o Node.js (inclui npm).
2. No terminal, execute:
   ```bash
   cd "c:\Users\guimf\OneDrive\Documentos\Teste Claude"
   npm install
   npm start
   ```
3. Abra o navegador em `http://localhost:3000`.
4. Selecione a fatura e envie.

### Opção 2: Docker

1. Instale o [Docker Desktop](https://www.docker.com/products/docker-desktop).
2. No terminal, execute:
   ```bash
   cd "c:\Users\guimf\OneDrive\Documentos\Teste Claude"
   docker-compose up
   ```
3. Abra o navegador em `http://localhost:3000`.

Para parar o container:
```bash
docker-compose down
```

## Detalhes

- A interface está em `public/index.html`.
- O backend está em `server.js`.
- Arquivos enviados são processados e removidos após o upload.
- Se o arquivo não puder ser analisado, o app retorna valor zerado.
- Suporta PDF e TXT.
