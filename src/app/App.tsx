import { RouterProvider } from 'react-router-dom';

import { router } from '@app/router/router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import '@shared/styles/global.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;