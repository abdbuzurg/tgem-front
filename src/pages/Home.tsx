import { Link } from "react-router-dom";
import { INVOICE_INPUT, INVOICE_OUTPUT, INVOICE_RETURN, INVOICE_WRITEOFF } from "../URLs";

const warehouseFlow = [
  {name: "Приход", url: INVOICE_INPUT}, 
  {name: "Уход", url: INVOICE_OUTPUT }, 
  {name: "Возврат", url: INVOICE_RETURN}, 
  {name: "Списание", url: INVOICE_WRITEOFF}]

export default function Home() {
  return (
    <div>
      <div className="px-2">
        <p className="text-3xl font-bold">Склад</p>
        <div className="flex space-x-3 mt-2">
          {warehouseFlow.map((flow, index) => (
            <Link
              key={index} 
              to={flow.url}
              className="bg-gray-800 text-white text-2xl py-3 px-6 rounded cursor-pointer hover:bg-gray-900"
            >
              {flow.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}