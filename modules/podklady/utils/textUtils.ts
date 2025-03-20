// modules/common/utils/textUtils.ts
import { createLogger } from "@/modules/podklady/services/logger";

const logger = createLogger("text-utils");

/**
 * Normalizace jména -- odstraňuje přebytečné mezery, převádí text na malá písmena a volitelně odstraňuje diakritiku
 * @param name Vstupní jméno
 * @param removeDiacritics Zda odstranit diakritiku
 * @returns Normalizované jméno
 */
export function normalizeName(name: string, removeDiacritics: boolean = false): string {
  if (!name) return '';
  
  let normalizedName = String(name).trim().toLowerCase();
  
  // Náhrada více mezer za jednu
  while (normalizedName.includes('  ')) {
    normalizedName = normalizedName.replace('  ', ' ');
  }
  
  // Odstranění diakritiky, pokud je požadováno
  if (removeDiacritics) {
    normalizedName = removeDiacriticsFromText(normalizedName);
  }
  
  return normalizedName;
}

/**
 * Odstranění diakritiky z textu
 * @param text Vstupní text
 * @returns Text bez diakritiky
 */
export function removeDiacriticsFromText(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Funkce pro výpočet Levenshteinovy vzdálenosti mezi dvěma řetězci
 * Měří počet změn potřebných pro transformaci jednoho řetězce na druhý
 * @param s První řetězec
 * @param t Druhý řetězec
 * @returns Levenshteinova vzdálenost
 */
export function levenshtein(s: string, t: string): number {
  // Inicializace matice
  const d: number[][] = [];
  
  const n = s.length;
  const m = t.length;
  
  if (n === 0) return m;
  if (m === 0) return n;
  
  // Inicializace první řádky a prvního sloupce
  for (let i = 0; i <= n; i++) {
    d[i] = [i];
  }
  
  for (let j = 0; j <= m; j++) {
    d[0][j] = j;
  }
  
  // Výpočet vzdálenosti
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;
      
      d[i][j] = Math.min(
        d[i - 1][j] + 1,     // Smazání
        d[i][j - 1] + 1,     // Vložení
        d[i - 1][j - 1] + cost  // Náhrada nebo shoda
      );
    }
  }
  
  return d[n][m];
}

/**
 * Funkce pro porovnání jmen s váhováním
 * @param name1 První jméno
 * @param name2 Druhé jméno
 * @param threshold Práh pro "bezpečnou shodu"
 * @returns Výsledek porovnání
 */
export function compareNames(name1: string, name2: string, threshold: number = 2): {
  score: number;
  exactMatch: boolean;
  safeMatch: boolean;
} {
  // Normalizace jmen pro porovnání
  const normalized1 = normalizeName(name1, true);
  const normalized2 = normalizeName(name2, true);
  
  // Kontrola absolutní shody
  if (normalized1 === normalized2) {
    return { score: 100, exactMatch: true, safeMatch: true };
  }
  
  // Rozdělení na části
  const parts1 = normalized1.split(' ');
  const parts2 = normalized2.split(' ');
  
  // Kontrola shody příjmení (první část)
  if (parts1.length === 0 || parts2.length === 0 || parts1[0] !== parts2[0]) {
    // Dodatečná kontrola podobnosti příjmení
    if (parts1.length > 0 && parts2.length > 0) {
      const surnameDistance = levenshtein(parts1[0], parts2[0]);
      
      // Pokud jsou příjmení velmi podobná (maximálně 2 znaky rozdíl)
      if (surnameDistance <= 2) {
        // Nižší skóre pro podobná příjmení
        return { score: 60, exactMatch: false, safeMatch: true };
      }
    }
    
    return { score: 0, exactMatch: false, safeMatch: false };
  }
  
  // Případ, kdy jedno nebo obě jména obsahují jen příjmení
  if (parts1.length === 1 || parts2.length === 1) {
    if (parts1.length === 1 && parts2.length === 1) {
      // Obě jména obsahují jen příjmení, která se shodují
      return { score: 90, exactMatch: false, safeMatch: true };
    }
    
    // Jedno jméno má jen příjmení, druhé má i křestní jméno
    return { score: 70, exactMatch: false, safeMatch: true };
  }
  
  // Obě jména mají příjmení i křestní jméno
  // Porovnání křestních jmen (vše kromě prvního elementu, který je příjmení)
  const givenName1 = parts1.slice(1).join(' ');
  const givenName2 = parts2.slice(1).join(' ');
  
  const distance = levenshtein(givenName1, givenName2);
  
  // Bezpečná shoda, pokud je vzdálenost menší nebo rovna prahu
  const isSafeMatch = distance <= threshold;
  
  // Skóre na základě vzdálenosti (100 pro přesnou shodu, méně pro podobné)
  const score = isSafeMatch ? 100 - (distance * 10) : 0;
  
  return {
    score,
    exactMatch: false,
    safeMatch: isSafeMatch
  };
}

/**
 * Verze funkce compareNames s rozšířenou logikou pro detekci podobných příjmení
 * @param name1 První jméno
 * @param name2 Druhé jméno
 * @param threshold Práh pro "bezpečnou shodu"
 * @returns Výsledek porovnání
 */
