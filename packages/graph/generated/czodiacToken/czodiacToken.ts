// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt
} from "@graphprotocol/graph-ts";

export class Approval extends ethereum.Event {
  get params(): Approval__Params {
    return new Approval__Params(this);
  }
}

export class Approval__Params {
  _event: Approval;

  constructor(event: Approval) {
    this._event = event;
  }

  get owner(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get spender(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get value(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }
}

export class BurnEvent extends ethereum.Event {
  get params(): BurnEvent__Params {
    return new BurnEvent__Params(this);
  }
}

export class BurnEvent__Params {
  _event: BurnEvent;

  constructor(event: BurnEvent) {
    this._event = event;
  }

  get tokenAmount(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }
}

export class Creation extends ethereum.Event {
  get params(): Creation__Params {
    return new Creation__Params(this);
  }
}

export class Creation__Params {
  _event: Creation;

  constructor(event: Creation) {
    this._event = event;
  }

  get _uniswapV2Router(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get _prevCzodiac(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get _name(): string {
    return this._event.parameters[2].value.toString();
  }

  get _symbol(): string {
    return this._event.parameters[3].value.toString();
  }

  get _totalSupply(): BigInt {
    return this._event.parameters[4].value.toBigInt();
  }

  get _swapStartTimestamp(): BigInt {
    return this._event.parameters[5].value.toBigInt();
  }

  get _swapEndTimestamp(): BigInt {
    return this._event.parameters[6].value.toBigInt();
  }
}

export class DevRewardsEvent extends ethereum.Event {
  get params(): DevRewardsEvent__Params {
    return new DevRewardsEvent__Params(this);
  }
}

export class DevRewardsEvent__Params {
  _event: DevRewardsEvent;

  constructor(event: DevRewardsEvent) {
    this._event = event;
  }

  get tokenAmount(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }
}

export class HolderRewardsEvent extends ethereum.Event {
  get params(): HolderRewardsEvent__Params {
    return new HolderRewardsEvent__Params(this);
  }
}

export class HolderRewardsEvent__Params {
  _event: HolderRewardsEvent;

  constructor(event: HolderRewardsEvent) {
    this._event = event;
  }

  get tokenAmount(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }
}

export class LPRewardsEvent extends ethereum.Event {
  get params(): LPRewardsEvent__Params {
    return new LPRewardsEvent__Params(this);
  }
}

export class LPRewardsEvent__Params {
  _event: LPRewardsEvent;

  constructor(event: LPRewardsEvent) {
    this._event = event;
  }

  get tokenAmount(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }
}

export class OwnershipTransferred extends ethereum.Event {
  get params(): OwnershipTransferred__Params {
    return new OwnershipTransferred__Params(this);
  }
}

export class OwnershipTransferred__Params {
  _event: OwnershipTransferred;

  constructor(event: OwnershipTransferred) {
    this._event = event;
  }

  get previousOwner(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get newOwner(): Address {
    return this._event.parameters[1].value.toAddress();
  }
}

export class Swap extends ethereum.Event {
  get params(): Swap__Params {
    return new Swap__Params(this);
  }
}

export class Swap__Params {
  _event: Swap;

  constructor(event: Swap) {
    this._event = event;
  }

  get _swapper(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get _amountToBurn(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }

  get _amountToMint(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }
}

export class Transfer extends ethereum.Event {
  get params(): Transfer__Params {
    return new Transfer__Params(this);
  }
}

export class Transfer__Params {
  _event: Transfer;

  constructor(event: Transfer) {
    this._event = event;
  }

  get from(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get to(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get value(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }
}

export class czodiacToken extends ethereum.SmartContract {
  static bind(address: Address): czodiacToken {
    return new czodiacToken("czodiacToken", address);
  }

  allowance(owner: Address, spender: Address): BigInt {
    let result = super.call(
      "allowance",
      "allowance(address,address):(uint256)",
      [ethereum.Value.fromAddress(owner), ethereum.Value.fromAddress(spender)]
    );

    return result[0].toBigInt();
  }

  try_allowance(owner: Address, spender: Address): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "allowance",
      "allowance(address,address):(uint256)",
      [ethereum.Value.fromAddress(owner), ethereum.Value.fromAddress(spender)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  approve(spender: Address, amount: BigInt): boolean {
    let result = super.call("approve", "approve(address,uint256):(bool)", [
      ethereum.Value.fromAddress(spender),
      ethereum.Value.fromUnsignedBigInt(amount)
    ]);

    return result[0].toBoolean();
  }

  try_approve(spender: Address, amount: BigInt): ethereum.CallResult<boolean> {
    let result = super.tryCall("approve", "approve(address,uint256):(bool)", [
      ethereum.Value.fromAddress(spender),
      ethereum.Value.fromUnsignedBigInt(amount)
    ]);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  balanceOf(account: Address): BigInt {
    let result = super.call("balanceOf", "balanceOf(address):(uint256)", [
      ethereum.Value.fromAddress(account)
    ]);

    return result[0].toBigInt();
  }

  try_balanceOf(account: Address): ethereum.CallResult<BigInt> {
    let result = super.tryCall("balanceOf", "balanceOf(address):(uint256)", [
      ethereum.Value.fromAddress(account)
    ]);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  decimals(): i32 {
    let result = super.call("decimals", "decimals():(uint8)", []);

    return result[0].toI32();
  }

  try_decimals(): ethereum.CallResult<i32> {
    let result = super.tryCall("decimals", "decimals():(uint8)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toI32());
  }

  decreaseAllowance(spender: Address, subtractedValue: BigInt): boolean {
    let result = super.call(
      "decreaseAllowance",
      "decreaseAllowance(address,uint256):(bool)",
      [
        ethereum.Value.fromAddress(spender),
        ethereum.Value.fromUnsignedBigInt(subtractedValue)
      ]
    );

    return result[0].toBoolean();
  }

  try_decreaseAllowance(
    spender: Address,
    subtractedValue: BigInt
  ): ethereum.CallResult<boolean> {
    let result = super.tryCall(
      "decreaseAllowance",
      "decreaseAllowance(address,uint256):(bool)",
      [
        ethereum.Value.fromAddress(spender),
        ethereum.Value.fromUnsignedBigInt(subtractedValue)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  globalRewardsEnabled(): boolean {
    let result = super.call(
      "globalRewardsEnabled",
      "globalRewardsEnabled():(bool)",
      []
    );

    return result[0].toBoolean();
  }

  try_globalRewardsEnabled(): ethereum.CallResult<boolean> {
    let result = super.tryCall(
      "globalRewardsEnabled",
      "globalRewardsEnabled():(bool)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  increaseAllowance(spender: Address, addedValue: BigInt): boolean {
    let result = super.call(
      "increaseAllowance",
      "increaseAllowance(address,uint256):(bool)",
      [
        ethereum.Value.fromAddress(spender),
        ethereum.Value.fromUnsignedBigInt(addedValue)
      ]
    );

    return result[0].toBoolean();
  }

  try_increaseAllowance(
    spender: Address,
    addedValue: BigInt
  ): ethereum.CallResult<boolean> {
    let result = super.tryCall(
      "increaseAllowance",
      "increaseAllowance(address,uint256):(bool)",
      [
        ethereum.Value.fromAddress(spender),
        ethereum.Value.fromUnsignedBigInt(addedValue)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  isExcludedFromFee(account: Address): boolean {
    let result = super.call(
      "isExcludedFromFee",
      "isExcludedFromFee(address):(bool)",
      [ethereum.Value.fromAddress(account)]
    );

    return result[0].toBoolean();
  }

  try_isExcludedFromFee(account: Address): ethereum.CallResult<boolean> {
    let result = super.tryCall(
      "isExcludedFromFee",
      "isExcludedFromFee(address):(bool)",
      [ethereum.Value.fromAddress(account)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  isExcludedFromReward(account: Address): boolean {
    let result = super.call(
      "isExcludedFromReward",
      "isExcludedFromReward(address):(bool)",
      [ethereum.Value.fromAddress(account)]
    );

    return result[0].toBoolean();
  }

  try_isExcludedFromReward(account: Address): ethereum.CallResult<boolean> {
    let result = super.tryCall(
      "isExcludedFromReward",
      "isExcludedFromReward(address):(bool)",
      [ethereum.Value.fromAddress(account)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  name(): string {
    let result = super.call("name", "name():(string)", []);

    return result[0].toString();
  }

  try_name(): ethereum.CallResult<string> {
    let result = super.tryCall("name", "name():(string)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toString());
  }

  nextCzodiac(): Address {
    let result = super.call("nextCzodiac", "nextCzodiac():(address)", []);

    return result[0].toAddress();
  }

  try_nextCzodiac(): ethereum.CallResult<Address> {
    let result = super.tryCall("nextCzodiac", "nextCzodiac():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  owner(): Address {
    let result = super.call("owner", "owner():(address)", []);

    return result[0].toAddress();
  }

  try_owner(): ethereum.CallResult<Address> {
    let result = super.tryCall("owner", "owner():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  prevCzodiac(): Address {
    let result = super.call("prevCzodiac", "prevCzodiac():(address)", []);

    return result[0].toAddress();
  }

  try_prevCzodiac(): ethereum.CallResult<Address> {
    let result = super.tryCall("prevCzodiac", "prevCzodiac():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  reflectionFromToken(tAmount: BigInt, deductTransferFee: boolean): BigInt {
    let result = super.call(
      "reflectionFromToken",
      "reflectionFromToken(uint256,bool):(uint256)",
      [
        ethereum.Value.fromUnsignedBigInt(tAmount),
        ethereum.Value.fromBoolean(deductTransferFee)
      ]
    );

    return result[0].toBigInt();
  }

  try_reflectionFromToken(
    tAmount: BigInt,
    deductTransferFee: boolean
  ): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "reflectionFromToken",
      "reflectionFromToken(uint256,bool):(uint256)",
      [
        ethereum.Value.fromUnsignedBigInt(tAmount),
        ethereum.Value.fromBoolean(deductTransferFee)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  swapEndTimestamp(): BigInt {
    let result = super.call(
      "swapEndTimestamp",
      "swapEndTimestamp():(uint256)",
      []
    );

    return result[0].toBigInt();
  }

  try_swapEndTimestamp(): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "swapEndTimestamp",
      "swapEndTimestamp():(uint256)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  swapStartTimestamp(): BigInt {
    let result = super.call(
      "swapStartTimestamp",
      "swapStartTimestamp():(uint256)",
      []
    );

    return result[0].toBigInt();
  }

  try_swapStartTimestamp(): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "swapStartTimestamp",
      "swapStartTimestamp():(uint256)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  symbol(): string {
    let result = super.call("symbol", "symbol():(string)", []);

    return result[0].toString();
  }

  try_symbol(): ethereum.CallResult<string> {
    let result = super.tryCall("symbol", "symbol():(string)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toString());
  }

  tokenFromReflection(rAmount: BigInt): BigInt {
    let result = super.call(
      "tokenFromReflection",
      "tokenFromReflection(uint256):(uint256)",
      [ethereum.Value.fromUnsignedBigInt(rAmount)]
    );

    return result[0].toBigInt();
  }

  try_tokenFromReflection(rAmount: BigInt): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "tokenFromReflection",
      "tokenFromReflection(uint256):(uint256)",
      [ethereum.Value.fromUnsignedBigInt(rAmount)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  totalLiquidityProviderRewards(): BigInt {
    let result = super.call(
      "totalLiquidityProviderRewards",
      "totalLiquidityProviderRewards():(uint256)",
      []
    );

    return result[0].toBigInt();
  }

  try_totalLiquidityProviderRewards(): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "totalLiquidityProviderRewards",
      "totalLiquidityProviderRewards():(uint256)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  totalSupply(): BigInt {
    let result = super.call("totalSupply", "totalSupply():(uint256)", []);

    return result[0].toBigInt();
  }

  try_totalSupply(): ethereum.CallResult<BigInt> {
    let result = super.tryCall("totalSupply", "totalSupply():(uint256)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  transfer(recipient: Address, amount: BigInt): boolean {
    let result = super.call("transfer", "transfer(address,uint256):(bool)", [
      ethereum.Value.fromAddress(recipient),
      ethereum.Value.fromUnsignedBigInt(amount)
    ]);

    return result[0].toBoolean();
  }

  try_transfer(
    recipient: Address,
    amount: BigInt
  ): ethereum.CallResult<boolean> {
    let result = super.tryCall("transfer", "transfer(address,uint256):(bool)", [
      ethereum.Value.fromAddress(recipient),
      ethereum.Value.fromUnsignedBigInt(amount)
    ]);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  transferFrom(sender: Address, recipient: Address, amount: BigInt): boolean {
    let result = super.call(
      "transferFrom",
      "transferFrom(address,address,uint256):(bool)",
      [
        ethereum.Value.fromAddress(sender),
        ethereum.Value.fromAddress(recipient),
        ethereum.Value.fromUnsignedBigInt(amount)
      ]
    );

    return result[0].toBoolean();
  }

  try_transferFrom(
    sender: Address,
    recipient: Address,
    amount: BigInt
  ): ethereum.CallResult<boolean> {
    let result = super.tryCall(
      "transferFrom",
      "transferFrom(address,address,uint256):(bool)",
      [
        ethereum.Value.fromAddress(sender),
        ethereum.Value.fromAddress(recipient),
        ethereum.Value.fromUnsignedBigInt(amount)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  uniswapV2Pair(): Address {
    let result = super.call("uniswapV2Pair", "uniswapV2Pair():(address)", []);

    return result[0].toAddress();
  }

  try_uniswapV2Pair(): ethereum.CallResult<Address> {
    let result = super.tryCall(
      "uniswapV2Pair",
      "uniswapV2Pair():(address)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }
}

export class ConstructorCall extends ethereum.Call {
  get inputs(): ConstructorCall__Inputs {
    return new ConstructorCall__Inputs(this);
  }

  get outputs(): ConstructorCall__Outputs {
    return new ConstructorCall__Outputs(this);
  }
}

export class ConstructorCall__Inputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }

  get _uniswapV2Router(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _prevCzodiac(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get _name(): string {
    return this._call.inputValues[2].value.toString();
  }

  get _symbol(): string {
    return this._call.inputValues[3].value.toString();
  }

  get _swapStartTimestamp(): BigInt {
    return this._call.inputValues[4].value.toBigInt();
  }

  get _swapEndTimestamp(): BigInt {
    return this._call.inputValues[5].value.toBigInt();
  }
}

export class ConstructorCall__Outputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }
}

export class ApproveCall extends ethereum.Call {
  get inputs(): ApproveCall__Inputs {
    return new ApproveCall__Inputs(this);
  }

  get outputs(): ApproveCall__Outputs {
    return new ApproveCall__Outputs(this);
  }
}

export class ApproveCall__Inputs {
  _call: ApproveCall;

  constructor(call: ApproveCall) {
    this._call = call;
  }

  get spender(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get amount(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }
}

export class ApproveCall__Outputs {
  _call: ApproveCall;

  constructor(call: ApproveCall) {
    this._call = call;
  }

  get value0(): boolean {
    return this._call.outputValues[0].value.toBoolean();
  }
}

export class DecreaseAllowanceCall extends ethereum.Call {
  get inputs(): DecreaseAllowanceCall__Inputs {
    return new DecreaseAllowanceCall__Inputs(this);
  }

  get outputs(): DecreaseAllowanceCall__Outputs {
    return new DecreaseAllowanceCall__Outputs(this);
  }
}

export class DecreaseAllowanceCall__Inputs {
  _call: DecreaseAllowanceCall;

  constructor(call: DecreaseAllowanceCall) {
    this._call = call;
  }

  get spender(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get subtractedValue(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }
}

export class DecreaseAllowanceCall__Outputs {
  _call: DecreaseAllowanceCall;

  constructor(call: DecreaseAllowanceCall) {
    this._call = call;
  }

  get value0(): boolean {
    return this._call.outputValues[0].value.toBoolean();
  }
}

export class DeliverCall extends ethereum.Call {
  get inputs(): DeliverCall__Inputs {
    return new DeliverCall__Inputs(this);
  }

  get outputs(): DeliverCall__Outputs {
    return new DeliverCall__Outputs(this);
  }
}

export class DeliverCall__Inputs {
  _call: DeliverCall;

  constructor(call: DeliverCall) {
    this._call = call;
  }

  get tAmount(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }
}

export class DeliverCall__Outputs {
  _call: DeliverCall;

  constructor(call: DeliverCall) {
    this._call = call;
  }
}

export class ExcludeFromFeeCall extends ethereum.Call {
  get inputs(): ExcludeFromFeeCall__Inputs {
    return new ExcludeFromFeeCall__Inputs(this);
  }

  get outputs(): ExcludeFromFeeCall__Outputs {
    return new ExcludeFromFeeCall__Outputs(this);
  }
}

export class ExcludeFromFeeCall__Inputs {
  _call: ExcludeFromFeeCall;

  constructor(call: ExcludeFromFeeCall) {
    this._call = call;
  }

  get account(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class ExcludeFromFeeCall__Outputs {
  _call: ExcludeFromFeeCall;

  constructor(call: ExcludeFromFeeCall) {
    this._call = call;
  }
}

export class ExcludeFromRewardCall extends ethereum.Call {
  get inputs(): ExcludeFromRewardCall__Inputs {
    return new ExcludeFromRewardCall__Inputs(this);
  }

  get outputs(): ExcludeFromRewardCall__Outputs {
    return new ExcludeFromRewardCall__Outputs(this);
  }
}

export class ExcludeFromRewardCall__Inputs {
  _call: ExcludeFromRewardCall;

  constructor(call: ExcludeFromRewardCall) {
    this._call = call;
  }

  get account(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class ExcludeFromRewardCall__Outputs {
  _call: ExcludeFromRewardCall;

  constructor(call: ExcludeFromRewardCall) {
    this._call = call;
  }
}

export class IncludeInFeeCall extends ethereum.Call {
  get inputs(): IncludeInFeeCall__Inputs {
    return new IncludeInFeeCall__Inputs(this);
  }

  get outputs(): IncludeInFeeCall__Outputs {
    return new IncludeInFeeCall__Outputs(this);
  }
}

export class IncludeInFeeCall__Inputs {
  _call: IncludeInFeeCall;

  constructor(call: IncludeInFeeCall) {
    this._call = call;
  }

  get account(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class IncludeInFeeCall__Outputs {
  _call: IncludeInFeeCall;

  constructor(call: IncludeInFeeCall) {
    this._call = call;
  }
}

export class IncludeInRewardCall extends ethereum.Call {
  get inputs(): IncludeInRewardCall__Inputs {
    return new IncludeInRewardCall__Inputs(this);
  }

  get outputs(): IncludeInRewardCall__Outputs {
    return new IncludeInRewardCall__Outputs(this);
  }
}

export class IncludeInRewardCall__Inputs {
  _call: IncludeInRewardCall;

  constructor(call: IncludeInRewardCall) {
    this._call = call;
  }

  get account(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class IncludeInRewardCall__Outputs {
  _call: IncludeInRewardCall;

  constructor(call: IncludeInRewardCall) {
    this._call = call;
  }
}

export class IncreaseAllowanceCall extends ethereum.Call {
  get inputs(): IncreaseAllowanceCall__Inputs {
    return new IncreaseAllowanceCall__Inputs(this);
  }

  get outputs(): IncreaseAllowanceCall__Outputs {
    return new IncreaseAllowanceCall__Outputs(this);
  }
}

export class IncreaseAllowanceCall__Inputs {
  _call: IncreaseAllowanceCall;

  constructor(call: IncreaseAllowanceCall) {
    this._call = call;
  }

  get spender(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get addedValue(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }
}

export class IncreaseAllowanceCall__Outputs {
  _call: IncreaseAllowanceCall;

  constructor(call: IncreaseAllowanceCall) {
    this._call = call;
  }

  get value0(): boolean {
    return this._call.outputValues[0].value.toBoolean();
  }
}

export class RenounceOwnershipCall extends ethereum.Call {
  get inputs(): RenounceOwnershipCall__Inputs {
    return new RenounceOwnershipCall__Inputs(this);
  }

  get outputs(): RenounceOwnershipCall__Outputs {
    return new RenounceOwnershipCall__Outputs(this);
  }
}

export class RenounceOwnershipCall__Inputs {
  _call: RenounceOwnershipCall;

  constructor(call: RenounceOwnershipCall) {
    this._call = call;
  }
}

export class RenounceOwnershipCall__Outputs {
  _call: RenounceOwnershipCall;

  constructor(call: RenounceOwnershipCall) {
    this._call = call;
  }
}

export class SetGlobalRewardsEnabledCall extends ethereum.Call {
  get inputs(): SetGlobalRewardsEnabledCall__Inputs {
    return new SetGlobalRewardsEnabledCall__Inputs(this);
  }

  get outputs(): SetGlobalRewardsEnabledCall__Outputs {
    return new SetGlobalRewardsEnabledCall__Outputs(this);
  }
}

export class SetGlobalRewardsEnabledCall__Inputs {
  _call: SetGlobalRewardsEnabledCall;

  constructor(call: SetGlobalRewardsEnabledCall) {
    this._call = call;
  }

  get _globalRewardsEnabled(): boolean {
    return this._call.inputValues[0].value.toBoolean();
  }
}

export class SetGlobalRewardsEnabledCall__Outputs {
  _call: SetGlobalRewardsEnabledCall;

  constructor(call: SetGlobalRewardsEnabledCall) {
    this._call = call;
  }
}

export class SetNextCzodiacCall extends ethereum.Call {
  get inputs(): SetNextCzodiacCall__Inputs {
    return new SetNextCzodiacCall__Inputs(this);
  }

  get outputs(): SetNextCzodiacCall__Outputs {
    return new SetNextCzodiacCall__Outputs(this);
  }
}

export class SetNextCzodiacCall__Inputs {
  _call: SetNextCzodiacCall;

  constructor(call: SetNextCzodiacCall) {
    this._call = call;
  }

  get _nextCzodiac(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class SetNextCzodiacCall__Outputs {
  _call: SetNextCzodiacCall;

  constructor(call: SetNextCzodiacCall) {
    this._call = call;
  }
}

export class SwapCall extends ethereum.Call {
  get inputs(): SwapCall__Inputs {
    return new SwapCall__Inputs(this);
  }

  get outputs(): SwapCall__Outputs {
    return new SwapCall__Outputs(this);
  }
}

export class SwapCall__Inputs {
  _call: SwapCall;

  constructor(call: SwapCall) {
    this._call = call;
  }
}

export class SwapCall__Outputs {
  _call: SwapCall;

  constructor(call: SwapCall) {
    this._call = call;
  }
}

export class SwapForCall extends ethereum.Call {
  get inputs(): SwapForCall__Inputs {
    return new SwapForCall__Inputs(this);
  }

  get outputs(): SwapForCall__Outputs {
    return new SwapForCall__Outputs(this);
  }
}

export class SwapForCall__Inputs {
  _call: SwapForCall;

  constructor(call: SwapForCall) {
    this._call = call;
  }

  get swappers(): Array<Address> {
    return this._call.inputValues[0].value.toAddressArray();
  }
}

export class SwapForCall__Outputs {
  _call: SwapForCall;

  constructor(call: SwapForCall) {
    this._call = call;
  }
}

export class TransferCall extends ethereum.Call {
  get inputs(): TransferCall__Inputs {
    return new TransferCall__Inputs(this);
  }

  get outputs(): TransferCall__Outputs {
    return new TransferCall__Outputs(this);
  }
}

export class TransferCall__Inputs {
  _call: TransferCall;

  constructor(call: TransferCall) {
    this._call = call;
  }

  get recipient(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get amount(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }
}

export class TransferCall__Outputs {
  _call: TransferCall;

  constructor(call: TransferCall) {
    this._call = call;
  }

  get value0(): boolean {
    return this._call.outputValues[0].value.toBoolean();
  }
}

export class TransferFromCall extends ethereum.Call {
  get inputs(): TransferFromCall__Inputs {
    return new TransferFromCall__Inputs(this);
  }

  get outputs(): TransferFromCall__Outputs {
    return new TransferFromCall__Outputs(this);
  }
}

export class TransferFromCall__Inputs {
  _call: TransferFromCall;

  constructor(call: TransferFromCall) {
    this._call = call;
  }

  get sender(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get recipient(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get amount(): BigInt {
    return this._call.inputValues[2].value.toBigInt();
  }
}

export class TransferFromCall__Outputs {
  _call: TransferFromCall;

  constructor(call: TransferFromCall) {
    this._call = call;
  }

  get value0(): boolean {
    return this._call.outputValues[0].value.toBoolean();
  }
}

export class TransferOwnershipCall extends ethereum.Call {
  get inputs(): TransferOwnershipCall__Inputs {
    return new TransferOwnershipCall__Inputs(this);
  }

  get outputs(): TransferOwnershipCall__Outputs {
    return new TransferOwnershipCall__Outputs(this);
  }
}

export class TransferOwnershipCall__Inputs {
  _call: TransferOwnershipCall;

  constructor(call: TransferOwnershipCall) {
    this._call = call;
  }

  get newOwner(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class TransferOwnershipCall__Outputs {
  _call: TransferOwnershipCall;

  constructor(call: TransferOwnershipCall) {
    this._call = call;
  }
}

export class WithdrawTokenCall extends ethereum.Call {
  get inputs(): WithdrawTokenCall__Inputs {
    return new WithdrawTokenCall__Inputs(this);
  }

  get outputs(): WithdrawTokenCall__Outputs {
    return new WithdrawTokenCall__Outputs(this);
  }
}

export class WithdrawTokenCall__Inputs {
  _call: WithdrawTokenCall;

  constructor(call: WithdrawTokenCall) {
    this._call = call;
  }

  get _token(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class WithdrawTokenCall__Outputs {
  _call: WithdrawTokenCall;

  constructor(call: WithdrawTokenCall) {
    this._call = call;
  }
}