import { Knex } from 'knex'
import { ColumnsMap } from './columns.shared'

export async function getStudentsColumns(knex: Knex): Promise<ColumnsMap> {
	const result = await knex('students').columnInfo()
	const columns: ColumnsMap = {}
  
	for (const col in result) {
	  columns[col] = {
		label: col,
		isVisible: true
	  }
	}
  
	return columns
}
  