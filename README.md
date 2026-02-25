# NEW CARS - Premium Dealership App

Welcome to **NEW CARS**, a luxury car dealership web application built for high-performance and premium aesthetics.

## 🚀 Teclonogias Utilizadas

- **Frontend**: React + Vite + TypeScript
- **Styling**: Vanilla CSS (Premium & Minimalist)
- **Backend**: Supabase (Auth, Database, Storage)
- **Icons**: Lucide React
- **Charts**: Recharts

## 🛠️ Configuração Inicial

### 1. Supabase Setup

Para que o aplicativo funcione corretamente, você deve configurar um projeto no [Supabase](https://supabase.com/):

1. Crie um novo projeto no Supabase Dashboard.
2. No menu **SQL Editor**, cole e execute o conteúdo do arquivo `supabase_setup.sql` que está na raiz deste projeto. Isso criará todas as tabelas, permissões (RLS) e triggers necessários.
3. No menu **Storage**, crie dois Buckets:
   - `vehicles`: Marque como **Público** (para as fotos dos carros).
   - `documents`: Marque como **Privado** (para documentos sensíveis como CNH).
4. Vá em **Project Settings** > **API** e copie a `URL` e a `anon key`.

### 2. Ambiente Local

1. Renomeie o arquivo `.env` na raiz do projeto (ou crie um) e insira suas credenciais:
   ```env
   VITE_SUPABASE_URL=SUA_URL_AQUI
   VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_AQUI
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## 👥 Níveis de Acesso

O sistema possui 3 níveis de permissão:

- **Client**: Pode ver o catálogo, favoritar veículos e subir documentos.
- **Seller**: Pode gerenciar o estoque (CRUD de veículos) e ver relatórios.
- **Admin**: Acesso total, incluindo gestão de funcionários e troca de permissões.

> **Dica**: Ao se cadastrar pela primeira vez, seu usuário será `client`. Para testar o painel admin, você deve alterar manualmente o `role` para `admin` na tabela `profiles` diretamente no Supabase dashboard.

## ✨ Funcionalidades

- **Catálogo Inteligente**: Filtros por marca, ano e preço.
- **Galeria Slide**: Cada card de veículo possui um mini slider com 3+ fotos.
- **Painel Admin**: Dashboard com gráficos de vendas e receita mensal.
- **Gestão de Perfil**: Upload seguro de CNH via Supabase Storage.
- **Responsividade**: Experiência premium tanto em Mobile quanto Desktop.

---

Desenvolvido por Antigravity.
