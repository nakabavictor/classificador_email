import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- NOVO: Importações para o Banco de Dados ---
import sequelize from './config/database.js';
import Classification from './models/classificador.js';
// ---------------------------------------------

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

// --- ROTA MODIFICADA: Agora ela também salva no banco ---
app.post('/api/classificador', async (req, res) => {
  try {
    const { emailText } = req.body;
    if (!emailText) {
      return res.status(400).json({ error: 'O texto do e-mail é obrigatório.' });
    }

    const prompt = `
      Classifique o seguinte e-mail como 'Produtivo' ou 'Improdutivo' e sugira uma resposta curta e adequada.
      Formato da sua resposta (use exatamente este formato):
      Classificação: [categoria]
      Resposta Sugerida: [resposta]
      ---
      E-mail para classificar:
      "${emailText}"
    `;

    const result = await model.generateContent(prompt);
    const aiResponse = await result.response.text();

    const lines = aiResponse.split('\n');
    const classification = lines[0].replace('Classificação: ', '').trim();
    const suggestedResponse = lines[1].replace('Resposta Sugerida: ', '').trim();

    // --- NOVO: Salva o resultado no banco de dados ---
    try {
      await Classification.create({
        emailText,
        classification,
        suggestedResponse,
      });
    } catch (dbError) {
      console.error('Erro ao salvar no banco de dados:', dbError);
      // Continua mesmo se der erro no DB, para não quebrar a experiência do usuário
    }
    // ------------------------------------------------

    res.json({
      classification,
      suggestedResponse,
    });

  } catch (error) {
    console.error('Erro ao chamar a API do Gemini:', error);
    res.status(500).json({ error: 'Ocorreu um erro no servidor ao processar sua solicitação.' });
  }
});

// --- NOVA ROTA: Para buscar todas as classificações salvas ---
app.get('/api/classificador', async (req, res) => {
  try {
    const classificacoes = await Classification.findAll({
      order: [['createdAt', 'DESC']] // Ordena pelas mais recentes primeiro
    });
    res.json(classificacoes);
  } catch (error) {
    console.error('Erro ao buscar classificações:', error);
    res.status(500).json({ error: 'Erro ao buscar dados do banco.' });
  }
});
// ---------------------------------------------------------

const PORT = process.env.PORT || 3001;

// --- NOVO: Sincroniza o banco de dados antes de iniciar o servidor ---
sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Servidor rodando e escutando na porta http://localhost:${PORT}` );
    console.log('✅ Banco de dados sincronizado.');
  });
}).catch(err => {
  console.error('❌ Não foi possível sincronizar o banco de dados:', err);
});
