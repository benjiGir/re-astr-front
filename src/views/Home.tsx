import { Outlet } from 'react-router-dom';
import Navbar from '@components/navbar/Navbar';
import { stack } from 'styled-system/patterns';

function Home() {
  return (
    <>
      <Navbar />
      <main className={stack({ justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw' })}>
        <Outlet />
      </main>
    </>
  );
}

export default Home;
