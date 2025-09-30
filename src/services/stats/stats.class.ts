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
		const working_students : any = await this.Model('students').where('working', true).count('id', { as: 'total' }).first();

		let compensationSum = 0;
		let compensationCount = 0;
		let skip = 0;
		const limit = 100;
		while (true) {
			const result: any = await this.Model('students')
				.select('*')
				.limit(limit)
				.offset(skip);

			if (!result || result.length === 0) break;

			// soma salários > 0
			result.forEach((s: any) => {
				const salary = Number(s.compensation);
				if (!isNaN(salary) && salary > 0) {
					compensationSum += salary;
					compensationCount++;
				}
			});

			skip += result.length;
		}

		const avgCompensation =
			compensationCount > 0 ? Math.round(compensationSum / compensationCount) : 0;

		return {
			total: total_students.total,
			working: working_students.total,
			notWorking: total_students.total - working_students.total,
			avgCompensation
		};
	}
}