export function compareNamesExtended(name1: string, name2: string, threshold: number = 2): {
  score: number;
  exactMatch: boolean;
  safeMatch: boolean;
} {
  // Normalizace jmen pro porovnání
  const normalized1 = normalizeName(name1, true);
  const normalized2 = normalizeName(name2, true);
  
  // Kontrola absolutní shody
  if (normalized1 === normalized2) {
    return { score: 100, exactMatch: true, safeMatch: true };
  }
  
  // Rozdělení na části (příjmení je první část)
  const parts1 = normalized1.split(' ');
  const parts2 = normalized2.split(' ');
  
  // Kontrola prázdných jmen
  if (parts1.length === 0 || parts2.length === 0) {
    return { score: 0, exactMatch: false, safeMatch: false };
  }
  
  // Extrahování příjmení (první část)
  const surname1 = parts1[0];
  const surname2 = parts2[0];
  
  // Vylepšená kontrola shody příjmení - porovnává také začátek příjmení
  // Toto pomůže se zkrácenými formami jako "Durich" vs "Duricha"
  const minSurnameLength = Math.min(surname1.length, surname2.length);
  const commonPrefixLength = 4; // Minimálně 4 znaky musí být stejné
  
  // Kontrola, zda jedno příjmení začíná druhým
  if (minSurnameLength >= commonPrefixLength && 
      (surname1.startsWith(surname2) || surname2.startsWith(surname1))) {
    // Možná zkrácená forma příjmení
    
    // Případ, kdy jedno nebo obě jména obsahují jen příjmení
    if (parts1.length === 1 || parts2.length === 1) {
      if (parts1.length === 1 && parts2.length === 1) {
        // Obě jména obsahují jen příjmení, která se částečně shodují
        return { score: 85, exactMatch: false, safeMatch: true };
      }
      
      // Jedno jméno má jen příjmení, druhé má i křestní jméno
      return { score: 65, exactMatch: false, safeMatch: true };
    }
    
    // Obě jména mají příjmení i křestní jméno
    // Porovnání křestních jmen (vše kromě prvního elementu, který je příjmení)
    const givenName1 = parts1.slice(1).join(' ');
    const givenName2 = parts2.slice(1).join(' ');
    
    const distance = levenshtein(givenName1, givenName2);
    
    // Bezpečná shoda, pokud je vzdálenost menší nebo rovna prahu
    const isSafeMatch = distance <= threshold;
    
    // Skóre na základě vzdálenosti (100 pro přesnou shodu, méně pro podobné)
    const score = isSafeMatch ? 90 - (distance * 10) : 0;
    
    return {
      score,
      exactMatch: false,
      safeMatch: isSafeMatch
    };
  }
  
  // Původní kontrola přesné shody příjmení
  if (surname1 !== surname2) {
    // Dodatečná kontrola podobnosti příjmení
    const surnameDistance = levenshtein(surname1, surname2);
    
    // Pokud jsou příjmení velmi podobná (maximálně 2 znaky rozdíl)
    if (surnameDistance <= 2) {
      // Podobná příjmení - dále kontrolujeme křestní jména
      if (parts1.length === 1 || parts2.length === 1) {
        return { score: 60, exactMatch: false, safeMatch: true };
      }
      
      // Obě jména mají i křestní jméno
      const givenName1 = parts1.slice(1).join(' ');
      const givenName2 = parts2.slice(1).join(' ');
      
      const distance = levenshtein(givenName1, givenName2);
      const isSafeMatch = distance <= threshold;
      
      // Nižší skóre kvůli rozdílům v příjmení
      const score = isSafeMatch ? 80 - (distance * 10) - (surnameDistance * 5) : 0;
      
      return {
        score,
        exactMatch: false,
        safeMatch: isSafeMatch
      };
    }
    
    return { score: 0, exactMatch: false, safeMatch: false };
  }
  
  // Případ, kdy jedno nebo obě jména obsahují jen příjmení
  if (parts1.length === 1 || parts2.length === 1) {
    if (parts1.length === 1 && parts2.length === 1) {
      // Obě jména obsahují jen příjmení, která se shodují
      return { score: 90, exactMatch: false, safeMatch: true };
    }
    
    // Jedno jméno má jen příjmení, druhé má i křestní jméno
    return { score: 70, exactMatch: false, safeMatch: true };
  }
  
  // Obě jména mají příjmení i křestní jméno
  // Porovnání křestních jmen (vše kromě prvního elementu, který je příjmení)
  const givenName1 = parts1.slice(1).join(' ');
  const givenName2 = parts2.slice(1).join(' ');
  
  const distance = levenshtein(givenName1, givenName2);
  
  // Bezpečná shoda, pokud je vzdálenost menší nebo rovna prahu
  const isSafeMatch = distance <= threshold;
  
  // Skóre na základě vzdálenosti (100 pro přesnou shodu, méně pro podobné)
  const score = isSafeMatch ? 100 - (distance * 10) : 0;
  
  return {
    score,
    exactMatch: false,
    safeMatch: isSafeMatch
  };
}