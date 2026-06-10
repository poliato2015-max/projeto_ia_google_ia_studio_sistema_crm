/**
 * Validação de telefone celular brasileiro
 * - Conformidade com DDDs da ANATEL
 * - Detecção de sequências óbvias e números de teste
 * - Validação via libphonenumber-js
 */

import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

// DDDs válidos no Brasil conforme ANATEL
const VALID_BR_DDDS = new Set([
  // São Paulo
  11, 12, 13, 14, 15, 16, 17, 18, 19,
  // Rio de Janeiro
  21, 22, 24,
  // Espírito Santo
  27, 28,
  // Minas Gerais
  31, 32, 33, 34, 35, 37, 38,
  // Paraná
  41, 42, 43, 44, 45, 46,
  // Santa Catarina
  47, 48, 49,
  // Rio Grande do Sul
  51, 53, 54, 55,
  // Distrito Federal / Goiás (parte)
  61,
  // Goiás
  62, 64,
  // Tocantins
  63,
  // Mato Grosso
  65, 66,
  // Mato Grosso do Sul
  67,
  // Acre
  68,
  // Rondônia
  69,
  // Bahia
  71, 73, 74, 75, 77,
  // Sergipe
  79,
  // Pernambuco
  81, 87,
  // Alagoas
  82,
  // Paraíba
  83,
  // Rio Grande do Norte
  84,
  // Ceará
  85, 88,
  // Piauí
  86, 89,
  // Pará
  91, 93, 94,
  // Amazonas
  92, 97,
  // Roraima
  95,
  // Amapá
  96,
  // Maranhão
  98, 99,
]);

/**
 * Detecta sequências óbvias inválidas num bloco de dígitos:
 * - Todos os dígitos idênticos  (ex: 999999999)
 * - Sequência crescente de 6+   (ex: 123456...)
 * - Sequência decrescente de 6+ (ex: 987654...)
 */
function hasObviousSequence(digits: string): boolean {
  // Todos os dígitos iguais
  if (/^(\d)\1+$/.test(digits)) return true;

  // 5 ou mais dígitos consecutivos iguais (ex: 999997878)
  if (/(\d)\1{4,}/.test(digits)) return true;

  let asc = 1;
  let desc = 1;

  for (let i = 1; i < digits.length; i++) {
    const curr = parseInt(digits[i]);
    const prev = parseInt(digits[i - 1]);

    if (curr === prev + 1) {
      asc++;
      if (asc >= 6) return true;
    } else {
      asc = 1;
    }

    if (curr === prev - 1) {
      desc++;
      if (desc >= 6) return true;
    } else {
      desc = 1;
    }
  }

  return false;
}

export interface PhoneValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Valida um número de celular brasileiro completo.
 * Retorna { valid: true } ou { valid: false, error: mensagem }.
 */
export function validateBrazilianCellPhone(phone: string): PhoneValidationResult {
  const digits = phone.replace(/\D/g, '');

  // 1. Deve ter exatamente 11 dígitos (2 DDD + 9 número)
  if (digits.length !== 11) {
    return { valid: false, error: 'Informe o DDD + 9 dígitos do celular.' };
  }

  // 2. Validar DDD conforme ANATEL
  const ddd = parseInt(digits.slice(0, 2), 10);
  if (!VALID_BR_DDDS.has(ddd)) {
    return { valid: false, error: `DDD ${ddd} não é válido no Brasil.` };
  }

  // 3. Celular brasileiro deve iniciar com 9 após o DDD
  if (digits[2] !== '9') {
    return { valid: false, error: 'Celular deve iniciar com 9 após o DDD.' };
  }

  // 4. Detectar sequências óbvias no número completo e na parte do número
  const numberPart = digits.slice(2); // os 9 dígitos após o DDD
  if (hasObviousSequence(digits) || hasObviousSequence(numberPart)) {
    return { valid: false, error: 'Número de celular inválido ou de teste.' };
  }

  // 5. Validação final via libphonenumber-js (estrutura E.164 brasileira)
  try {
    const fullNumber = `+55${digits}`;
    if (!isValidPhoneNumber(fullNumber, 'BR')) {
      return { valid: false, error: 'Número de celular inválido.' };
    }
  } catch {
    return { valid: false, error: 'Número de celular inválido.' };
  }

  return { valid: true };
}

/**
 * Aplica máscara de celular brasileiro enquanto o usuário digita.
 * Formato: (XX) 9XXXX-XXXX
 */
export function maskBrazilianPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}
