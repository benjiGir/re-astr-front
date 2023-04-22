import Login from '@components/login/Login';
import Home from '@views/Home';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const Router = () => {
  const router = createBrowserRouter([
    {
      path: 'home',
      element: <Home />,
      children: [
        {
          path: 'login',
          element: <Login />
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};

export default Router;
