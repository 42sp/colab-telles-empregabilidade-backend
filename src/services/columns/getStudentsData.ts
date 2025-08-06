import { Knex } from "knex";
import { visibleSet } from "./columns.shared";

export async function getVisibleStudentsData(knex: Knex) {
	const result = await knex('students').columnInfo();
	const visibleColumns = Object.keys(result).filter(col => visibleSet.has(col));

	return await knex('students').select(...visibleColumns);
}