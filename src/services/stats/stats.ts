import type { Application } from "../../declarations";
import { StudentsStats } from "./stats.class";
import { statsPath } from "./stats.shared";

export const stats = (app: Application) => {
	app.use(statsPath, new StudentsStats(app));
}
