import { Application } from "../../declarations";
import { ColumnsService } from "./columns.class";
import { ColumnsPath } from "./columns.shared";

export const columns = (app: Application) => {
	app.use(ColumnsPath, new ColumnsService(app))
}
