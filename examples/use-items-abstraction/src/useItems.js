import { create, use } from "xoid";
import { useSetup } from "@xoid/react";

const ItemsModel = ($props, { getActions, getInitialState }) =>
  create(
    (get) => get($props, "value"),
    (atom) => {
      let nextId = atom().length;
      const getItem = (id) => {
        const index = atom().findIndex((item) => item.id === id);
        return use(atom, (s) => s[index]);
      };

      return {
        add: () => {
          atom((state) => [...state, getInitialState(nextId)]);
          nextId++;
        },
        getActions: (id) => {
          const $item = getItem(id);
          return {
            remove: (id) =>
              atom((state) => state.filter((item) => item.id !== id)),
            ...getActions($item)
          };
        }
      };
    },
    () => (value) => use($props, "onChange")()(value)
  );

const useItems = ({ value, onChange, getActions, getInitialState }) => {
  const atom = useSetup(
    ($props) => ItemsModel($props, { getActions, getInitialState }),
    { value, onChange }
  );
  return use(atom);
};

export default useItems;
