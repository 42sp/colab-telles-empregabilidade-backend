import { Application } from "../../declarations";
import { Params, ServiceMethods } from "@feathersjs/feathers";
import { StatsResult } from "./stats.shared";

export class StudentsStats implements Pick<ServiceMethods<any>, "find">{
	app: Application;

	constructor(app: Application) {
		this.app = app;
	}

	async find(params: Params): Promise<StatsResult> {
		const limit = 100;
		let skip = 0;
		let total = 0;
		let working = 0;
		let compensationSum = 0;
		let compensationCount = 0; // só quem tem salário > 0
	  
		while (true) {
		  const result: any = await this.app.service("students").find({
			query: {
			  ...params?.query,
			  $limit: limit,
			  $skip: skip,
			},
			paginate: false,
		  });
	  
		  const students = Array.isArray(result.data) ? result.data : result;
	  
		  if (!students.length) break;
	  
		  total += students.length;
		  working += students.filter((s: any) => s.working).length;
	  
		  // só soma salários > 0
		  students.forEach((s: any) => {
			const salary = Number(s.compensation);
			if (!isNaN(salary) && salary > 0) {
			  compensationSum += salary;
			  compensationCount++;
			}
		  });
	  
		  skip += students.length;
		}
	  
		const notWorking = total - working;
		const avgCompensation =
		  compensationCount > 0 ? Math.round(compensationSum / compensationCount) : 0;
	  
		return { total, working, notWorking, avgCompensation };
	  }	  
}
