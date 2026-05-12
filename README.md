# 🤖 CRM com Google AI Studio — Experimento de Aprendizado

> Protótipo de CRM com IA generativa desenvolvido para aprender na prática o ecossistema Google AI Studio, Supabase e Vercel — do primeiro prompt ao deploy.

[![IA Gemini](https://img.shields.io/badge/IA-Gemini-blue)](https://ai.google.dev)
[![Google AI Studio](https://img.shields.io/badge/Built%20with-Google%20AI%20Studio-orange)](https://aistudio.google.com)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-3ECF8E?logo=supabase)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com)
[![Status](https://img.shields.io/badge/Status-Prot%C3%B3tipo-yellow)]()

---

## 📋 Sobre o projeto

Este projeto nasceu de uma decisão pessoal de aprender o **Google AI Studio na prática** — não apenas assistindo aulas, mas construindo algo real do zero.

A ideia foi criar um protótipo de CRM com IA generativa e, ao longo do desenvolvimento, dominar cada camada do ecossistema: geração de prompts no AI Studio, estruturação do banco de dados no Supabase, execução de queries SQL e pipeline de deploy com Vercel.

> *"Aprendi mais errando em cada etapa do que qualquer tutorial poderia ensinar."*

---

## 🎯 Objetivos de aprendizado

Este projeto foi desenhado como uma jornada de aprendizado em 4 camadas:

| Camada | Tecnologia | O que aprendi |
|---|---|---|
| 🤖 **IA Generativa** | Google AI Studio + Gemini | Criar, testar e iterar prompts para aplicações reais |
| 🗄️ **Banco de Dados** | Supabase | Criar tabelas, executar queries SQL e entender estrutura de dados |
| ☁️ **Deploy** | Vercel | Configurar pipeline de deploy contínuo integrado ao GitHub |
| 🔗 **Integração** | Supabase + Vercel | Conectar backend ao frontend com variáveis de ambiente seguras |

---

## 🏗️ Arquitetura do projeto

```
┌─────────────────────────────────────────────┐
│         GOOGLE AI STUDIO                    │
│   criação e teste dos prompts de CRM        │
│   modelo: Gemini                            │
└──────────────────┬──────────────────────────┘
                   │ API Key + chamadas
                   ▼
┌─────────────────────────────────────────────┐
│         FRONTEND (gerado pelo AI Studio)    │
│   interface do CRM exportada do Studio      │
└──────────┬──────────────────────────────────┘
           │                    │
           ▼                    ▼
┌──────────────────┐   ┌────────────────────┐
│    SUPABASE      │   │      VERCEL        │
│  banco de dados  │   │  deploy do app     │
│  tabelas de CRM  │   │  hospedagem web    │
│  queries SQL     │   │  pipeline CI/CD    │
└──────────────────┘   └────────────────────┘
```

---

## 🧠 Cicatrizes de aprendizado

Situações reais que enfrentei e como resolvi:

**1. Configurar as variáveis de ambiente no Vercel**
A chave da API do Gemini não pode ficar exposta no código. Aprendi a configurar as variáveis de ambiente no painel do Vercel em ambiente de desenvolvimento, garantindo que credenciais sensíveis fiquem fora do repositório.

**2. Criar e estruturar tabelas no Supabase**
Já tinha experiência com consultas SQL em bancos relacionais, mas foi o primeiro contato com criação de tabelas na nuvem. Aprendi a modelar a estrutura do CRM no Supabase e validar os dados via queries SQL direto no painel.

**3. Conectar o frontend ao Supabase**
Entender como o frontend se comunica com o banco via Supabase Client — e como proteger as credenciais usando as chaves públicas (anon key) com RLS habilitado.

---

## 🛠️ Tecnologias utilizadas

| Tecnologia | Uso no projeto |
|---|---|
| **Google AI Studio** | Plataforma de criação e exportação do app com IA |
| **Gemini (Google)** | LLM para processamento dos dados de CRM |
| **Supabase** | Banco de dados, autenticação e backend |
| **Vercel** | Deploy e hospedagem do app |
| **TypeScript** | Linguagem do código exportado pelo AI Studio |
| **GitHub** | Versionamento e integração com Vercel |

---

## 🔮 Próximas evoluções

- Finalizar o deploy em produção com dados reais
- Adicionar autenticação de usuários via Supabase Auth
- Criar painel de visualização de clientes com histórico de interações
- Evoluir o prompt de CRM para respostas mais estruturadas por perfil de cliente

---

## 👨‍💻 Autor

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Marcelo%20Poliato-0077B5?logo=linkedin)](https://www.linkedin.com/in/marcelo-poliato)
[![GitHub](https://img.shields.io/badge/GitHub-poliato2015--max-181717?logo=github)](https://github.com/poliato2015-max)
