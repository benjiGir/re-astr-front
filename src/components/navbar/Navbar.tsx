import Icon from '@components/icons/Icon';
import { css } from 'styled-system/css';

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
      <p className={css({ fontSize: 'xl' })}>ASTR</p>
      <Icon name="defaultProfilePic" className={css({ width: '8', height: '8' })} />
    </nav>
  );
};

export default Navbar;
