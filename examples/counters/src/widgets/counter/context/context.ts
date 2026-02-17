import Light from "react-store-light"
import type { Counter } from '../../../entities/counter';

export const couterStoreId = Light.createContextValueId<Light.Store<Counter>>()
export const counterHub = Light.createHub<Counter>();