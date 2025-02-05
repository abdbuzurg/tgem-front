import { PieChart } from "@mui/x-charts";
import { useQuery } from "@tanstack/react-query";
import { PieChartStat, invoiceCountStat, invoiceInputCreatorStat, invoiceOutputCreatorStat } from "../services/api/statistics";
import LoadingDots from "../components/UI/loadingDots";
import { useEffect } from "react";

export default function Statistics() {

  const invoiceCountStatQuery = useQuery<PieChartStat[], Error>({
    queryKey: ["invoice-count-stat"],
    queryFn: invoiceCountStat,
  })

  const invoiceInputCreatorStatQuery = useQuery<PieChartStat[], Error>({
    queryKey: ["invoice-input-creator-stat"],
    queryFn: invoiceInputCreatorStat,
  })

  const invoiceOutputCreatorStatQuery = useQuery<PieChartStat[], Error>({
    queryKey: ["invoice-output-creator-stat"],
    queryFn: invoiceOutputCreatorStat,
  })

  useEffect(() => {
    console.log(invoiceCountStatQuery.data)
  }, [invoiceCountStatQuery.data])

  return (
    <main className="px-4">
      <div>
        <p className="text-2xl font-bold">Статистика по проекту</p>
      </div>
      <div className="flex space-x-2">
        <div className="py-2 flex flex-col space-y-2">
          <p className="text-xl font-bold">Соотношение операций</p>
          <div>
            {invoiceCountStatQuery.isLoading && <LoadingDots />}
            {invoiceCountStatQuery.isError &&
              <div>{invoiceCountStatQuery.error.message}</div>
            }
            {invoiceCountStatQuery.isSuccess &&
              <PieChart
                series={[
                  {
                    data: [
                      ...invoiceCountStatQuery.data
                    ],
                  },
                ]}
                width={400}
                height={200}
              />
            }
          </div>
        </div>
        <div className="py-2 flex flex-col space-y-2">
          <p className="text-xl font-bold">Составители Накладной Прихода</p>
          <div>
            {invoiceInputCreatorStatQuery.isLoading && <LoadingDots />}
            {invoiceInputCreatorStatQuery.isError &&
              <div>{invoiceInputCreatorStatQuery.error.message}</div>
            }
            {invoiceInputCreatorStatQuery.isSuccess &&
              <PieChart
                series={[
                  {
                    data: [
                      ...invoiceInputCreatorStatQuery.data
                    ],
                  },
                ]}
                width={400}
                height={200}
              />
            }
          </div>
        </div>
        <div className="py-2 flex flex-col space-y-2">
          <p className="text-xl font-bold">Составители Накладной Отпуск</p>
          <div>
            {invoiceOutputCreatorStatQuery.isLoading && <LoadingDots />}
            {invoiceOutputCreatorStatQuery.isError &&
              <div>{invoiceOutputCreatorStatQuery.error.message}</div>
            }
            {invoiceOutputCreatorStatQuery.isSuccess &&
              <PieChart
                series={[
                  {
                    data: [
                      ...invoiceOutputCreatorStatQuery.data
                    ],
                  },
                ]}
                width={400}
                height={200}
              />
            }
          </div>
        </div>
      </div>
    </main>
  )
}
