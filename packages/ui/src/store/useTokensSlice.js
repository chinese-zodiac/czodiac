import produce from 'immer';
import axios from "axios";

const useTokensSlice = (set, get) => ({
    tokens: [],
    tokenBalances: [],
    addToken: (token) => set(produce(state => state.tokens.push(token))),
    setTokenBalance: (tokenId,bal) => set(produce(state => state.tokenBalances[tokenId] = bal))
    /*loadTokens: async () => {
      const results = await axios.get("https://storageapi2.fleek.co/plasticdigits-team-bucket/dapp-v2/json/tokens.json");
      ;
    }*/
});

export default useTokensSlice;