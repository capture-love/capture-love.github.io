import map from 'lodash/map';

import { UIState } from './types';

type Props = {
  // eslint-disable-next-line no-unused-vars
  onSelect: (state: UIState) => void
}

function DevMenu(props: Props) {
  const handleSelect = (e) => {
    props.onSelect(e.target.value);
  };

  if (import.meta.env.PROD) return null;

  return (
    <div className="dev-menu">
      <div className="ui-menu">
        <span>UI state:</span>
        <select onChange={handleSelect}>
          {map(UIState, (state) => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default DevMenu;
