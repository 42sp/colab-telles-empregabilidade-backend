import { Application } from "../../declarations";
import { Params } from "@feathersjs/feathers";
import { StatsResult } from "./stats.shared";

// Função para traduzir filtros Feathers -> Knex
function applyFilters(query: any, filters: Record<string, any>) {
	for (const [key, value] of Object.entries(filters)) {
		if (typeof value === "object" && value !== null) {
			if ("$ilike" in value) query = query.whereILike(key, value.$ilike);
			if ("$eq" in value) query = query.where(key, value.$eq);
			if ("$ne" in value) query = query.whereNot(key, value.$ne);
			if ("$in" in value) query = query.whereIn(key, value.$in);
			if ("$nin" in value) query = query.whereNotIn(key, value.$nin);
			if ("$gte" in value) query = query.where(key, '>=', value.$gte);
			if ("$lte" in value) query = query.where(key, '<=', value.$lte);
		} else {
			query = query.where(key, value);
		}
	}
	return query;
}

interface StudentsStatsParams extends Params {}

export class StudentsStats {
	app: Application;
	Model: any;

	constructor(app: Application) {
		this.app = app;
		this.Model = app.get("postgresqlClient");
	}

	async find(params?: StudentsStatsParams): Promise<StatsResult> {
		const { $limit, $skip, $sort, activeLabel, ...filters } = params?.query ?? {};

		let baseQuery = this.Model("students");

		// Aplica activeLabel se houver
		if (activeLabel) {
			if (activeLabel === "Formados") {
				baseQuery = baseQuery.whereILike("realStatus", "formad%");
			} else if (activeLabel === "Ativos") {
				baseQuery = baseQuery.whereILike("holderContractStatus", "Ativ%");
			} else if (activeLabel === "Inativos") {
				baseQuery = baseQuery.whereILike("holderContractStatus", "Inativ%");
			}
		}

		// Aplica todos os outros filtros
		baseQuery = applyFilters(baseQuery, filters);

		// Total de estudantes
		const total_students: any = await baseQuery.clone().count("id as total").first();

		// Trabalhando
		const working_students: any = await baseQuery
			.clone()
			.where("working", true)
			.count("id as total")
			.first();

		// Média salarial
		const avgCompensationResult: any = await baseQuery
			.clone()
			.whereRaw('"compensation" > 0')
			.sum("compensation as sum")
			.count("compensation as count")
			.first();

		const avgCompensation =
			Number(avgCompensationResult.count) > 0
				? Math.round(Number(avgCompensationResult.sum) / Number(avgCompensationResult.count))
				: 0;

		return {
			total: Number(total_students.total),
			working: Number(working_students.total),
			notWorking: Number(total_students.total) - Number(working_students.total),
			avgCompensation,
		};
	}
}
