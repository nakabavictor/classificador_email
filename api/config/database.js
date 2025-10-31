import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

//truque para obter o __dirname quando usa ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sequelize = new Sequelize({
  dialect: 'sqlite',
  // O banco de dados será um arquivo chamado 'database.sqlite' na raiz da pasta 'api'
  storage: path.join(__dirname, '..', 'database.sqlite'),
  logging: false // Desativa os logs do SQL
});

export default sequelize;
