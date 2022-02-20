import { create, use } from "xoid";
import { useAtom, useSetup } from "@xoid/react";

const ItemsModel = ({ items, getActions, getInitialState }) =>
  create(items, (atom) => {
    let nextId = items.length;
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
          remove: (id) => atom((state) => state.filter((item) => item.id !== id)),
          ...getActions($item)
        };
      }
    };
  });

const useItems = (payload) => {
  const atom = useSetup(() => ItemsModel(payload));
  return useAtom(atom, true);
};

export default useItems