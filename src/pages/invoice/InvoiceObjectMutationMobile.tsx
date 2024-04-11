import { Fragment, useEffect, useState } from "react"
import IReactSelectOptions from "../../services/interfaces/react-select"
import Select from 'react-select'
import Button from "../../components/UI/button"
import { useQuery } from "@tanstack/react-query"
import getAllTeams from "../../services/api/teams/getAll"
import { ITeam } from "../../services/interfaces/teams"
import { IObject } from "../../services/interfaces/objects"
import Material from "../../services/interfaces/material"
import getAllMaterials from "../../services/api/materials/getAll"
import { IInvoiceObjectMaterials } from "../../services/interfaces/invoiceObject"
import toast from "react-hot-toast"
import { getAllObjects } from "../../services/api/object"

export default function InvoiceObjectMutationAdd() {

  // Select Object Logic
  const [selectedObject, setSelectedObject] = useState<IReactSelectOptions<number>>({
    label: "",
    value: 0,
  })

  const [availableObjects, setAvailableObject] = useState<IReactSelectOptions<number>[]>([])
  const allObjectsQuery = useQuery<IObject[], Error, IObject[]>({
    queryKey: ["all-objects"],
    queryFn: getAllObjects,
  })
  useEffect(() => {

    if (allObjectsQuery.isSuccess && allObjectsQuery.data) {

      setAvailableObject([
        ...allObjectsQuery.data.map<IReactSelectOptions<number>>((val) => ({
          label: val.name,
          value: val.id,
        }))
      ])

    }

  }, [allObjectsQuery.data])

  // Select Team Logic
  const [selectedTeam, setSelectedTeam] = useState<IReactSelectOptions<number>>({
    label: "",
    value: 0,
  })

  const [availableTeams, setAvailableTeams] = useState<IReactSelectOptions<number>[]>([])
  const allTeamsQuery = useQuery<ITeam[], Error, ITeam[]>({
    queryKey: ["all-teams"],
    queryFn: getAllTeams,
  })
  useEffect(() => {

    if (allTeamsQuery.isSuccess && allTeamsQuery.data) {

      setAvailableTeams([
        ...allTeamsQuery.data.map<IReactSelectOptions<number>>((val) => ({
          label: val.number,
          value: val.id
        }))
      ])

    }

  }, [allTeamsQuery.data])

  // Select Material Logic
  const [selectedMaterial, setSelectedMaterial] = useState<IReactSelectOptions<number>>({
    label: "",
    value: 0,
  })
  useEffect(() => {
    let unit = ""
    if (selectedMaterial.value != 0 && allMaterialsQuery.isSuccess && allMaterialsQuery.data) {
      unit = allMaterialsQuery.data.find((val) => val.id == selectedMaterial.value)!.unit
    }

    setInvoiceMaterial({
      ...invoiceMaterial, 
      materialID: selectedMaterial.value,
      materialName: selectedMaterial.label,
      unit: unit,
    })

  }, [selectedMaterial])

  const [availableMaterials, setAvailableMaterials] = useState<IReactSelectOptions<number>[]>([])
  const allMaterialsQuery = useQuery<Material[], Error, Material[]>({
    queryKey: ["all-materials"],
    queryFn: getAllMaterials,
  })
  useEffect(() => {

    if (allMaterialsQuery.isSuccess && allMaterialsQuery.data) {

      setAvailableMaterials([
        ...allMaterialsQuery.data.map<IReactSelectOptions<number>>((val) => ({
          label: val.name,
          value: val.id,
        }))
      ])

    }

  }, [allMaterialsQuery.data])

  // Material list
  const [invoiceMaterials, setInvoiceMaterials] = useState<IInvoiceObjectMaterials[]>([])

  const [invoiceMaterial, setInvoiceMaterial] = useState<IInvoiceObjectMaterials>({
    materialID: 0,
    materialName: "",
    unit: "",
    amount: 0,
    notes: "",
  })

  // Adding materials to the list
  const addMaterialToTheList = () => {

    if (invoiceMaterial.materialID == 0) {
      toast.error("Не был выбран материал")
      return
    }

    if (invoiceMaterials.findIndex((val) => val.materialID == invoiceMaterial.materialID) != -1) {
      toast.error("Такой материал уже в списке")
      return
    }

    if (invoiceMaterial.amount <= 0) {
      toast.error("Неправильно указано количество материала")
      return
    }

    setInvoiceMaterials([invoiceMaterial, ...invoiceMaterials])
    setInvoiceMaterial({
      materialID: 0,
      materialName: "",
      unit: "",
      amount: 0,
      notes: "",
    })
    setSelectedMaterial({label: "", value: 0})

  }

  // Delete from the list
  const deleteFromList = (index: number) => {
    setInvoiceMaterials(invoiceMaterials.filter((_, i) => i != index))
  }

  return (
    <main>
      <div className="px-2 py-1">
        <span className="font-bold text-xl">Добавление материалов на объект</span>
      </div>
      <div className="px-2 py-1">
        <span className="font-semibold text-lg">Основная информация</span>
        <div className="px-3 py-4 bg-gray-800 text-white rounded-md ">
          <div className="flex flex-col space-y-1">
            <span className="font-semibold">Объект</span>
            <Select
              className="basic-single text-black"
              classNamePrefix="select"
              isSearchable={true}
              isClearable={true}
              name={"material-cost-material-select"}
              placeholder={""}
              value={selectedObject}
              options={availableObjects}
              onChange={(value) => setSelectedObject({
                label: value?.label ?? "",
                value: value?.value ?? 0,
              })}
            />
          </div>
          <div className="flex flex-col space-y-1">
            <span className="font-semibold">Бригада</span>
            <Select
              className="basic-single text-black"
              classNamePrefix="select"
              isSearchable={true}
              isClearable={true}
              name={"material-cost-material-select"}
              placeholder={""}
              value={selectedTeam}
              options={availableTeams}
              onChange={(value) => setSelectedTeam({
                label: value?.label ?? "",
                value: value?.value ?? 0,
              })}
            />
          </div>
        </div>
      </div>
      <div className="px-2 py-1">
        <span className="font-semibold text-lg">Материалы</span>
        <div className="grid grid-cols-1 gap-2">
          <div className="flex flex-col space-y-3 px-3 py-2 bg-gray-800 text-white rounded-md">
            <div className="flex flex-col space-y-1">
              <span className="font-semibold">Материалы</span>
              <Select
                className="basic-single text-black"
                classNamePrefix="select"
                isSearchable={true}
                isClearable={true}
                name={"material-cost-material-select"}
                placeholder={""}
                value={selectedMaterial}
                options={availableMaterials}
                onChange={(value) => setSelectedMaterial({
                  label: value?.label ?? "",
                  value: value?.value ?? 0,
                })}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <span className="font-semibold">Кол-во</span>
              <div className="flex space-x-2 items-center">
                <input
                  type="number"
                  value={invoiceMaterial.amount}
                  onChange={(e) => setInvoiceMaterial({
                    ...invoiceMaterial,
                    amount: +e.target.value
                  })}
                  className="text-black rounded-sm px-2 py-1.5"
                />
                <span>{invoiceMaterial.unit}</span>
              </div>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="font-semibold">Примичание</span>
              <textarea 
                className="w-full text-black"
                value={invoiceMaterial.notes}
                onChange={(e) => setInvoiceMaterial({
                  ...invoiceMaterial,
                  notes: e.target.value,
                })}
              />
            </div>
            <div className="col-span-2 flex space-x-2">
              <Button
                text="Добавить в список"
                onClick={() => addMaterialToTheList()}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="px-2 py-1">
        <span className="font-semibold text-lg">Список материалов на объект</span>
        <div className="grid grid-cols-1 gap-2">
          {invoiceMaterials.length == 0 &&
            <div className="px-3 py-2 bg-gray-800 text-white italic rounded-md">
              Список материалов пока пустой
            </div>
          }
          {invoiceMaterials.map((value, index) => (
            <div className="grid grid-cols-2 gap-3 px-3 py-2 bg-gray-800 text-white rounded-md overflow-auto">
              <div className="font-bold">Материал:</div>
              <div>{value.materialName}</div>
              <div className="font-bold">Количество:</div>
              <div>{value.amount} {value.unit}</div>
              {value.notes == "" 
                ? 
                  <Fragment>
                   <div className="font-bold">Примичание:</div>
                    <div className="font-light italic">Отсутсвует</div>
                  </Fragment>
                :
                  <Fragment>
                    <div className="font-bold col-span-2">Примичание:</div>
                    <div className="col-span-2">{value.notes}</div>
                  </Fragment>
              }
              <div className="col-span-2 flex space-x-2">
                <Button
                  text="Удалить со списка"
                  buttonType="delete"
                  onClick={() => deleteFromList(index)}
                />
              </div>
            </div>
          ))} 
        </div>
      </div>
    </main>
  )
}
