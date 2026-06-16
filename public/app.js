const form = document.getElementById('invoice-form');
const status = document.getElementById('status');
const result = document.getElementById('result');

form.addEventListener('submit', async event => {
  event.preventDefault();
  status.textContent = 'Enviando arquivo...';
  result.textContent = '';

  const fileInput = document.getElementById('invoice-file');
  const file = fileInput.files[0];
  if (!file) {
    status.textContent = 'Selecione um arquivo antes de enviar.';
    return;
  }

  const formData = new FormData();
  formData.append('invoice', file);

  try {
    const response = await fetch('/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      status.textContent = data.error || 'Erro ao enviar arquivo.';
      return;
    }

    status.textContent = data.message;
    result.innerHTML = `<strong>Valor a pagar no mês:</strong> R$ ${data.amount.toFixed(2)}`;
  } catch (error) {
    status.textContent = 'Falha na conexão. Tente novamente.';
  }
});
