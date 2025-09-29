import type { Application } from '../../declarations';
import { ScrapOperationsService } from './scrapOperations.class';
import { scrapOperationsPath, scrapOperationsMethods } from './scrapOperations.shared';
import { BrightDataService } from "./brightDataService";
import hooks from './scrapOperations.hooks';
import { Request, Response } from 'express';

export * from './scrapOperations.class';
export * from './scrapOperations.schema';

export const scrapOperations = (app: Application) => {
  const options = {
    paginate: app.get('paginate'),
    Model: app.get('postgresqlClient'),
    name: 'scrap_operations',
    id: 'id'
  };

  // Registra o serviço com eventos customizados
  app.use(scrapOperationsPath, new ScrapOperationsService(options), {
    methods: scrapOperationsMethods
  });

  const service = app.service(scrapOperationsPath);
  service.hooks(hooks);

  // 🔹 Endpoint customizado para testar target_conditions
  app.post('/scrap-operations/test-target-conditions', async (req: Request, res: Response) => {
    try {
      const brightDataService = new BrightDataService(app);
      const operation = req.body; // espera o objeto ScrapOperations no corpo da request
      const results = await brightDataService.analyzeTargetConditions(operation);
      res.json(results);
    } catch (err: any) {
      res.status(500).json({
        error: err?.message ?? String(err)
      });
    }
  });
};