import Login from '@/components/forms/login/Login';
import Home from '@views/Home';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const Router = () => {
  const router = createBrowserRouter([
    {
      path: '',
      element: <Home />,
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
