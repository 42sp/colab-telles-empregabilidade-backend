import { Params } from "@feathersjs/feathers"

export const ColumnsPath = "columns" as const

export type ColumnsMap = {
	[key: string]: {
		label: string
		isVisible: boolean
	}
}

export interface ColumnsParams extends Params {

}
