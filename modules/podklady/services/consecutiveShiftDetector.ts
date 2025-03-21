// modules/podklady/services/consecutiveShiftDetector.ts
import { ShiftData } from "./excelDataExtractor";
import { StructuredLogger } from "./structuredLogger";

const logger = StructuredLogger.getInstance().getComponentLogger("consecutive-shift-detector");

/**
 * Funkce pro detekci navazujících směn - implementuje přesnou logiku Excel makra
 * @param shifts Seznam směn zaměstnanců 
 * @returns Informace o navazujících směnách
 */
export function detectConsecutiveShifts(shifts: ShiftData[]): { 
  consecutiveShifts: { first: ShiftData; second: ShiftData }[];
  shiftsWithConsecutive: number;
} {
  logger.info("Detekuji navazující směny podle logiky Excel makra", {
    totalShifts: shifts.length
  });
  
  const consecutiveShifts: { first: ShiftData; second: ShiftData }[] = [];
  let shiftsWithConsecutive = 0;
  
  // 1. Seskupení směn podle zaměstnanců
  const employeeShifts = new Map<string, ShiftData[]>();
  for (const shift of shifts) {
    if (!employeeShifts.has(shift.name)) {
      employeeShifts.set(shift.name, []);
    }
    employeeShifts.get(shift.name)!.push(shift);
  }
  
  logger.info("Směny seskupeny podle zaměstnanců", {
    uniqueEmployees: employeeShifts.size
  });
  
  // Práh pro navazující směny (30 minut) - stejné jako v Excel makru
  const threshold = 30 * 60 * 1000; // 30 minut v milisekundách
  
  // 2. Procházení směn pro každého zaměstnance
  for (const [employeeName, employeeShiftList] of Array.from(employeeShifts.entries())) {
    // Pokud zaměstnanec má pouze jednu směnu, přeskočit
    if (employeeShiftList.length <= 1) {
      logger.debug(`Zaměstnanec má pouze jednu směnu, přeskakuji`, {
        employee: employeeName,
        shiftsCount: employeeShiftList.length
      });
      continue;
    }
    
    // Seřazení směn podle plánovaného začátku (přesně jako v Excel makru)
    employeeShiftList.sort((a, b) => {
      if (!a.plannedStart || !b.plannedStart) return 0;
      
      const aDateTime = new Date(a.date);
      aDateTime.setHours(a.plannedStart.getHours());
      aDateTime.setMinutes(a.plannedStart.getMinutes());
      aDateTime.setSeconds(0);
      
      const bDateTime = new Date(b.date);
      bDateTime.setHours(b.plannedStart.getHours());
      bDateTime.setMinutes(b.plannedStart.getMinutes());
      bDateTime.setSeconds(0);
      
      return aDateTime.getTime() - bDateTime.getTime();
    });
    
    logger.debug(`Směny zaměstnance seřazeny`, {
      employee: employeeName,
      shiftsCount: employeeShiftList.length
    });
    
    // Kontrola navazujících směn
    for (let i = 0; i < employeeShiftList.length - 1; i++) {
      const current = employeeShiftList[i];
      const next = employeeShiftList[i + 1];
      
      // Přeskočit směny bez plánovaných časů
      if (!current.plannedEnd || !next.plannedStart) {
        logger.debug(`Směny nemají plánované časy, přeskakuji`, {
          employee: employeeName,
          currentShiftRowIndex: current.rowIndex,
          nextShiftRowIndex: next.rowIndex
        });
        continue;
      }
      
      // Výpočet koncového času první směny
      let endDateTime = new Date(current.date);
      endDateTime.setHours(current.plannedEnd.getHours());
      endDateTime.setMinutes(current.plannedEnd.getMinutes());
      endDateTime.setSeconds(0);
      
      // Pokud jde o noční směnu (konec je dříve než začátek), přidáme 1 den
      if (current.plannedStart && current.plannedEnd.getHours() < current.plannedStart.getHours()) {
        endDateTime.setDate(endDateTime.getDate() + 1);
        logger.debug(`Úprava koncového času pro noční směnu`, {
          employee: employeeName,
          shiftIndex: i,
          rowIndex: current.rowIndex,
          adjustedEndTime: formatDateTime(endDateTime)
        });
      }
      
      // Výpočet začátku druhé směny
      let nextStartDateTime = new Date(next.date);
      nextStartDateTime.setHours(next.plannedStart.getHours());
      nextStartDateTime.setMinutes(next.plannedStart.getMinutes());
      nextStartDateTime.setSeconds(0);
      
      // Kontrola, zda druhá směna začíná do 30 minut po konci první směny
      const timeDiff = nextStartDateTime.getTime() - endDateTime.getTime();
      
      if (timeDiff >= 0 && timeDiff <= threshold) {
        // Označení směn jako navazující (přesně jako v Excel makru)
        current.hasConsecutiveShift = true;
        next.isSecondPartOfConsecutive = true;
        
        // Přidání do výsledku
        consecutiveShifts.push({ first: current, second: next });
        shiftsWithConsecutive += 2;
        
        logger.info(`Detekována navazující směna`, { 
          employee: employeeName, 
          firstShiftRowIndex: current.rowIndex, 
          firstShiftTime: formatDateTime(current), 
          secondShiftRowIndex: next.rowIndex, 
          secondShiftTime: formatDateTime(next),
          timeDiffMinutes: Math.round(timeDiff / 60000) // převod na minuty pro lepší čitelnost
        });
      } else {
        logger.debug(`Směny nejsou navazující`, {
          employee: employeeName,
          timeDiffMinutes: Math.round(timeDiff / 60000),
          threshold: threshold / 60000, // v minutách
          firstShiftRowIndex: current.rowIndex,
          secondShiftRowIndex: next.rowIndex
        });
      }
    }
  }
  
  logger.info(`Detekce navazujících směn dokončena`, { 
    consecutivePairsCount: consecutiveShifts.length, 
    shiftsWithConsecutive
  });
  
  return { consecutiveShifts, shiftsWithConsecutive };
}

