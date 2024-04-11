import { useNavigate } from "react-router-dom";
import Button from "../../components/UI/button";
import { INVOICE_OBJECT_MUTATION_ADD } from "../../URLs";

export default function InvoiceObject() {

  const navigate = useNavigate()

  return (
    <main>
      <div 
        className="mt-2 px-2 flex flex-col md:flex-row space-y-2 md:space-x-2 md:justify-between items-start md:items-center"
      >
        <span className="text-3xl font-bold">Поступление на объект</span>
        {/* BUTTON FOR MOBILE  */}
        <Button 
          text="Добавить"
          onClick={() => navigate(INVOICE_OBJECT_MUTATION_ADD)}
          className="md:hidden"
        />
        {/* BUTTON FOR OTHER SCREENS */}
        <Button 
          text="Добавить"
          onClick={() => {}}
          className="hidden md:block"
        />
        {/* <Button text="Экспорт" onClick={() => {}}/> */}
      </div>
      <div className="grid grid-cols-1 gap-2 px-3 mt-2 md:hidden">
        <div className="grid grid-cols-2 gap-2 px-3 py-2 bg-gray-800 text-white rounded-md overflow-auto">
          <div className="font-bold">Код поступления</div> 
          <div>ПО-01-00001</div>
          <div className="font-bold">Супервайзер</div>
          <div>Абдуллоев АбдуллоевАбдуллоевАбдуллоев</div>
          <div className="font-bold">Объект</div>
          <div>Объект-0001</div>
          <div className="font-bold">Бригада</div>
          <div>Бригада-0001</div>
          <div className="col-span-2 flex space-x-2">
            <Button 
              text="Подробнее"
              onClick={() => {}}
            />  
          </div>
        </div>
      </div>
   </main>
  )
}
