import cron from 'node-cron';
import { runScrapers } from '@mangatracker/scraper';

export function startScheduler() {
  // Run every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    console.log('[Scheduler] Iniciando scraping agendado...');
    try {
      const results = await runScrapers({ headless: true });
      const success = results.filter((r) => r.price !== null).length;
      const failed = results.length - success;
      console.log(`[Scheduler] Scraping completo: ${success} sucesso, ${failed} falha`);
    } catch (err) {
      console.error('[Scheduler] Erro no scraping:', err);
    }
  });

  console.log('[Scheduler] Agendador iniciado (a cada 6 horas)');
}
