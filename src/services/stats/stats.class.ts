import { Application } from "../../declarations";
import { Params } from "@feathersjs/feathers";
import { StatsResult } from "./stats.shared";

interface StudentsStatsParams extends Params {}

export class StudentsStats {
	app: Application;
	Model: any;

	constructor(app: Application) {
		this.app = app;
		this.Model = app.get('postgresqlClient');
	}

	// Custom find method that returns stats
	async find(params?: StudentsStatsParams): Promise<StatsResult> {
		const total_students : any = await this.Model('students').count('id', { as: 'total' }).first();
		const working_students : any = await this.Model('linkedin').where('is_working', true).count('id', { as: 'total' }).first();

		const avgCompensation = 0; // Implement your compensation logic here if needed

		return {
			total: total_students.total,
			working: working_students.total,
			notWorking: total_students.total - working_students.total,
			avgCompensation
		};
	}
}


