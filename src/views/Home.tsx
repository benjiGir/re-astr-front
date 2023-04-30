import { Outlet } from 'react-router-dom';
import Navbar from '@components/navbar/Navbar';
import { main } from '@/styles/style.css';

function Home() {
  return (
    <>
      <Navbar />
      <main className={main}>
        <Outlet />
      </main>
    </>
  );
}

export default Home;
