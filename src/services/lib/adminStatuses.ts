import IReactSelectOptions from "../interfaces/react-select"

export const CURRENSY = ["Сомони", "Долларов", "Рублей", "Евро"]

export const CURRENSY_FOR_SELECT: IReactSelectOptions<string>[] = CURRENSY.map<IReactSelectOptions<string>>((val) => ({
  label: val,
  value: val,
}))
