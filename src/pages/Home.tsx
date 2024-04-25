import { Link } from "react-router-dom";
import { INVOICE_CORRECTION, INVOICE_INPUT, INVOICE_OBJECT, INVOICE_OUTPUT, INVOICE_RETURN, INVOICE_WRITEOFF, } from "../URLs";

const warehouseFlow = [
  { name: "Приход", url: INVOICE_INPUT },
  { name: "Отпуск", url: INVOICE_OUTPUT },
  { name: "Объект", url: INVOICE_OBJECT },
  { name: "Возврат", url: INVOICE_RETURN },
  // { name: "Списание", url: INVOICE_WRITEOFF },
  { name: "Корректировка", url: INVOICE_CORRECTION },
]

export default function Home() {
  return (
    <div className="flex flex-col space-y-2">
      <div className="px-2">
        <p className="text-3xl font-bold">Накладные</p>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-2">
          {warehouseFlow.map((flow, index) => (
            <Link
              key={index}
              to={flow.url}
              className="bg-gray-800 text-white text-center text-xl py-2 px-4 rounded cursor-pointer hover:bg-gray-900"
            >
              {flow.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
