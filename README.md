# 🤖 CRM Inteligente com Google AI Studio

> Assistente de CRM com IA generativa — enriquece dados de clientes, sugere próximos passos e automatiza interações usando Gemini via Google AI Studio.

[![Status Live](https://img.shields.io/badge/Status-Live-brightgreen)](https://projeto-ia-google-ia-studio-sistema.vercel.app)
[![IA Gemini](https://img.shields.io/badge/IA-Gemini%202.0-blue)](https://ai.google.dev)
[![Built with AI Studio](https://img.shields.io/badge/Built%20with-Google%20AI%20Studio-orange)](https://ai.google.dev/aistudio)

---

## 🌐 Acesse o projeto

**App publicado:** https://projeto-ia-google-ia-studio-sistema.vercel.app

**Repositório:** https://github.com/poliato2015-max/projeto_ia_google_ia_studio_sistema_crm

---

## 📋 Sobre o projeto

Este projeto foi desenvolvido como parte do desafio prático do curso de Inteligência Artificial da [DIO](https://www.dio.me) — explorando o uso de **LLMs generativos aplicados à gestão de relacionamento com clientes (CRM)**.

O **CRM Inteligente** é uma aplicação web que utiliza o modelo Gemini do Google para processar informações de clientes e gerar respostas contextualizadas, sugestões de abordagem e automação de interações — reduzindo o tempo de análise manual e aumentando a qualidade do atendimento.

---

## 🎯 Problema que resolve

Equipes de vendas e atendimento enfrentam diariamente:

- Excesso de dados de clientes sem contexto útil
- Dificuldade em personalizar abordagens em escala
- Tempo perdido redigindo respostas repetitivas
- Falta de visibilidade sobre o próximo melhor passo com cada cliente

Com o CRM Inteligente, o usuário descreve o contexto do cliente e recebe imediatamente sugestões inteligentes geradas por IA — direto no navegador, sem configuração complexa.

---

## 🏗️ Arquitetura do projeto

```
┌─────────────────────────────────────────────┐
│           USUÁRIO (Atendente/Vendedor)      │
│     descreve o contexto do cliente          │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│         FRONTEND (Next.js + React)          │
│   interface de entrada e exibição           │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│      GOOGLE AI STUDIO — GEMINI API          │
│   processa o contexto e gera resposta       │
│   via prompt engineering estruturado        │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│         RESPOSTA ESTRUTURADA                │
│  análise do cliente + próximos passos + IA  │
└─────────────────────────────────────────────┘
```

---

## 🛠️ Tecnologias utilizadas

| Tecnologia | Uso |
|---|---|
| **Google AI Studio** | Plataforma de desenvolvimento e deploy da IA |
| **Gemini 2.0** | LLM para processamento das consultas de CRM |
| **Next.js + React** | Framework frontend |
| **TypeScript** | Tipagem e qualidade do código |
| **Vercel** | Hospedagem e deploy contínuo |
| **Supabase** | Backend e banco de dados |
| **GitHub** | Versionamento do código |

---

## 💡 Funcionalidades

- Entrada de contexto livre sobre o cliente (texto natural)
- Geração de análise inteligente com Gemini via prompt estruturado
- Sugestões de próximo passo personalizadas por perfil
- Interface web responsiva e de fácil uso
- Deploy contínuo via Vercel

---

## 🧠 Aprendizados do projeto

| Tema | O que aprendi |
|---|---|
| **Google AI Studio** | Como criar, testar e exportar apps com LLMs sem infraestrutura própria |
| **Engenharia de Prompts** | Estruturar prompts para gerar respostas consistentes em formato CRM |
| **Integração via API** | Conectar o Gemini API a um frontend Next.js com variáveis de ambiente seguras |
| **Deploy com Vercel** | Pipeline de deploy automático integrado ao GitHub |

---

## ⚙️ Como executar localmente

**Pré-requisitos:** Node.js instalado

```bash
# Clone o repositório
git clone https://github.com/poliato2015-max/projeto_ia_google_ia_studio_sistema_crm

# Acesse a pasta
cd projeto_ia_google_ia_studio_sistema_crm

# Instale as dependências
npm install

# Configure a chave de API
# Crie um arquivo .env.local e adicione:
# GEMINI_API_KEY=sua_chave_aqui

# Inicie o servidor de desenvolvimento
npm run dev
```

> Obtenha sua chave gratuita em: https://aistudio.google.com/apikey

---

## 🔮 Próximas evoluções

- **Histórico de clientes** — salvar e recuperar interações anteriores por cliente
- **Integração com planilhas** — importar base de clientes via CSV/Excel
- **Painel de métricas** — visualização de padrões e tendências nas interações
- **RAG real** — conectar documentos internos como base de conhecimento do CRM

---

## 👨‍💻 Autor

Desenvolvido como desafio prático do curso de IA da [DIO](https://www.dio.me).

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Marcelo%20Poliato-0077B5?logo=linkedin)](https://www.linkedin.com/in/marcelo-poliato)
[![GitHub](https://img.shields.io/badge/GitHub-poliato2015--max-181717?logo=github)](https://github.com/poliato2015-max)
