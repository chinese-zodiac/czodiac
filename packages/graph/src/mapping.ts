import { BigInt } from "@graphprotocol/graph-ts"
import {
  czodiacToken,
  Approval,
  BurnEvent,
  Creation,
  DevRewardsEvent,
  HolderRewardsEvent,
  LPRewardsEvent,
  OwnershipTransferred,
  Swap,
  Transfer
} from "../generated/czodiacToken/czodiacToken"
import { BlockRewards } from "../generated/schema"

export function handleBurnEvent(event: BurnEvent): void {
  let entity = BlockRewards.load(event.block.number.toHex())
  if (entity == null) {
    entity = new BlockRewards(event.block.number.toHex())
  }
  entity.burnAmount = entity.burnAmount.plus(event.params.tokenAmount);
  entity.save()
}

export function handleDevRewardsEvent(event: DevRewardsEvent): void {
  let entity = BlockRewards.load(event.block.number.toHex())
  if (entity == null) {
    entity = new BlockRewards(event.block.number.toHex())
  }
  entity.devReward = entity.devReward.plus(event.params.tokenAmount);
  entity.save()
}

export function handleHolderRewardsEvent(event: HolderRewardsEvent): void {
  let entity = BlockRewards.load(event.block.number.toHex())
  if (entity == null) {
    entity = new BlockRewards(event.block.number.toHex())
  }
  entity.holderReward = entity.holderReward.plus(event.params.tokenAmount);
  entity.save()
}

export function handleLPRewardsEvent(event: LPRewardsEvent): void {
  let entity = BlockRewards.load(event.block.number.toHex())
  if (entity == null) {
    entity = new BlockRewards(event.block.number.toHex())
  }
  entity.lpReward = entity.lpReward.plus(event.params.tokenAmount);
  entity.save()
}

export function handleTransfer(event: Transfer): void {
  let entity = BlockRewards.load(event.block.number.toHex())
  if (entity == null) {
    entity = new BlockRewards(event.block.number.toHex())
  }
  entity.transferred = entity.transferred.plus(event.params.value);
  entity.save()
}

export function handleSwap(event: Swap): void {}
