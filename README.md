# 🤖 Executive Lens — CRM com Google AI Studio

> Plataforma de CRM para líderes que buscam clareza, precisão e performance em tempo real — desenvolvida com Google AI Studio (Gemini), Supabase e Vercel.

[![Google AI Studio](https://img.shields.io/badge/Built%20with-Google%20AI%20Studio-orange)](https://aistudio.google.com)
[![Gemini](https://img.shields.io/badge/IA-Gemini-blue)](https://ai.google.dev)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-3ECF8E?logo=supabase)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com)
[![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow)]()

---

## 📋 Sobre o projeto

O **Executive Lens** nasceu de uma decisão pessoal de aprender o **Google AI Studio na prática** — não apenas assistindo aulas, mas construindo algo real e funcional do zero.

O Gemini foi utilizado como **copiloto de desenvolvimento** em todas as etapas: geração do frontend, arquitetura do banco de dados, boas práticas de segurança e integração entre as camadas. O resultado é uma plataforma completa de CRM com autenticação, gestão de contatos, pipeline de negócios, métricas de performance e central de tarefas.

> *"Aprendi mais errando em cada etapa do que qualquer tutorial poderia ensinar."*

---

## 🎯 Objetivos de aprendizado

| Camada | Tecnologia | O que aprendi |
|---|---|---|
| 🤖 **IA como Copiloto** | Google AI Studio + Gemini | Usar IA para gerar frontend, arquitetar banco de dados e resolver problemas técnicos em tempo real |
| 🗄️ **Banco de Dados** | Supabase | Criar e estruturar tabelas na nuvem, executar queries SQL e gerenciar dados relacionais |
| ☁️ **Deploy** | Vercel | Configurar pipeline de deploy contínuo integrado ao GitHub |
| 🔐 **Segurança** | .gitignore + Variáveis de Ambiente | Proteger credenciais sensíveis no repositório e no ambiente de produção |

---

## 🖥️ Funcionalidades desenvolvidas

### 1. Tela de Cadastro — Primeiro Acesso
Cadastro completo com validações em tempo real: nome, telefone, e-mail profissional e senha com requisitos de segurança (maiúscula, minúscula, número e caractere especial).

![Tela de Cadastro](https://raw.githubusercontent.com/poliato2015-max/imagens/main/projeto-ia-google-ia-studio-sistema.vercel.app_criar_conta.png)

---

### 2. Tela de Login
Acesso seguro com recuperação de senha e indicador de portal seguro.

![Tela de Login](https://raw.githubusercontent.com/poliato2015-max/imagens/main/projeto-ia-google-ia-studio-sistema.vercel.app_login.png)

---

### 3. Dashboard Executivo — Visão Geral
Painel central com métricas de receita pipeline, leads ativos, taxa de conversão e negócios abertos. Inclui gráfico de crescimento mensal de vendas, distribuição por status, tarefas prioritárias e feed de atividades em tempo real.

![Dashboard Executivo](https://raw.githubusercontent.com/poliato2015-max/imagens/main/projeto-ia-google-ia-studio-sistema.vercel.app_dashboard.png)

---

### 4. Gerenciamento de Contatos
Gestão completa do pipeline de leads e clientes com LTV total, status (Lead/Cliente/Inativo), último contato e valor por conta. Busca por nome, e-mail ou empresa.

![Gerenciamento de Contatos](https://raw.githubusercontent.com/poliato2015-max/imagens/main/projeto-ia-google-ia-studio-sistema.vercel.app_contatos.png)

---

### 5. Gerenciamento de Negócios
Pipeline de vendas com valor total, probabilidade de fechamento e status por negócio. Permite adicionar novos negócios e acompanhar o índice de saúde de cada oportunidade.

![Gerenciamento de Negócios](https://raw.githubusercontent.com/poliato2015-max/imagens/main/projeto-ia-google-ia-studio-sistema.vercel.app_negocios.png)

---

### 6. Métricas de Performance
Análise aprofundada com custo por lead, CAC total, taxa de retenção e ROI médio. Gráficos de evolução de conversão e composição do pipeline.

![Métricas de Performance](https://raw.githubusercontent.com/poliato2015-max/imagens/main/projeto-ia-google-ia-studio-sistema.vercel.app_metricas.png)

---

### 7. Central de Tarefas
Gerenciamento de atividades de acompanhamento com prioridades (Alta/Média/Baixa), datas de vencimento e alertas de atraso.

![Central de Tarefas](https://raw.githubusercontent.com/poliato2015-max/imagens/main/projeto-ia-google-ia-studio-sistema.vercel.app_tarefas.png)

---

## 🏗️ Arquitetura do projeto

```
┌─────────────────────────────────────────────┐
│         GOOGLE AI STUDIO (Gemini)           │
│   copiloto de desenvolvimento               │
│   geração de frontend + arquitetura DB      │
└──────────────────┬──────────────────────────┘
                   │ código gerado + orientações
                   ▼
┌─────────────────────────────────────────────┐
│         FRONTEND (Next.js + TypeScript)     │
│   interface do Executive Lens               │
│   7 módulos funcionais                      │
└──────────┬──────────────────────────────────┘
           │                    │
           ▼                    ▼
┌──────────────────┐   ┌────────────────────┐
│    SUPABASE      │   │      VERCEL        │
│  banco de dados  │   │  deploy do app     │
│  autenticação    │   │  hospedagem web    │
│  tabelas CRM     │   │  pipeline CI/CD    │
│  queries SQL     │   │  variáveis de env  │
└──────────────────┘   └────────────────────┘
```

---

## 🧠 Cicatrizes de aprendizado

**1. Segurança de credenciais com `.gitignore`**
Ao sincronizar o projeto com o GitHub, o próprio Gemini alertou sobre o risco de expor credenciais sensíveis no repositório. Aprendi a configurar o `.gitignore` para proteger arquivos de ambiente e a usar variáveis de ambiente no Vercel separando desenvolvimento de produção.

**2. Criar e estruturar tabelas no Supabase**
Já tinha experiência com consultas SQL em bancos relacionais, mas foi o primeiro contato com criação de tabelas na nuvem. Aprendi a modelar a estrutura do CRM no Supabase e validar os dados via queries SQL direto no painel.

**3. Configurar variáveis de ambiente no Vercel**
A chave da API do Gemini não pode ficar exposta no código. Aprendi a configurar as variáveis de ambiente no painel do Vercel em ambiente de desenvolvimento, garantindo que credenciais sensíveis fiquem fora do repositório.

---

## 🛠️ Tecnologias utilizadas

| Tecnologia | Uso no projeto |
|---|---|
| **Google AI Studio** | Copiloto de desenvolvimento — frontend, arquitetura e segurança |
| **Gemini (Google)** | LLM utilizado como assistente técnico ao longo do projeto |
| **Next.js + TypeScript** | Framework e linguagem do frontend |
| **Supabase** | Banco de dados, autenticação e backend |
| **Vercel** | Deploy e hospedagem |
| **GitHub** | Versionamento e integração com Vercel |

---

## 🔮 Próximas evoluções

- **Central de Ajuda com WhatsApp** — integração para captura automática de leads via WhatsApp, gravando o contato diretamente na base para o time comercial
- **Busca rápida global** — busca unificada na barra superior para contatos, negócios e tarefas
- **Notificações** — alertas em tempo real para vencimentos, novos leads e atividades
- **Configurações** — painel de configurações do usuário e da conta
- **Importação de bases** — upload de contatos e leads via CSV/Excel para a área comercial

---

## 👨‍💻 Autor

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Marcelo%20Poliato-0077B5?logo=linkedin)](https://www.linkedin.com/in/marcelo-poliato)
[![GitHub](https://img.shields.io/badge/GitHub-poliato2015--max-181717?logo=github)](https://github.com/poliato2015-max)
