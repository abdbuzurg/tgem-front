import { Link } from "react-router-dom"

const referenceBooks = [
  {name:"Материалы", url:"/reference-books/materials"},
  {name:"Бригады", url:"/reference-books/teams"},
  {name:"Объекты", url:"/reference-books/objects"},
  {name:"Работники", url:"/reference-books/workers"}
]

export default function ReferenceBooks() {
  return (
    <main>
      <div className="flex space-x-3 mt-2 px-2">
        {referenceBooks.map((book, index) => (
          <Link
            key={index} 
            to={book.url}
            className="bg-gray-800 text-white text-2xl py-3 px-6 rounded cursor-pointer hover:bg-gray-900"
          >
            {book.name}
          </Link>
        ))}
      </div>
    </main>   
  )
}