import { Application } from '../../declarations'
import { ColumnsService, getColumnsOptions } from './columns.class'
import { ColumnsPath } from './columns.shared'
import { Request, Response, NextFunction } from 'express'

export const columns = (app: Application) => {
	const options = getColumnsOptions(app);
	const service = new ColumnsService(app, options);

	app.use(ColumnsPath, service);
	
	const expressApp = app as unknown as import('express').Application

	expressApp.get(`${ColumnsPath}/columns`, async (req: Request, res: Response, next: NextFunction) => {
		try {
			const data = await service.getColumns();
			res.json(data);
		} catch (error) {
			next(error);
		}
	});
	expressApp.get(`${ColumnsPath}/students`, async (req: Request, res: Response, next: NextFunction) => {
		try {
			const data = await service.getStudents();
			res.json(data);
		} catch (error) {
			next(error);
		}
	});
}
