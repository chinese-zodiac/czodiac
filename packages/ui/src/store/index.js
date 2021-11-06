import create from 'zustand';
import useTokensSlice from './useTokensSlice';

const useStore = create( (set, get) => ({
    ...useTokensSlice(set, get)
}))