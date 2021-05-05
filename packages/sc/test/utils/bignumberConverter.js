const { BigNumber } = require("ethers");

module.exports = {
  toNum: (bigNumber) => {
    return Number(BigNumber.from(bigNumber).toString());
  },
  toBN: (number) => {
    return BigNumber.from(number);
  },
};
