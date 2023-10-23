import { useQuery } from "@tanstack/react-query"
import { Tbl_Team } from "../services/interfaces/teams"
import getAllTeams from "../services/api/teams/getAll"
import { useEffect, useState } from "react"
import IReactSelectOptions from "../services/interfaces/react-select"
import Select from 'react-select'
import LoadingDots from "./UI/loadingDots"

interface Props {
  currentTeamKey?: number
  setTeamData: (key_team: number, team_leader: string, team_no: string) => void
}

export default function InvoiceTeamSelect({ currentTeamKey, setTeamData }: Props) {
  const teamsData = useQuery<Tbl_Team[], Error>({
    queryKey: ["team-data"],
    queryFn: getAllTeams
  })

  const [dataForTeamNo, setDataForTeamNo] = useState<IReactSelectOptions<number>[]>([])
  const [currentTeamNo, setCurrentTeamNo] = useState<IReactSelectOptions<number>>({label: "", value: 0})
  const [dataForTeamLeader, setDataForTeamLeader] = useState<IReactSelectOptions<number>[]>([])
  const [currentTeamLeader, setCurrentTeamLeader] = useState<IReactSelectOptions<number>>({label: "", value: 0})

  useEffect(() => {
    if (teamsData.isSuccess && teamsData.data) {
      setDataForTeamNo([...teamsData.data.map<IReactSelectOptions<number>>((v) => ({label: v.team_no, value: v.key_team}))])
      setDataForTeamLeader([...teamsData.data.map<IReactSelectOptions<number>>((v) => ({label: v.team_leader, value: v.key_team}))])
      if (currentTeamKey) {
        const currentTeam = teamsData.data.find((v) => v.key_team == currentTeamKey)!
        setCurrentTeamNo({ label: currentTeam.team_no, value: currentTeam.key_team})
        setCurrentTeamLeader({ label: currentTeam.team_leader, value: currentTeam.key_team})
      }
    }
  }, [teamsData.data])

  const onTeamNoSelect = (value: null | IReactSelectOptions<number>) => {
    if (!value) {
      setCurrentTeamNo({label: "", value: 0})
      setCurrentTeamLeader({label: "", value: 0})
      setTeamData(0, "", "")
      return
    }

    setCurrentTeamNo(value)
    if (teamsData.data) {
      const currentTeam = teamsData.data.find((v) => v.key_team == value.value)!
      setCurrentTeamLeader({label: currentTeam.team_leader, value: value.value})
      setTeamData(value.value, currentTeam.team_leader, currentTeam.team_no)
    }
  }

  const onTeamLeaderSelect = (value: null | IReactSelectOptions<number>) => {
    if (!value) {
      setCurrentTeamNo({label: "", value: 0})
      setCurrentTeamLeader({label: "", value: 0})
      setTeamData(0, "", "")
      return
    }

    setCurrentTeamLeader(value)
    if (teamsData.data) {
      const currentTeam = teamsData.data.find((v) => v.key_team == value.value)!
      setCurrentTeamNo({label: currentTeam.team_no, value: value.value})
      setTeamData(value.value, currentTeam.team_leader, currentTeam.team_no)
    }
  }

  return (
    <>
      {teamsData.isLoading && <LoadingDots />}
      {teamsData.isError &&
        <div>
          <span className="text-red font-bold text-center">Ошибка при получении данных {teamsData.error.message}</span>
        </div>
      }
      {teamsData.isSuccess &&
        <div className="flex space-x-5">
          <div className="flex flex-col space-y-1">
            <label htmlFor="team-no-select" className="font-bold"><span className="font-bold text-red-700">*</span>Бриганада №</label>
            <Select
              className="basic-single"
              classNamePrefix="select"
              isSearchable={true}
              isClearable={true}
              name={"team-no-select"}
              placeholder={""}
              value={currentTeamNo}
              styles={{
                container: (base) => ({...base, minWidth:"150px", maxWidth: "300px", borderColor:"red"}), 
                valueContainer: (base) => ({...base, minWidth:"150px", maxWidth:"300px", borderColor: "red"})
              }}
              options={dataForTeamNo}
              onChange={(value) => onTeamNoSelect(value)}
            />
          </div>
          <div className="flex flex-col space-y-1">
            <label htmlFor="team-leader-select" className="font-bold"><span className="font-bold text-red-700">*</span>Бригадир</label>
            <Select
              className="basic-single"
              classNamePrefix="select"
              isSearchable={true}
              isClearable={true}
              name={"team-leader-select"}
              placeholder={""}
              value={currentTeamLeader}
              styles={{
                container: (base) => ({...base, minWidth:"150px", maxWidth: "300px", borderColor:"red"}), 
                valueContainer: (base) => ({...base, minWidth:"150px", maxWidth:"300px", borderColor: "red"})
              }}
              options={dataForTeamLeader}
              onChange={(value) => onTeamLeaderSelect(value)}
            />
          </div>
        </div>
      }
    </>
  )
}