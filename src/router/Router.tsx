import App from '@/App';
import Home from '@/views/Home';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const Router = () => {
  const router = createBrowserRouter([
    {
      path: 'home',
      element: <Home />,
      children: [
        {
          path: 'login',
          element: <div>Login page</div>
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};

export default Router;
