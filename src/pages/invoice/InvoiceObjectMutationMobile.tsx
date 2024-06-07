import { Fragment, useEffect, useState } from "react"
import IReactSelectOptions from "../../services/interfaces/react-select"
import Select from 'react-select'
import Button from "../../components/UI/button"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ITeam } from "../../services/interfaces/teams"
import { IObject } from "../../services/interfaces/objects"
import Material from "../../services/interfaces/material"
import { IInvoiceObjectMaterials } from "../../services/interfaces/invoiceObject"
import toast from "react-hot-toast"
import { getAllObjects } from "../../services/api/object"
import { getAllTeams } from "../../services/api/team"
import { InvoiceObjectCreateItems, createInvoiceObject, getMaterialAmount, getSerialNumbersOfMaterial, getTeamMaterials } from "../../services/api/invoiceObject"
import { useNavigate } from "react-router-dom"
import { INVOICE_OBJECT } from "../../URLs"

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


  const [availableMaterials, setAvailableMaterials] = useState<IReactSelectOptions<number>[]>([])
  const allMaterialsQuery = useQuery<Material[], Error, Material[]>({
    queryKey: [`materials-in-team-${selectedTeam.value}`],
    queryFn: () => getTeamMaterials(selectedTeam.value),
    enabled: selectedTeam.value != 0,
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

  const onMaterialSelect = (value: IReactSelectOptions<number> | null) => {
    if (!value) {
      setSelectedMaterial({ label: "", value: 0 })
      setInvoiceMaterial({
        materialID: 0,
        materialName: "",
        availableMaterial: 0,
        unit: "",
        amount: 0,
        notes: "",
        hasSerialNumbers: false,
        serialNumbers: [],
      })

      return
    }
    
    setSelectedMaterial(value)
    if (allMaterialsQuery.isSuccess && allMaterialsQuery.data) {
      const material = allMaterialsQuery.data.find((val) => val.id == value.value)!
      console.log(material)
      setInvoiceMaterial({
        ...invoiceMaterial,
        materialID: material.id,
        materialName: material.name,
        hasSerialNumbers: material.hasSerialNumber,
        unit: material.unit,
      })
    }
  }  

  //Logic for getting the amount of selected material
  const materialAmountQuery = useQuery<number, Error, number>({
    queryKey: [`material-${selectedMaterial.value}-team-${selectedTeam.value}`],
    queryFn: () => getMaterialAmount(selectedMaterial.value, selectedTeam.value),
    enabled: selectedMaterial.value != 0 && selectedTeam.value != 0
  })

  useEffect(() => {
    if (materialAmountQuery.isSuccess && materialAmountQuery.data) {
      setInvoiceMaterial({ ...invoiceMaterial, availableMaterial: materialAmountQuery.data })
    }
  }, [materialAmountQuery.data])

  // Material list
  const [invoiceMaterials, setInvoiceMaterials] = useState<IInvoiceObjectMaterials[]>([])

  const [invoiceMaterial, setInvoiceMaterial] = useState<IInvoiceObjectMaterials>({
    materialID: 0,
    materialName: "",
    availableMaterial: 0,
    unit: "",
    amount: 0,
    notes: "",
    hasSerialNumbers: false,
    serialNumbers: [],
  })

  // Serial Numbers logic
  const [availableSerialNumbers, setAvaiableSerialNumbers] = useState<IReactSelectOptions<string>[]>([])
  const [selectedSerialNumber, setSelectedSerialNumber] = useState<IReactSelectOptions<string>>({ label: "", value: "" })
  const [alreadySelectedSerialNumbers, setAlreadySelectedSerialNumbers] = useState<IReactSelectOptions<string>[]>([])
  const [toBeDeletedSerialNumber, setToBeDeletedSerialNumber] = useState<IReactSelectOptions<string>>({ label: "", value: "" })

  const availableSerialNumbersQuery = useQuery<string[], Error, string[]>({
    queryKey: [`serial-numbers-of-material-${selectedMaterial.value}`],
    queryFn: () => getSerialNumbersOfMaterial(selectedMaterial.value, selectedTeam.value),
    enabled: selectedMaterial.value != 0 && selectedTeam.value != 0,
  })
  useEffect(() => {

    if (availableSerialNumbersQuery.isSuccess && availableSerialNumbersQuery.data) {
      setAvaiableSerialNumbers([
        ...availableSerialNumbersQuery.data.map<IReactSelectOptions<string>>((val) => ({ value: val, label: val }))
      ])
    }

  }, [availableSerialNumbersQuery.data])

  const addToSerialNumberList = () => {
    const list = [...alreadySelectedSerialNumbers, selectedSerialNumber]
    setAlreadySelectedSerialNumbers(list)

    setAvaiableSerialNumbers(
      availableSerialNumbers.filter((value) => value.value != selectedSerialNumber.value)
    )

    setSelectedSerialNumber({ label: "", value: "" })
    setInvoiceMaterial({
      ...invoiceMaterial,
      serialNumbers: list.map((val) => val.value)
    })
  }

  const deleteSerialNumberFromList = () => {
    const list = alreadySelectedSerialNumbers.filter((value) => value.value != toBeDeletedSerialNumber.value)
    setAlreadySelectedSerialNumbers(list)

    setAvaiableSerialNumbers([
      toBeDeletedSerialNumber,
      ...availableSerialNumbers,
    ])

    setToBeDeletedSerialNumber({ label: "", value: "" })
    setInvoiceMaterial({
      ...invoiceMaterial,
      serialNumbers: list.map((val) => val.value)
    })
  }

  // Adding materials to the list
  const addMaterialToTheList = () => {

    if (selectedMaterial.value == 0) {
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

    if (invoiceMaterial.amount > invoiceMaterial.availableMaterial) {
      toast.error("Количество материала превышает доступное количество")
      return
    }

    if (invoiceMaterial.hasSerialNumbers && alreadySelectedSerialNumbers.length != invoiceMaterial.amount) {
      toast.error("Количество серийных номеров не совпадает с указанным количеством материла")
      return
    }

    setInvoiceMaterials([invoiceMaterial, ...invoiceMaterials])
    setInvoiceMaterial({
      materialID: 0,
      materialName: "",
      availableMaterial: 0,
      unit: "",
      amount: 0,
      notes: "",
      hasSerialNumbers: false,
      serialNumbers: [],
    })
    setSelectedMaterial({ label: "", value: 0 })
    setSelectedSerialNumber({ label: "", value: "" })
    setAvaiableSerialNumbers([])
    setToBeDeletedSerialNumber({ label: "", value: "" })
    setAlreadySelectedSerialNumbers([])
  }

  // Delete from the list
  const deleteFromList = (index: number) => {
    setInvoiceMaterials(invoiceMaterials.filter((_, i) => i != index))
  }

  const createInvoiceObjectMutation = useMutation({
    mutationFn: createInvoiceObject,
  })

  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const submitInvoice = () => {

    if (selectedObject.value == 0) {
      toast.error("Не выбрана объект")
      return
    }

    if (selectedTeam.value == 0) {
      toast.error("Не выбрана бригада")
      return
    }

    if (invoiceMaterials.length == 0) {
      toast.error("Не указаны материалы для поступления")
    }

    createInvoiceObjectMutation.mutate({
      details: {
        objectID: selectedObject.value,
        teamID: selectedTeam.value,
        id: 0,
        deliveryCode: "",
        projectID: 0,
        supervisorWorkerID: 0,
      },
      items: [
        ...invoiceMaterials.map<InvoiceObjectCreateItems>((val) => ({
          materialID: val.materialID,
          amount: val.amount,
          serialNumbers: val.serialNumbers,
          notes: val.notes,
        }))
      ]
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries(["invoice-objects-paginated"])
        navigate(INVOICE_OBJECT)
      }
    })
  }

  return (
    <main>
      <div className="px-2 py-1">
        <span className="font-bold text-xl">Поступление материалов на объект</span>
      </div>
      <div className="px-2 py-1">
        <div className="w-full">
          <Button onClick={() => submitInvoice()} text="Опубликовать" />
        </div>
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
                onChange={(value) => onMaterialSelect(value)}
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
                    amount: e.target.valueAsNumber
                  })}
                  className="text-black rounded-sm px-2 py-1.5"
                />
                <span>Доступно: {invoiceMaterial.availableMaterial}{invoiceMaterial.unit}</span>
              </div>
            </div>
            {invoiceMaterial.hasSerialNumbers &&
              <div className="flex flex-col space-y-4">
                <div className="flex space-x-2">
                  <div className="flex flex-col space-y-1">
                    <label>Доступные серийные номера</label>
                    <Select
                      className="basic-single text-black"
                      classNamePrefix="select"
                      isSearchable={true}
                      isClearable={true}
                      name={"material-cost-material-select"}
                      placeholder={""}
                      value={selectedSerialNumber}
                      options={availableSerialNumbers}
                      onChange={(value) => setSelectedSerialNumber({
                        label: value?.label ?? "",
                        value: value?.value ?? "",
                      })}
                    />
                  </div>
                  <Button onClick={() => addToSerialNumberList()} text="Выбрать" />
                </div>
                <div className="flex space-x-2">
                  <div className="flex flex-col space-y-1">
                    <label>Выбранные серийные номера</label>
                    <Select
                      className="basic-single text-black"
                      classNamePrefix="select"
                      isSearchable={true}
                      isClearable={true}
                      name={"material-cost-material-select"}
                      placeholder={""}
                      value={toBeDeletedSerialNumber}
                      options={alreadySelectedSerialNumbers}
                      onChange={(value) => setToBeDeletedSerialNumber({
                        label: value?.label ?? "",
                        value: value?.value ?? "",
                      })}
                    />
                  </div>
                  <Button onClick={() => deleteSerialNumberFromList()} text="Удалить" buttonType="delete" />
                </div>
              </div>
            }
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
            <div key={index} className="grid grid-cols-2 gap-3 px-3 py-2 bg-gray-800 text-white rounded-md overflow-auto">
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
