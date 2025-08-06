import { Params } from "@feathersjs/feathers"

export const ColumnsPath = "columns" as const

export type ColumnsMap = {
	[key: string]: {
		label: string
		isVisible: boolean
	}
}

export const columnsMehods = ['find', 'get'];

//Colunas visiveis por padrao
export const visibleSet = new Set([
	"socialName",
	"ismartEmail",
	"phoneNumber",
	"gender",
	"sexualOrientation",
	"raceEthnicity",
	"hasDisability",
	"linkedin",
	"currentArea",
	"working",
]);

export interface ColumnsParams extends Params {

}
