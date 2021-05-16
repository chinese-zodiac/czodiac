// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Address,
  Bytes,
  BigInt,
  BigDecimal
} from "@graphprotocol/graph-ts";

export class BlockRewards extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save BlockRewards entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save BlockRewards entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("BlockRewards", id.toString(), this);
  }

  static load(id: string): BlockRewards | null {
    return store.get("BlockRewards", id) as BlockRewards | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get transferred(): BigInt | null {
    let value = this.get("transferred");
    if (value === null || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBigInt();
    }
  }

  set transferred(value: BigInt | null) {
    if (value === null) {
      this.unset("transferred");
    } else {
      this.set("transferred", Value.fromBigInt(value as BigInt));
    }
  }

  get devReward(): BigInt | null {
    let value = this.get("devReward");
    if (value === null || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBigInt();
    }
  }

  set devReward(value: BigInt | null) {
    if (value === null) {
      this.unset("devReward");
    } else {
      this.set("devReward", Value.fromBigInt(value as BigInt));
    }
  }

  get lpReward(): BigInt | null {
    let value = this.get("lpReward");
    if (value === null || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBigInt();
    }
  }

  set lpReward(value: BigInt | null) {
    if (value === null) {
      this.unset("lpReward");
    } else {
      this.set("lpReward", Value.fromBigInt(value as BigInt));
    }
  }

  get holderReward(): BigInt | null {
    let value = this.get("holderReward");
    if (value === null || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBigInt();
    }
  }

  set holderReward(value: BigInt | null) {
    if (value === null) {
      this.unset("holderReward");
    } else {
      this.set("holderReward", Value.fromBigInt(value as BigInt));
    }
  }

  get burnAmount(): BigInt | null {
    let value = this.get("burnAmount");
    if (value === null || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBigInt();
    }
  }

  set burnAmount(value: BigInt | null) {
    if (value === null) {
      this.unset("burnAmount");
    } else {
      this.set("burnAmount", Value.fromBigInt(value as BigInt));
    }
  }
}