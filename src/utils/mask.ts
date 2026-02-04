/**
 * 개인정보 마스킹 유틸리티
 * - 개인정보 보호법 제29조 (안전조치의무) 준수
 */

/**
 * 이름 마스킹
 * @example maskName('홍길동') // '홍*동'
 * @example maskName('김철수') // '김*수'
 * @example maskName('이수') // '이*'
 */
export function maskName(name: string): string {
  if (!name || name.length === 0) return '';
  if (name.length === 1) return name;
  if (name.length === 2) return name[0] + '*';
  return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
}

/**
 * 이메일 마스킹
 * @example maskEmail('test@example.com') // 'te**@example.com'
 * @example maskEmail('ab@test.com') // 'a**@test.com'
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email || '';
  const [local, domain] = email.split('@');
  if (local.length === 0) return email;
  if (local.length === 1) return local + '**@' + domain;
  if (local.length === 2) return local[0] + '**@' + domain;
  return local.slice(0, 2) + '**@' + domain;
}

/**
 * 전화번호 마스킹
 * @example maskPhone('010-1234-5678') // '010-****-5678'
 * @example maskPhone('01012345678') // '010****5678'
 */
export function maskPhone(phone: string): string {
  if (!phone) return '';
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length < 7) return phone;

  // 하이픈이 있는 경우
  if (phone.includes('-')) {
    const parts = phone.split('-');
    if (parts.length === 3) {
      return parts[0] + '-****-' + parts[2];
    }
  }

  // 하이픈이 없는 경우 (11자리 기준)
  if (digitsOnly.length === 11) {
    return digitsOnly.slice(0, 3) + '****' + digitsOnly.slice(7);
  }
  if (digitsOnly.length === 10) {
    return digitsOnly.slice(0, 3) + '***' + digitsOnly.slice(6);
  }

  return phone;
}