/**
 * Pomocná funkce pro formátovaný výpis směny
 */
function formatDateTime(shift: ShiftData | Date): string {
  if (shift instanceof Date) {
    return shift.toLocaleString('cs-CZ', { 
      year: 'numeric', 
      month: 'numeric', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
  
  const dateStr = shift.date.toLocaleDateString('cs-CZ');
  const startStr = shift.plannedStart ? shift.plannedStart.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
  const endStr = shift.plannedEnd ? shift.plannedEnd.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
  return `${dateStr} ${startStr}-${endStr}`;
}

/**
 * Generuje HTML report s detaily o navazujících směnách
 * @param consecutiveShifts Pole navazujících směn
 * @returns HTML kód reportu
 */
export function generateConsecutiveShiftsReport(
  consecutiveShifts: { first: ShiftData; second: ShiftData }[]
): string {
  // Příprava dat pro report
  const reportData = consecutiveShifts.map(pair => {
    const { first, second } = pair;
    
    // Formátování času
    const formatTime = (date?: Date) => {
      if (!date) return "N/A";
      return date.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
    };
    
    // Formátování datumu
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('cs-CZ');
    };
    
    return {
      name: first.name,
      firstDate: formatDate(first.date),
      firstStart: formatTime(first.plannedStart),
      firstEnd: formatTime(first.plannedEnd),
      secondDate: formatDate(second.date),
      secondStart: formatTime(second.plannedStart),
      secondEnd: formatTime(second.plannedEnd)
    };
  });

  logger.info("Generuji HTML report navazujících směn", {
    pairsCount: consecutiveShifts.length
  });

  // Generování HTML
  let html = `
    <h2>Detekované navazující směny</h2>
    <p>Celkový počet navazujících směn: <strong>${consecutiveShifts.length}</strong></p>
  `;
  
  if (consecutiveShifts.length > 0) {
    html += `
      <table border="1" cellspacing="0" cellpadding="5">
        <tr>
          <th>Zaměstnanec</th>
          <th>První směna</th>
          <th>Konec</th>
          <th>Druhá směna</th>
          <th>Začátek</th>
        </tr>
    `;
    
    reportData.forEach(item => {
      html += `
        <tr>
          <td>${item.name}</td>
          <td>${item.firstDate}</td>
          <td>${item.firstEnd}</td>
          <td>${item.secondDate}</td>
          <td>${item.secondStart}</td>
        </tr>
      `;
    });
    
    html += `</table>`;
  } else {
    html += `<p>Nebyly nalezeny žádné navazující směny.</p>`;
  }
  
  return html;
}