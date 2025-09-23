import { StudentsStats } from "./stats.class";

export const statsPath = 'students-stats';
export const statsMethods: Array<keyof StudentsStats> = ['find'] as const;

export interface StatsResult {
	total: number;
	working: number;
	notWorking: number;
	avgCompensation: number;
}
