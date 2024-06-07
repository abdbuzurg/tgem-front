import { useEffect, useState } from "react";
import IReactSelectOptions from "../../../services/interfaces/react-select";
import Modal from "../../Modal";
import Select from 'react-select'
import { useQuery } from "@tanstack/react-query";
import getAllMaterials from "../../../services/api/materials/getAll";
import Material from "../../../services/interfaces/material";
import Input from "../../UI/Input";
import { IInvoiceObjectMaterials } from "../../../services/interfaces/invoiceObject";
import { InvoiceCorrectionMaterial, getSerialNumbersOfMaterialInTeam, getTotalAmounByTeamNumber } from "../../../services/api/invoiceCorrection";
import toast from "react-hot-toast";
import Button from "../../UI/button";

interface Props {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>
  teamNumber: string
  materialData: InvoiceCorrectionMaterial
}

export default function MaterialCorrectionModal({
  setShowModal,
  materialData,
  teamNumber,
}: Props) {

  const [selectedMaterial, setSelectedMaterial] = useState<IReactSelectOptions<number>>({ label: "", value: 0 })
  const [availableMaterials, setAvailableMaterials] = useState<IReactSelectOptions<number>[]>([])
  const materialQuery = useQuery<Material[], Error, Material[]>({
    queryKey: ["all-materials"],
    queryFn: getAllMaterials,
  })
  useEffect(() => {
    if (materialQuery.isSuccess && materialQuery.data) {
      setAvailableMaterials([
        ...materialQuery.data.map<IReactSelectOptions<number>>(val => ({
          value: val.id,
          label: val.name,
        }))
      ])
      const material = materialQuery.data.find((val) => val.name == materialData.materialName)!
      setSelectedMaterial({
        value: material.id,
        label: material.name,
      })
      setCorrection({
        ...correction,
        materialID: material.id,
        hasSerialNumbers: material.hasSerialNumber,
        unit: material.unit,
      })
    }
  }, [materialQuery.data])

  useEffect(() => {
    if (materialQuery.isSuccess && materialQuery.data) {
      const material = materialQuery.data.find((val) => val.name == materialData.materialName)!
      setCorrection({
        ...correction,
        materialID: material.id,
        hasSerialNumbers: material.hasSerialNumber,
        unit: material.unit,
      })
    }

  }, [selectedMaterial])

  // 
  const [correction, setCorrection] = useState<IInvoiceObjectMaterials>({
    materialID: 0,
    materialName: materialData.materialName,
    availableMaterial: 0,
    unit: "",
    amount: 0,
    notes: "",
    hasSerialNumbers: false,
    serialNumbers: [],
  })

  const materialAmountQuery = useQuery<number, Error, number>({
    queryKey: [`total-amount-material-${selectedMaterial.value}-team-number-${teamNumber}`],
    queryFn: () => getTotalAmounByTeamNumber(selectedMaterial.value, teamNumber),
    enabled: selectedMaterial.value != 0,
  })
  useEffect(() => {
    if (materialAmountQuery.isSuccess && materialAmountQuery.data) {
      setCorrection({
        ...correction,
        availableMaterial: materialAmountQuery.data,
      })
    }
  }, [])

  const [availableSerialNumbers, setAvaiableSerialNumbers] = useState<IReactSelectOptions<string>[]>([])
  const [selectedSerialNumber, setSelectedSerialNumber] = useState<IReactSelectOptions<string>>({ label: "", value: "" })
  const [alreadySelectedSerialNumbers, setAlreadySelectedSerialNumbers] = useState<IReactSelectOptions<string>[]>([])
  const [toBeDeletedSerialNumber, setToBeDeletedSerialNumber] = useState<IReactSelectOptions<string>>({ label: "", value: "" })

  const availableSerialNumbersQuery = useQuery<string[], Error, string[]>({
    queryKey: [`serial-numbers-of-material-${selectedMaterial.value}`],
    queryFn: () => getSerialNumbersOfMaterialInTeam(selectedMaterial.value, teamNumber),
    enabled: selectedMaterial.value != 0,
  })
  useEffect(() => {

    if (availableSerialNumbersQuery.isSuccess && availableSerialNumbersQuery.data) {
      setAvaiableSerialNumbers([
        ...availableSerialNumbersQuery.data.map<IReactSelectOptions<string>>((val) => ({ value: val, label: val }))
      ])
    }

  }, [availableSerialNumbersQuery.data])

  const addToSerialNumberList = () => {
    const index = alreadySelectedSerialNumbers.findIndex((val) => selectedSerialNumber.value == val.value)
    if (index != -1) {
      toast.error("Данный серийний код уже в списке")
      return
    }
    setAlreadySelectedSerialNumbers([selectedSerialNumber, ...alreadySelectedSerialNumbers])
    setSelectedSerialNumber({ label: "", value: "" })
  }

  const deleteSerialNumberFromList = () => {
    setAlreadySelectedSerialNumbers([...alreadySelectedSerialNumbers.filter((val) => val.value != toBeDeletedSerialNumber.value)])
    setToBeDeletedSerialNumber({ label: "", value: "" })
  }

  return (
    <Modal setShowModal={setShowModal}>
      <div className="flex flex-col space-y-2">
        <span className="font-bold text-2xl">Корректировка материла</span>
        <div className="flex flex-col space-y-1">
          <label className="font-bold">Наименование</label>
          <Select
            className="basic-single"
            classNamePrefix="select"
            isSearchable={true}
            isClearable={true}
            name={"materials"}
            placeholder={""}
            value={selectedMaterial}
            options={availableMaterials}
            onChange={(value) => setSelectedMaterial({
              value: value?.value ?? 0,
              label: value?.label ?? "",
            })}
          />
        </div>
        <div className="flex space-x-2 items-end">
          <div className="flex flex-col space-y-1">
            <label className="font-bold">Количество</label>
            <Input
              name="amount"
              type="number"
              value={correction.amount}
              onChange={(e) => setCorrection({
                ...correction,
                amount: e.target.valueAsNumber
              })}
            />
          </div>
          <span>Доступно - {correction.availableMaterial}{correction.unit}</span>
        </div>
        {correction.hasSerialNumbers &&
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
                <label>Выбранные серийные материалы</label>
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
        <div>
          <label className="font-bold">Примичание</label>
          <textarea
            className="w-full"
            value={correction.notes}
            onChange={(e) => setCorrection({ ...correction, notes: e.target.value })}
          />
        </div>
      </div>
    </Modal>
  )
}
