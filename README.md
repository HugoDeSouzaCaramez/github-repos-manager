# 📦 Gerenciamento de Repositórios do GitHub

Este projeto é uma aplicação web completa para **pesquisa**, **exportação** e **importação** de repositórios do GitHub, com **processamento assíncrono** de dados utilizando **RabbitMQ**.

---

## 🛠 Tecnologias Utilizadas

- **Frontend:** React com TypeScript  
- **Backend:** NestJS com TypeScript  
- **Banco de Dados:** MariaDB  
- **Fila de Mensagens:** RabbitMQ  
- **Infraestrutura:** Docker  
- **Versão do Docker:** 28.1.1  

---

## ✨ Funcionalidades

### 📄 Tela 1: Pesquisa e Exportação
- Pesquisa de usuários do GitHub
- Visualização de repositórios (nome, proprietário, estrelas)
- Exportação de dados para CSV
- Filtros e ordenação na tabela

### 📥 Tela 2: Importação e Visualização
- Importação de arquivos CSV
- Visualização de dados importados em tabela
- Notificação em tempo real do status de importação
- Persistência de dados no banco MariaDB

---

## ⚙️ Backend

- Processamento assíncrono com RabbitMQ
- Workers dedicados para importação de arquivos
- API REST para operações com GitHub
- Notificações em tempo real via WebSocket

---

## 📋 Pré-requisitos

- Docker (versão **28.1.1** ou superior)
- Docker Compose
- Token de acesso do GitHub (opcional, configurável via `.env`)

---

## 🚀 Como Executar o Projeto

1. **Clone o repositório:**

```bash
git https://github.com/HugoDeSouzaCaramez/github-repos-manager.git
cd repositorio
```


2. **Execute os serviços com Docker Compose:**

```bash
docker compose up
```

3. **Acesse as aplicações:**

- Frontend: http://localhost:3001
- Backend (API): http://localhost:3000
- RabbitMQ Management: http://localhost:15672 (usuário: user, senha: password)
- GUI de banco de dados: http://localhost:8080

## 🔄 Fluxo de Importação
1. Usuário faz upload de arquivo CSV

2. Backend cria um job e envia para a fila RabbitMQ

3. Worker processa o arquivo e salva no banco de dados

4. Notificação é enviada via WebSocket para o frontend

5. Interface é atualizada automaticamente com os dados importados

## 📝 Observações
O projeto utiliza volumes Docker para persistência de dados.

Use o token do GitHub que está pré-configurado no arquivo .env (pode ser substituído).

O frontend se reconecta automaticamente em caso de falha na WebSocket.

Docker versão 28.1.1 foi utilizada durante o desenvolvimento.

## 📝 Dúvidas, problemas ou sugestões
Para dúvidas, problemas ou sugestões, contate: hugodesouzacaramez@gmail.com

