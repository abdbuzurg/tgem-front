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

const MJD_OBJECT_TYPES = [
  "Кирпичный",
  "Панельный",
  "9 этажка",
  "Новостройка",
  "Открытая Лестница",
  "Другое",
]

export const MJD_OBJECT_TYPES_FOR_SELECT: IReactSelectOptions<string>[] = MJD_OBJECT_TYPES.map<IReactSelectOptions<string>>(
  val => ({label: val, value: val})
)

const STVT_OBJECT_VOLTAGE_CLASSES = [
  "6кВ",
  "10кВ",
  "20кВ",
  "35кВ",
]

export const STVT_OBJECT_VOLTAGE_CLASSES_FOR_SELECT: IReactSelectOptions<string>[] = STVT_OBJECT_VOLTAGE_CLASSES.map<IReactSelectOptions<string>>(
  val => ({label: val, value: val})
)

const TP_OBJECT_MODELS = [
  "ГКТП",
  "СКТП",
  "К-42",
  "К-41",
  "К-32",
  "К-31",
  "Мачтовый",
  "Другое",
]

export const TP_OBJECT_MODELS_FOR_SELECT: IReactSelectOptions<string>[] = TP_OBJECT_MODELS.map<IReactSelectOptions<string>>(
  val => ({label: val, value: val})
)

const TP_OBJECT_VOLTAGE_CLASS = [
  "6/0,4кВ",
  "10/0,4кВ",
  "20/0,4кВ",
  "35/0,4кВ",
]

export const TP_OBJECT_VOLTAGE_CLASS_FOR_SELECT: IReactSelectOptions<string>[] = TP_OBJECT_VOLTAGE_CLASS.map<IReactSelectOptions<string>>(
  val => ({label: val, value: val})
)

const SUBSTATION_OBJECT_VOLTAGE_CLASS = [
  "220/110/35/10кВ",
  "220/110/35/6кВ",
  "110/35/10кВ",
  "110/35/6кВ",
  "35/10кВ",
  "35/6кВ",
  "110/10кВ",
  "110/6кВ",
  "220/10кВ",
  "220/6кВ",
]

export const SUBSTATION_OBJECT_VOLTAGE_CLASS_FOR_SELECT: IReactSelectOptions<string>[] = SUBSTATION_OBJECT_VOLTAGE_CLASS.map<IReactSelectOptions<string>>(
  val => ({label: val, value: val})
)

