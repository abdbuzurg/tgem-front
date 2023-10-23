import { Fragment, useEffect, useState } from "react";
import { MaterialData } from "../services/api/warehouse/input/getByKey";
import Button from "./UI/button";
import Input from "./UI/Input";
import { useQuery } from "@tanstack/react-query";
import { MaterialForInvoice, getMaterialsForInvoice } from "../services/api/materials/getForInvoice";
import Select from 'react-select'
import IReactSelectOptions from "../services/interfaces/react-select";
import InvoiceTableRowAdd from "./InvoiceTableRowAdd";
import ErrorModal from "./errorModal";
import DeleteInvoiceModal from "./deleteModal";

interface Props {
  data: MaterialData[]
  setData: React.Dispatch<React.SetStateAction<MaterialData[]>>
}

interface MaterialDataEdit extends MaterialData {
  showEdit: boolean
}

export default function InvoiceMaterialTable({ data, setData }: Props) {
  const [materials, setMaterials] = useState<MaterialDataEdit[]>([...data.map<MaterialDataEdit>((v) => ({...v, showEdit: false}))])
  useEffect(() => {
    setMaterials([...data.map<MaterialDataEdit>((v) => ({...v, showEdit: false}))])
  }, [data])

  const availableMaterialsQuery = useQuery<MaterialForInvoice[], Error>({
    queryKey: ["materials-for-warehouse"],
    queryFn: getMaterialsForInvoice
  })
  const [availableMaterials, setAvailableMaterials] = useState<IReactSelectOptions<number>[]>([])
  useEffect(() => {
    if (availableMaterialsQuery.isSuccess && availableMaterialsQuery.data) {
      setAvailableMaterials([...availableMaterialsQuery.data.map<IReactSelectOptions<number>>((v) => ({label: v.name_material, value: v.key_material}))])
    }
  }, [availableMaterialsQuery.data])

  const [errors, setErrors] = useState({
    name: false,
    amount: false,
    duplicated: false
  })

  const [showErrorModal, setShowErrorModal] = useState(false)
  const toggleEditMode = (value: boolean, index: number) => {
    if (!value) {
      if (materials[index].key_material == 0 || materials[index].name == "") setErrors((prev) => ({...prev, name: true}))
      else setErrors((prev) => ({...prev, name: false}))
      if (materials[index].amount <= 0) setErrors((prev) => ({...prev, amount: true}))
      else setErrors((prev) => ({...prev, amount: false}))

      if ((materials[index].amount <= 0) || materials[index].key_material === 0) {
        setShowErrorModal(true)
        return
      }

      setData(materials)
      return
    }
    materials[index].showEdit = value 
    setMaterials([...materials])
  }

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const onMaterialDelete = (index:number) => {
    setData([...materials.filter((_, vIndex) => vIndex != index)])
  }

  const onMaterialDataInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    materials[index] = {
      ...materials[index],
      [e.target.name]: e.target.type == "number" ? +e.target.value : e.target.value,
    }
    setMaterials([...materials]) 
  }

  const onChangeSelectMaterial = (value: IReactSelectOptions<number> | null, index: number) => {
    const copyMaterials = [...materials]
    if (!value) {
      copyMaterials[index] = {
        ...copyMaterials[index],
        name: "",
        key_material: 0,
        unit: ""
      }
      setMaterials(copyMaterials)
      return
    }

    if (availableMaterialsQuery.isSuccess) {
      const isDuplicate = materials.find((v) => v.key_material == value.value)
      
      if (isDuplicate) {
        setErrors((prev) => ({...prev, duplicated: true}))
        setShowErrorModal(true)
        copyMaterials[index] = {
          ...copyMaterials[index],
          name: "",
          key_material: 0,
          unit: ""
        }
        setMaterials(copyMaterials)
        return
      }
      else setErrors((prev) => ({...prev, duplicated: false}))


      const unit = availableMaterialsQuery.data.find((v) => v.key_material === value.value)!.unit
      copyMaterials[index] = {
        ...copyMaterials[index],
        name: value.label,
        key_material: value.value,
        unit: unit
      }

      setMaterials(copyMaterials)
    }
  }

  return (
    <div>
      <p className="font-bold text-xl px-3 py-2">Материалы накладной</p>
      <table className="text-sm text-left mt-2 min-w-full">
        <thead className="shadow-[0_4px_6px_-1px_rgb(0,0,0,0.1),0_2px_4px_-2px_rgb(0,0,0,0.1)] border-t-2 w-full">
          <tr>
            <th className="px-4 py-3 box-border">
              <span>Название Материала</span>
            </th>
            <th className="px-4 py-3">
              <span>Ед.Изм</span>
            </th>
            <th className="px-4 py-3">
              <span>Количество</span>
            </th>
            <th className="px-4 py-3">
              <span>Примичание</span>
            </th>
            <th className="px-4 py-3 invisible">
              <span>Добавить</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {materials.map((value, index) => 
            <Fragment key={index}>
              {!value.showEdit 
                ? 
                  <tr className="border-b">
                    <td className="px-4 py-3 max-w-[300px] border-b">{value.name}</td>
                    <td className="px-4 py-3">{value.unit}</td>
                    <td className="px-4 py-3">{value.amount}</td>
                    <td className="px-4 py-3">{value.notes}</td>
                    <td className="px-4 py-3 flex space-x-2">
                      <Button onClick={() => toggleEditMode(true, index)} text="Изменить" />
                      <Button onClick={() => setShowDeleteModal(true)} text="Удалить" buttonType="delete"/>
                      {showDeleteModal && 
                        <DeleteInvoiceModal deleteFunc={() => onMaterialDelete(index)} setShowModal={setShowDeleteModal}>
                          <span>
                            При подтверждении матераил и его количество буду удалены без возвожности восстановления. Имя материала - <strong>{value.name}</strong>, количество - <strong>{value.amount}{value.unit}</strong>`
                          </span>
                        </DeleteInvoiceModal>
                      }
                    </td>
                  </tr>
                :
                  <tr className="border-b">
                    <td className="px-4 py-3 max-w-[300px]">
                      <Select
                        className="basic-single"
                        classNamePrefix="select"
                        isSearchable={true}
                        isClearable={true}
                        name={"materials_edit"}
                        placeholder={""}
                        value={{label: value.name, value: value.key_material}}
                        styles={{
                          container: (base) => ({...base, minWidth:"100px", maxWidth: "300px", borderColor:"red"}), 
                          valueContainer: (base) => ({...base, minWidth:"100px", maxWidth:"300px", borderColor: "red"})
                        }}
                        options={availableMaterials}
                        onChange={(value) => onChangeSelectMaterial(value, index)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      {value.unit}
                    </td>
                    <td className="px-4 py-3">
                      <Input name="amount" type="number" value={materials[index].amount} onChange={(e) => onMaterialDataInputChange(e, index)}/>
                    </td>
                    <td className="px-4 py-3">
                      <Input name="notes" type="text" value={materials[index].notes} onChange={(e) => onMaterialDataInputChange(e, index)}/>  
                    </td>
                    <td>
                      <Button onClick={() => toggleEditMode(false , index)} text="Подтвердить"/>
                      {showErrorModal && 
                        <ErrorModal setShowModal={setShowErrorModal}>
                          <span>
                            {(errors.name ? "Материал не был выбран из предоставленного списка. " : "") +
                            (errors.amount ? "Количество материала не было указано или было указано неправильно. ": "") +
                            (errors.duplicated ? "Данный материал уже существует в накладной. ": "")}
                          </span>
                        </ErrorModal>
                      }
                    </td>
                  </tr>
              }
            </Fragment>
          )}
          {availableMaterialsQuery.isSuccess && <InvoiceTableRowAdd availableMaterialsData={availableMaterialsQuery.data} data={data} setData={setData} />}
        </tbody>
      </table>
    </div>
  )
}