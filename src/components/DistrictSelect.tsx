import { useEffect, useState } from 'react'
import Select from 'react-select'
import IReactSelectOptions from '../services/interfaces/react-select'
import { useQuery } from '@tanstack/react-query'
import { getAllDistricts } from '../services/api/district'
import { IDistrict } from '../services/interfaces/district'

interface Props {
  selectedDistrictID: IReactSelectOptions<number>
  setSelectedDistrictID: React.Dispatch<React.SetStateAction<IReactSelectOptions<number>>>
}

export default function DistrictSelect({ selectedDistrictID, setSelectedDistrictID }:Props) {
  const [allData, setAllData] = useState<IReactSelectOptions<number>[]>([])

  const query = useQuery<IDistrict[], Error, IDistrict[]>({
    queryKey: [`all-districts`],
    queryFn: getAllDistricts
  })

  useEffect(() => {
    if (query.isSuccess && query.data) {
      setAllData([...query.data.map<IReactSelectOptions<number>>((value) => ({label: value.name, value: value.id}))])
    }
  }, [query.data])

  const onSelectChange = (value: IReactSelectOptions<number> | null) => {
    if (!value) {
      setSelectedDistrictID({label: "", value: 0})
      return
    }

    setSelectedDistrictID(value)
  }

  return (
    <div className="flex flex-col space-y-1">
      <label htmlFor="teams">Район</label>
      <div className="w-[200px]">
        <Select
          className="basic-single"
          classNamePrefix="select"
          isSearchable={true}
          isClearable={true}
          name={"teams"}
          placeholder={""}
          value={selectedDistrictID}
          options={allData}
          onChange={(value) => onSelectChange(value)}
        />
      </div>
    </div>
  )
}
