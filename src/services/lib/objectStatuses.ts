import IReactSelectOptions from "../interfaces/react-select"

const OBJECT_STATUSES = [
  "В ожидании",
  "Идет работа",
  "Работа завершена",
  "Сдано заказчику",
]

export const OBJECT_STATUSES_FOR_SELECT: IReactSelectOptions<string>[] = OBJECT_STATUSES.map<IReactSelectOptions<string>>(
  val => ({label: val, value: val})
)
