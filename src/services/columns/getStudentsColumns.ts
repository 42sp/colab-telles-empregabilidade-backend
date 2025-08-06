import { Knex } from 'knex'
import { ColumnsMap, visibleSet } from './columns.shared'

export async function getStudentsColumns(knex: Knex): Promise<ColumnsMap> {
	const result = await knex('students').columnInfo()
	const columns: ColumnsMap = {}
	
	for (const col in result) {
		columns[col] = {
			label: col,
			isVisible: visibleSet.has(col),
	  }
	}
  
	return columns
}
