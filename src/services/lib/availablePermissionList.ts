export interface IAvailablePermission {
  title: string,
  resource: {
    name: string,
    url: string
  }[]
}

export const AVAILABLE_PERMISSION_LIST: IAvailablePermission[] = [
  {
    title: "администрирование",
    resource: [
      {
        name: "пользватели",
        url: "/user",
      }
    ]
  },
  {
    title: "справочник",
    resource: [
      {
        name: "материалы",
        url: "/material",
      },
      {
        name: "районы",
        url: "/district",
      },
      {
        name: "бригады",
        url: "/team",
      },
      {
        name: "ценники материалов",
        url: "/material-cost",
      },
      {
        name: "сервисы",
        url: "/operation",
      },
    ]
  },
  {
    title: "накладные",
    resource: [
      {
        name:"приход",
        url: "/invoice/input",
      },
      {
        name:"отпуск",
        url: "/invoice/output",
      },
      {
        name:"возврат",
        url: "/invoice/return",
      },      
      {
        name:"списание",
        url: "/invoice/write-off",
      },   
      {
        name:"объект",
        url: "/invoice/object",
      },       
      {
        name:"корректировка",
        url: "/invoice/correction",
      },       
    ]
  }
]
