import { Link } from "react-router-dom";
import { INVOICE_CORRECTION, INVOICE_INPUT, INVOICE_OBJECT, INVOICE_OUTPUT, INVOICE_RETURN_OBJECT, INVOICE_RETURN_TEAM,  } from "../URLs";

const homePageCategorized = [
  {
    category: "Приход",
    pages: [
      { name: "Приход", url: INVOICE_INPUT },
    ]
  },
  {
    category: "Отпуск",
    pages: [
      { name: "Отпуск", url: INVOICE_OUTPUT },
    ]
  },
  {
    category: "Возврат",
    pages: [
      { name: "Возврат Бригады", url: INVOICE_RETURN_TEAM },
      { name: "Возврат Объекта", url: INVOICE_RETURN_OBJECT },
    ]
  },
  {
    category: "Объект",
    pages: [
      { name: "Поступление на объект", url: INVOICE_OBJECT },
      { name: "Корректировка", url: INVOICE_CORRECTION },
    ]
  },
]

export default function Home() {
  return (
    <div className="flex flex-col space-y-2">
      <div className="px-2">
        {homePageCategorized.map((book, index) => (
          <div className="py-1 px-2" key={index}>
            <span className="font-bold text-2xl">{book.category}</span>
            <div className="grid grid-cols-4 gap-2 px-2 py-2">
              {book.pages.map((page, index) =>
                <Link
                  key={index}
                  to={page.url}
                  className="bg-gray-800 text-white text-xl py-3 px-6 rounded cursor-pointer hover:bg-gray-900 text-center align-middle"
                >
                  {page.name}
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
