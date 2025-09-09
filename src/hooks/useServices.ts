import Service from "../types/requests/services/service";
import { useBrightdata } from "./useBrightdata";

export const useServices = () => {
	const { instance } = useBrightdata();

	return new Service(instance);
};
