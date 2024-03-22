import { Link } from "react-router-dom"
import { REFERENCE_BOOK_DISTRICT, REFERENCE_BOOK_MATERIAL_COST, REFERENCE_BOOK_OPERATIONS } from "../URLs"

const referenceBooks = [
  {name:"Материалы", url:"/reference-books/materials"},
  {name:"Бригады", url:"/reference-books/teams"},
  {name:"Объекты", url:"/reference-books/objects"},
  {name:"Работники", url:"/reference-books/workers"},
  {name:"Сервисы", url: REFERENCE_BOOK_OPERATIONS},
  {name:"Ценники Материалов", url:REFERENCE_BOOK_MATERIAL_COST},
  {name:"Районы", url:REFERENCE_BOOK_DISTRICT}
]

export default function ReferenceBooks() {
  return (
    <main>
      <div className="flex space-x-3 mt-2 px-2">
        {referenceBooks.map((book, index) => (
          <Link
            key={index} 
            to={book.url}
            className="bg-gray-800 text-white text-2xl py-3 px-6 rounded cursor-pointer hover:bg-gray-900 text-center align-middle"
          >
            {book.name}
          </Link>
        ))}
      </div>
    </main>   
  )
}