// modules/avaris/services/logger.ts
import fs from 'fs/promises';
import path from 'path';

// Typy log úrovní
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Interface pro logger
export interface Logger {
  debug: (message: string, ...meta: any[]) => void;
  info: (message: string, ...meta: any[]) => void;
  warn: (message: string, ...meta: any[]) => void;
  error: (message: string, ...meta: any[]) => void;
}

// Konstanta pro cestu k logovacím souborům
const LOG_DIR = path.join(process.cwd(), 'logs');

// Konfigurace loggeru - může být rozšířena pro různé prostředí
const config = {
  logToConsole: true,
  logToFile: true,
  // Defaultní úroveň logování
  defaultLevel: 'info' as LogLevel,
  // Mapování úrovní na čísla pro snazší filtrování
  levels: {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  }
};

// Funkce pro vytvoření logovací složky
async function ensureLogDirectory() {
  try {
    await fs.access(LOG_DIR);
  } catch {
    await fs.mkdir(LOG_DIR, { recursive: true });
  }
}

// Formátování času pro logování
function formatDate(date: Date = new Date()): string {
  return date.toISOString();
}

// Pomocná funkce pro získání názvu log souboru na základě data
function getLogFileName(): string {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}.log`;
}

// Funkce pro zápis do logovacího souboru
async function writeToLogFile(message: string): Promise<void> {
  if (!config.logToFile) return;
  
  try {
    await ensureLogDirectory();
    const logFilePath = path.join(LOG_DIR, getLogFileName());
    await fs.appendFile(logFilePath, message + '\n', { encoding: 'utf8' });
  } catch (error) {
    console.error('Chyba při zápisu do log souboru:', error);
  }
}

// Barevné logování pro konzoli
const colors = {
  debug: '\x1b[34m', // modrá
  info: '\x1b[32m',  // zelená
  warn: '\x1b[33m',  // žlutá
  error: '\x1b[31m', // červená
  reset: '\x1b[0m'   // reset
};

// Vytvoření loggeru pro konkrétní modul
export function createLogger(moduleName: string): Logger {
  const log = async (level: LogLevel, message: string, ...meta: any[]) => {
    // Kontrola minimální úrovně logování
    if (config.levels[level] < config.levels[config.defaultLevel]) {
      return;
    }

    const timestamp = formatDate();
    const metaString = meta.length ? JSON.stringify(meta) : '';
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] [${moduleName}] ${message} ${metaString}`;

    // Logování do konzole
    if (config.logToConsole) {
      const color = colors[level] || colors.reset;
      console.log(`${color}${logMessage}${colors.reset}`);
    }

    // Zápis do souboru
    if (config.logToFile) {
      await writeToLogFile(logMessage);
    }
  };

  return {
    debug: (message: string, ...meta: any[]) => log('debug', message, ...meta),
    info: (message: string, ...meta: any[]) => log('info', message, ...meta),
    warn: (message: string, ...meta: any[]) => log('warn', message, ...meta),
    error: (message: string, ...meta: any[]) => log('error', message, ...meta),
  };
}

// Export základního loggeru pro aplikaci
export const logger = createLogger('app');