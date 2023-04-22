import App from '@/App';
import Login from '@/views/login/Login';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const Router = () => {
  const router = createBrowserRouter([
    {
      path: '',
      element: <App />,
      children: [
        {
          path: 'login',
          element: <Login />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};

export default Router;
