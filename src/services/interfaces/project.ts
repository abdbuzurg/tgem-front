export default interface Project {
  id: number
  name: string
  client: string
  budget: number
  description: string
  signedDateOfContract: Date
  dateStart: Date
  dateEnd: Date
}