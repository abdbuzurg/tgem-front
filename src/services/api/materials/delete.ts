import axiosClient from "../axiosClient";

export default async function deleteMaterial(key: number) {
  const responseRaw = await axiosClient.delete(`/material/${key}`)
  const response = responseRaw.data
  return response.success 
}