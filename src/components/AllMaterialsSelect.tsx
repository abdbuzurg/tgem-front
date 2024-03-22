import { useQuery } from "@tanstack/react-query";
import Select from 'react-select'
import getAllMaterials from "../services/api/materials/getAll";
import Material from "../services/interfaces/material";
import IReactSelectOptions from "../services/interfaces/react-select";
import { useEffect, useState } from "react";
import { IMaterialCost } from "../services/interfaces/materialCost";

interface Props{
  valueName: string
  setValueDispatcher: React.Dispatch<React.SetStateAction<IMaterialCost>>
}

export default function AllMaterialsSelect({ valueName, setValueDispatcher }:Props) {
  const materialQuery = useQuery<Material[], Error, Material[]>({
    queryKey: ["all-materials"],
    queryFn: getAllMaterials,
  })

  const [allData, setAllData] = useState<IReactSelectOptions<number>[]>([])
  const [selectedData, setSelectedData] = useState<IReactSelectOptions<number>>({value: 0, label: ""})

  useEffect(() => {
    if (materialQuery.isSuccess && materialQuery.data) {
      setAllData([...materialQuery.data.map<IReactSelectOptions<number>>((value) => ({value: value.id, label: value.name}))])
    }
  }, [materialQuery.data])

  const onSelectChange = (value: IReactSelectOptions<number> | null) => {
    if (!value) {
      setSelectedData({label: "", value: 0})
      setValueDispatcher((prev) => ({...prev, [valueName]: 0}))
      return
    }

    setValueDispatcher((prev) => ({...prev, [valueName]: value.value}))
    setSelectedData(value)
  }

  return (
        <Select
          className="basic-single"
          classNamePrefix="select"
          isSearchable={true}
          isClearable={true}
          name={"materials"}
          placeholder={""}
          value={selectedData}
          options={allData}
          onChange={(value) => onSelectChange(value)}
        />
  )
}