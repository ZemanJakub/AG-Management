import { initializeConfigFromEnv } from '@/modules/podklady/config/configValidator'
import { redirect } from 'next/navigation'
import { StructuredLogger } from '@/modules/podklady/services/structuredLogger'

// Vytvořím logger pro landing page
const logger = StructuredLogger.getInstance().getComponentLogger('landing-page')

// Generování unikátního ID pro sledování inicializačního procesu
const initId = logger.generateCorrelationId()
logger.info('Začínám inicializaci aplikace')

// Inicializace konfigurace
try {
  initializeConfigFromEnv()
  logger.info('Aplikační konfigurace úspěšně inicializována z .env')
} catch (error) {
  logger.error('Chyba při inicializaci konfigurace', { 
    error: error instanceof Error ? error.message : 'Neznámá chyba'
  })
}

export default function Home() {
  redirect('/dashboard')
}