import { Link } from "react-router-dom"
import { ADMINISTRATOR_PROJECT } from "../URLs"

const referenceBooksCategorized = [
  {
    category: "Проекты",
    pages: [
      { name: "Проекты", url: ADMINISTRATOR_PROJECT },
      { name: "Пользователи (не готово)", url: "" },
    ]
  },
]
export default function AdministatorHome(){
  return (
    <main>
      {referenceBooksCategorized.map((book, index) => (
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
    </main>
  )
}
