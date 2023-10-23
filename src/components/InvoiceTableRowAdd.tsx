import { useState } from "react"
import IReactSelectOptions from "../services/interfaces/react-select"
import { MaterialData } from "../services/api/warehouse/input/getByKey"
import Select from 'react-select'
import Button from "./UI/button"
import Input from "./UI/Input"
import { MaterialForInvoice } from "../services/api/materials/getForInvoice"
import ErrorModal from "./errorModal"


interface Props {
  data: MaterialData[]
  setData: React.Dispatch<React.SetStateAction<MaterialData[]>>
  availableMaterialsData: MaterialForInvoice[]
}

export default function InvoiceTableRowAdd({availableMaterialsData, setData, data}: Props) {
  const availableMaterials = availableMaterialsData.map<IReactSelectOptions<number>>((v) => ({label: v.name_material, value: v.key_material}))

  const [materialAddData, setMaterialAddData] = useState<MaterialData>({
    key: 0,
    key_material: 0,
    key_delivery: 0,
    amount: 0,
    date_add: "",
    date_edit: "",
    name:"",
    notes: "",
    operator_add: "",
    operator_edit: "",
    unit: "",
  })
  const [selectedMaterialAdd, setSelectedMaterialAdd] = useState<IReactSelectOptions<number>>({label: "", value: 0})
  const onChangeMaterialAdd = (value: IReactSelectOptions<number> | null) => {
    if (!value) {
      setSelectedMaterialAdd({label: "", value: 0})
      setMaterialAddData({
        ...materialAddData,
        name: "",
        unit: ""
      })
      return
    }

    setSelectedMaterialAdd(value)
    const unit = availableMaterialsData.find((v) => v.key_material == value.value)!.unit
    setMaterialAddData({
      ...materialAddData,
      unit: unit,
      name: value.label,
      key_material: value.value,
    })
  }

  const [materialAddDataError, setMaterialAddDataError] = useState({
    name: false,
    amount: false,
    duplicated: false
  })
  const [showErrorModal, setShowErrorModal] = useState(false)
  const addNewMaterial = () => {
    if (materialAddData.key_material == 0 || materialAddData.name == "") setMaterialAddDataError((prev) => ({...prev, name: true}))
    else setMaterialAddDataError((prev) => ({...prev, name: false}))
    if (materialAddData.amount <= 0) setMaterialAddDataError((prev) => ({...prev, amount: true}))
    else setMaterialAddDataError((prev) => ({...prev, amount: false}))

    const isDuplicate = data.find((v) => v.key_material == materialAddData.key_material)
    if (isDuplicate) setMaterialAddDataError((prev) => ({...prev, duplicated: true}))
    else setMaterialAddDataError((prev) => ({...prev, duplicated: false}))

    if ((materialAddData.amount <= 0) || materialAddData.key_material === 0 || isDuplicate) {
      setShowErrorModal(true)
      return
    }
    
    setData((prev) => ([...prev, materialAddData]))
  }

  return (
    <tr className="border-b">
      <td className="px-4 py-3 max-w-[300px]">
        <Select
          className="basic-single"
          classNamePrefix="select"
          isSearchable={true}
          isClearable={true}
          name={"materials_add"}
          placeholder={""}
          value={selectedMaterialAdd}
          styles={{
            container: (base) => ({...base, minWidth:"100px", maxWidth: "300px", borderColor:"red"}), 
            valueContainer: (base) => ({...base, minWidth:"100px", maxWidth:"300px", borderColor: "red"})
          }}
          options={availableMaterials}
          onChange={(value) => onChangeMaterialAdd(value)}
        />
      </td>
      <td className="px-4 py-3">
        {materialAddData.unit}
      </td>
      <td className="px-4 py-3">
        <Input name="amount" type="number" value={materialAddData.amount} onChange={(e) => setMaterialAddData({...materialAddData, [e.target.name]: +e.target.value})}/>
      </td>
      <td className="px-4 py-3">
        <Input name="notes" type="text" value={materialAddData.notes} onChange={(e) => setMaterialAddData({...materialAddData, [e.target.name]: e.target.value})}/>  
      </td>
      <td className="px-4 py-3">
        <Button onClick={addNewMaterial} text="Добавить"/>
        {showErrorModal && 
          <ErrorModal setShowModal={setShowErrorModal}>
          <span>
            {(materialAddDataError.name ? "Материал не был выбран из предоставленного списка. " : "") +
            (materialAddDataError.amount ? "Количество материала не было указано или было указано неправильно. ": "") + 
            (materialAddDataError.duplicated ? "Данный материал уже существует в накладной. ": "")}
          </span>
        </ErrorModal>
        }
      </td>
    </tr>
  )
}