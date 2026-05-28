import { Deal } from './supabase';

/**
 * Calcula automaticamente o Índice de Saúde (Health Score) de um negócio (de 0 a 100)
 * baseado em melhores práticas de mercado e comportamento do funil de vendas.
 * 
 * Fatores considerados:
 * 1. Atraso na Data de Fechamento Prevista (Até -35 pontos)
 * 2. Idade do Negócio / Estagnação no Funil (Até -20 pontos)
 * 3. Incoerência entre Estágio e Probabilidade (Até -15 pontos)
 * 4. Status de Engajamento do Contato Relacionado (Até -30 pontos)
 */
export function calculateDealHealthScore(deal: Partial<Deal>): number {
  // Negócios já fechados têm saúde total (resolvidos)
  if (deal.stage === 'Fechado') {
    return 100;
  }

  let score = 100;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Data Prevista de Fechamento (Proximidade ou Atraso)
  if (deal.expected_close_date) {
    const closeDate = new Date(deal.expected_close_date);
    closeDate.setHours(0, 0, 0, 0);

    const diffTime = closeDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      // Data prevista está no passado (Atrasado) - Risco Crítico
      score -= 35;
    } else if (diffDays <= 3) {
      // Falta muito pouco tempo para fechar o negócio (Urgente e no limite)
      score -= 15;
    }
  } else if (deal.stage !== 'Prospecção') {
    // Negócio já avançado que não possui data estimada de fechamento
    score -= 10;
  }

  // 2. Estagnação / Idade do Negócio no Pipeline
  const createdAtStr = deal.created_at || new Date().toISOString();
  const createdDate = new Date(createdAtStr);
  const diffDaysCreatedAt = Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDaysCreatedAt > 90) {
    // Negócio aberto há mais de 3 meses sem ser concluído (Estagnado)
    score -= 20;
  } else if (diffDaysCreatedAt > 60) {
    // Negócio aberto há mais de 2 meses
    score -= 10;
  } else if (diffDaysCreatedAt > 30) {
    // Negócio aberto há mais de 1 mês
    score -= 5;
  }

  // 3. Incoerência de Estágio vs. Probabilidade de Fechamento
  const prob = deal.probability ?? 0;
  if ((deal.stage === 'Proposta' || deal.stage === 'Negociação') && prob < 40) {
    // Estágio avançado de proposta/negociação, mas com nível de confiança muito baixo
    score -= 15;
  } else if ((deal.stage === 'Prospecção' || deal.stage === 'Qualificação') && prob > 80) {
    // Otimismo exagerado nos estágios iniciais de qualificação do lead
    score -= 10;
  } else if (prob === 0) {
    // Sem probabilidade atribuída comercialmente
    score -= 15;
  }

  // 4. Alinhamento e Saúde do Contato Relacionado
  if (deal.contact) {
    if (deal.contact.status === 'Inativo') {
      // O contato principal foi considerado inativo no sistema - Risco Máximo
      score -= 30;
    } else if (deal.contact.last_contact) {
      const lastContactDate = new Date(deal.contact.last_contact);
      const contactDiffDays = Math.floor((today.getTime() - lastContactDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (contactDiffDays > 15) {
        // Falta de contato / follow-up recente há mais de 15 dias (Cliente esfriando)
        score -= 15;
      }
    }
  }

  // Garante que o score se manteja estritamente no intervalo [0, 100]
  return Math.max(0, Math.min(100, score));
}
