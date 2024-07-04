import { useEffect, useState } from 'react'
import Select from 'react-select'
import IReactSelectOptions from '../services/interfaces/react-select'
import { useQuery } from '@tanstack/react-query'
import { IObject } from '../services/interfaces/objects'
import axiosClient from '../services/api/axiosClient'
import IAPIResposeFormat from '../services/api/IAPIResposeFormat'
import { objectTypeIntoRus } from '../services/lib/objectStatuses'

interface Props {
  selectedObjectID: IReactSelectOptions<number>
  setSelectedObjectID: React.Dispatch<React.SetStateAction<IReactSelectOptions<number>>>
}

export default function ObjectSelect({ selectedObjectID, setSelectedObjectID }:Props) {
  const [allData, setAllData] = useState<IReactSelectOptions<number>[]>([])

  const query = useQuery<IObject[], Error, IObject[]>({
    queryKey: [`all-objects`],
    queryFn: async () => {
      const responseRaw = await axiosClient.get<IAPIResposeFormat<IObject[]>>(`/object/all`)
      const response = responseRaw.data
      if (response.permission && response.success) {
        return response.data
      } else {
        throw new Error(response.error)
      }
    }
  })

  useEffect(() => {
    if (query.isSuccess && query.data.length > 0) {
      setAllData([...query.data.map<IReactSelectOptions<number>>((value) => ({label: value.name + " (" + objectTypeIntoRus(value.type) + ")", value: value.id}))])
    }
  }, [query.data])

  const onSelectChange = (value: IReactSelectOptions<number> | null) => {
    if (!value) {
      setSelectedObjectID({label: "", value: 0})
      return
    }

    setSelectedObjectID(value)
  }

  return (
    <div className="flex flex-col space-y-1">
      <label htmlFor={"objects"}>Объект</label>
      <div className="w-[200px]">
        <Select
          className="basic-single"
          classNamePrefix="select"
          isSearchable={true}
          isClearable={true}
          name={"objects"}
          placeholder={""}
          value={selectedObjectID}
          options={allData}
          onChange={(value) => onSelectChange(value)}
        />
      </div>
    </div>
  )
}
