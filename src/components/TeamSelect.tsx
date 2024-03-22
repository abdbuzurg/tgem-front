import { useEffect, useState } from 'react'
import Select from 'react-select'
import IReactSelectOptions from '../services/interfaces/react-select'
import { useQuery } from '@tanstack/react-query'
import axiosClient from '../services/api/axiosClient'
import IAPIResposeFormat from '../services/api/IAPIResposeFormat'
import { ITeam } from '../services/interfaces/teams'

interface Props {
  selectedTeamID: IReactSelectOptions<number>
  setSelectedTeamID: React.Dispatch<React.SetStateAction<IReactSelectOptions<number>>>
}

export default function TeamSelect({ selectedTeamID, setSelectedTeamID }:Props) {
  const [allData, setAllData] = useState<IReactSelectOptions<number>[]>([])

  const query = useQuery<ITeam[], Error, ITeam[]>({
    queryKey: [`all-teams`],
    queryFn: async () => {
      const responseRaw = await axiosClient.get<IAPIResposeFormat<ITeam[]>>(`/team/all`)
      const response = responseRaw.data
      if (response.permission && response.success) {
        return response.data
      } else {
        throw new Error(response.error)
      }
    }
  })

  useEffect(() => {
    if (query.isSuccess && query.data) {
      setAllData([...query.data.map<IReactSelectOptions<number>>((value) => ({label: value.number, value: value.id}))])
    }
  }, [query.data])

  const onSelectChange = (value: IReactSelectOptions<number> | null) => {
    if (!value) {
      setSelectedTeamID({label: "", value: 0})
      return
    }

    setSelectedTeamID(value)
  }

  return (
    <div className="flex flex-col space-y-1">
      <label htmlFor="teams">Бригада</label>
      <div className="w-[200px]">
        <Select
          className="basic-single"
          classNamePrefix="select"
          isSearchable={true}
          isClearable={true}
          name={"teams"}
          placeholder={""}
          value={selectedTeamID}
          options={allData}
          onChange={(value) => onSelectChange(value)}
        />
      </div>
    </div>
  )
}