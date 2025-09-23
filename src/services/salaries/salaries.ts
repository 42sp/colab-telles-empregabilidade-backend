import type { Application } from "../../declarations";

export const salaries = (app: Application) => {
	app.use(salariesPath, new StudentsStats(app));
}