import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useState } from 'react'
import toast from 'react-hot-toast'

interface Props{
  children: ReactNode
}

export const ReactQueryProvider = ({children}: Props) => {
  const [queryClient] = useState(() => new QueryClient({
    queryCache: new QueryCache({
      onError(error: any, query) {
        toast.error(error.message)
      },
    }),
    mutationCache: new MutationCache({
      onError(error: any, variables, context, mutation) {
        toast.error(error.message)
      },
    }),
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        networkMode: 'always',
        retry: false,
      },
      mutations: {
        networkMode: 'always',
        retry: false,
      }
    },
  }))
  
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}