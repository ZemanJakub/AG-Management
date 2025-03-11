// modules/avaris/services/nameCompareUtils.ts

/**
 * Funkce pro normalizaci jména -- odstraňuje přebytečné mezery a převádí text na malá písmena
 */
export function normalizeName(name: string): string {
  if (!name) return '';
  
  let normalizedName = name.trim().toLowerCase();
  
  // Náhrada více mezer za jednu
  while (normalizedName.includes('  ')) {
    normalizedName = normalizedName.replace('  ', ' ');
  }
  
  return normalizedName;
}

/**
 * Funkce pro výpočet Levenshteinovy vzdálenosti mezi dvěma řetězci
 * Měří počet změn potřebných pro transformaci jednoho řetězce na druhý
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
 * @returns Skóre podobnosti a informace o typu shody
 */
export function compareNames(name1: string, name2: string, threshold: number = 2): {
  score: number;
  exactMatch: boolean;
  safeMatch: boolean;
} {
  // Normalizace jmen pro porovnání
  const normalized1 = normalizeName(name1);
  const normalized2 = normalizeName(name2);
  
  // Kontrola absolutní shody
  if (normalized1 === normalized2) {
    return { score: 100, exactMatch: true, safeMatch: true };
  }
  
  // Rozdělení na části
  const parts1 = normalized1.split(' ');
  const parts2 = normalized2.split(' ');
  
  // Kontrola shody příjmení (první část)
  if (parts1.length === 0 || parts2.length === 0 || parts1[0] !== parts2[0]) {
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
 * Převod data z Excelu na JavaScript Date
 */
export function excelDateToJsDate(excelDate: number): Date {
  // Excel epocha začíná 1.1.1900, ale JS epocha začíná 1.1.1970
  // Navíc Excel má chybu, kde 1900 je považován za přestupný rok
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const excelEpoch = new Date(1900, 0, 1);
  
  // Odečtení 1 dne pro opravu chyby Excel přestupného roku (pokud je datum po 28.2.1900)
  let daysSinceEpoch = excelDate - 1;
  
  if (excelDate >= 60) {
    daysSinceEpoch--; // Korekce pro chybu přestupného roku 1900
  }
  
  const msFromEpoch = daysSinceEpoch * millisecondsPerDay;
  return new Date(excelEpoch.getTime() + msFromEpoch);
}

/**
 * Převod Excel času na JavaScript Date
 */
export function excelTimeToJsDate(excelTime: number): Date {
  // Excel čas je reprezentován jako desetinná část dne (0.5 = 12 hodin)
  const millisecondsInDay = 24 * 60 * 60 * 1000;
  const date = new Date(0); // 1970-01-01
  
  const milliseconds = Math.round(excelTime * millisecondsInDay);
  date.setUTCMilliseconds(milliseconds);
  
  return date;
}

/**
 * Formátování času z JS Date na řetězec ve formátu "HH:MM"
 */
export function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}