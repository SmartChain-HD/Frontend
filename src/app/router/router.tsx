import { createBrowserRouter } from 'react-router-dom';
import { ROUTES } from '@app/router/constant/routes';
import Layout from '@app/router/Layout';
import Login from '@features/login/DummyPage';

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: ROUTES.LOGIN,
        element: <Login />,
      },
    ],
  },
]);