import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useState } from 'react'

interface Props{
  children: ReactNode
}

export const ReactQueryProvider = ({children}: Props) => {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        networkMode: 'always',
        retry: false,
      },
      mutations: {
        networkMode: 'always'
      }
    },
  }))
  
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}