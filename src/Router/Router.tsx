import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import NavLayout from "../Layouts/NavLayout";
import HomePage from "../pages/HomePage";

const Router = () => {
  const router = createBrowserRouter([
    { path: "/login", element: <LoginPage /> },
    {
      path: "/",
      element: <NavLayout />,
      children: [
        {
          path: "/home",
          element: <HomePage />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};

export default Router;
