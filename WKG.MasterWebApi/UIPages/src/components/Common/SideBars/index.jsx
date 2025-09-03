
import './SideBars.css';
//import Logo from './Logo'
import brand from './brand.png'

function SideBars(props) {

  function onMenuIconClick(menu) {
    if (props && props.onClick) {
      props.onClick(menu);
    }
  };
  return (<div className="sidebar-menu">
    <a href="#" className="logo text-center logo-dark">
      <span>
        <img src={brand} alt='We Know Group' style={{ width: '90%', height: '90%' }} />
      </span>
    </a>
    <div className="d-flex flex-column flex-shrink-0 bg-light h-100 position-relative sidebar-menu-holder" >

      <ul className="nav nav-pills nav-flush flex-column mb-auto text-center border-top" >
        {props.menus.map((m, idx) => {

          return (<li key={`APP_MENU_${idx}`} className="nav-item has-submenu" onClick={() => onMenuIconClick(m)}>
            <a href="#" className="nav-link  py-3 border-bottom d-flex flex-column" title={m.Text} data-bs-toggle="tooltip" data-bs-placement="right">
              <span className="material-icons">
                {m.Icon}
              </span>
              <span className='fw-bold'>{m.Text}</span>
            </a>
          </li>);
        })}
      </ul>
    </div>
  </div>);
}

export { SideBars };