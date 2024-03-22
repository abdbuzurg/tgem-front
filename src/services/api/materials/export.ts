import fileDownload from "js-file-download";
import Material from "../../interfaces/material";
import axiosClient from "../axiosClient";

export default async function exportMaterials(data: Material[]): Promise<boolean> {
  const responseRaw = await axiosClient.post("/material/export", data, { responseType: "blob" })
  if (responseRaw.status == 200) {
    fileDownload(responseRaw.data, "Материалы.xlsx")
    return true
  } else {
    throw new Error(responseRaw.data)
  }
}