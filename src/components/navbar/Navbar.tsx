import Icon from '@components/icons/Icon';
import { Link } from 'react-router-dom';
import { css } from 'styled-system/css';
import { hstack } from 'styled-system/patterns';

const Navbar = () => {
  return (
    <nav
      className={css({
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'shade3',
        paddingX: 'md',
        height: '16',
      })}
    >
      <div className={hstack()}>
        <p className={css({ fontSize: 'xl' })}>ASTR</p>
        <Link to="/login">Login</Link>
      </div>
      <Icon name="defaultProfilePic" className={css({ width: '8', height: '8' })} />
    </nav>
  );
};

export default Navbar;
