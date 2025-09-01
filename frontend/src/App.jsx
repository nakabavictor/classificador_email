import { useState, useEffect } from 'react'; // 1. Importe useEffect
import './App.css';

function App() {
  const [emailText, setEmailText] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 2. Novo estado para o histórico
  const [history, setHistory] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null); // Para controlar o item clicado

  // 3. Função para buscar o histórico da API
  const fetchHistory = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/classificador' );
      if (!response.ok) {
        throw new Error('Não foi possível buscar o histórico.');
      }
      const data = await response.json();
      setHistory(data);
    } catch (err) {
      console.error('Erro ao buscar histórico:', err);
      // Não mostraremos um erro de histórico na tela principal para não poluir
    }
  };

  // 4. useEffect para buscar o histórico quando o componente carregar
  useEffect(() => {
    fetchHistory();
  }, []); // O array vazio [] garante que isso rode apenas uma vez

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setResult(null);
    setError('');

    if (!emailText.trim()) {
      setError('Por favor, insira o texto de um e-mail para classificar.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/classificador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailText } ),
      });

      if (!response.ok) {
        throw new Error('A resposta da rede não foi OK.');
      }

      const data = await response.json();
      setResult(data);
      
      // 5. Após o sucesso, atualiza o histórico
      fetchHistory(); 
      setEmailText(''); // Limpa a textarea após o envio

    } catch (err) {
      console.error('Falha ao buscar dados:', err);
      setError('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para truncar o texto
  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + '...';
  };

  // Filtra o histórico em duas listas
  const produtivoEmails = history.filter(item => item.classification === 'Produtivo');
  const improdutivoEmails = history.filter(item => item.classification === 'Improdutivo');

  return (
    <div className="App">
      <header className="App-header">
        {/* ... (a parte do formulário continua igual) ... */}
        <h1>Classificador de E-mails com IA 🤖</h1>
        <p>Cole o texto de um e-mail abaixo e nossa IA irá classificá-lo e sugerir uma resposta.</p>
        
        <form onSubmit={handleSubmit} className="email-form">
          <textarea
            value={emailText}
            onChange={(e) => setEmailText(e.target.value)}
            placeholder="Cole o texto do e-mail aqui..."
            rows="10"
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Analisando...' : 'Classificar E-mail'}
          </button>
        </form>

        {error && <p className="error-message">{error}</p>}

        {result && (
          <div className="result-container">
            <h2>Resultado da Análise:</h2>
            <p>
              <strong>Classificação:</strong> 
              <span className={`classification ${result.classification?.toLowerCase()}`}>
                {result.classification}
              </span>
            </p>
            <p><strong>Resposta Sugerida:</strong></p>
            <p className="suggested-response">"{result.suggestedResponse}"</p>
          </div>
        )}
      </header>

      {/* --- NOVA SEÇÃO: Histórico de Classificações --- */}
      <main className="history-section">
        <h2>Histórico</h2>
        <div className="history-columns">
          {/* Coluna de E-mails Produtivos */}
          <div className="history-column">
            <h3>Produtivos ({produtivoEmails.length})</h3>
            <ul>
              {produtivoEmails.map((item) => (
                <li key={item.id} onClick={() => setSelectedItem(item)}>
                  {truncateText(item.emailText, 20)}
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna de E-mails Improdutivos */}
          <div className="history-column">
            <h3>Improdutivos ({improdutivoEmails.length})</h3>
            <ul>
              {improdutivoEmails.map((item) => (
                <li key={item.id} onClick={() => setSelectedItem(item)}>
                  {truncateText(item.emailText, 20)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      {/* --- NOVO: Modal para exibir os detalhes --- */}
      {selectedItem && (
        <div className="modal-backdrop" onClick={() => setSelectedItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedItem(null)}>X</button>
            <h3>Detalhes do E-mail</h3>
            <h4>E-mail Completo:</h4>
            <p className="modal-email-text">{selectedItem.emailText}</p>
            <h4>Resposta Sugerida:</h4>
            <p className="suggested-response">"{selectedItem.suggestedResponse}"</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
