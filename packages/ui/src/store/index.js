import create from "zustand";
import useTokensSlice from './useTokensSlice';

const createStore = () => create( (set, get) => ({
    ...useTokensSlice(set, get)
}));

export default createStore;