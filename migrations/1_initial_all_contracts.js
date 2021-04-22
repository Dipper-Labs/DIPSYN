const Web3Utils = require('web3-utils');

const Migrations = artifacts.require("Migrations");

const Storage = artifacts.require("Storage");
const AddressStorage = artifacts.require("AddressStorage");

const Setting = artifacts.require("Setting");
const SettingStorage = artifacts.require("SettingStorage");

const Resolver = artifacts.require("Resolver");

const Issuer = artifacts.require("Issuer");

const Escrow = artifacts.require("Escrow");
const EscrowStorage = artifacts.require("EscrowStorage");

const History = artifacts.require("History");

const Liquidator = artifacts.require("Liquidator");
const LiquidatorStorage = artifacts.require("LiquidatorStorage");

const Staker = artifacts.require("Staker");
const StakerStorage = artifacts.require("StakerStorage");

const AssetPrice = artifacts.require("AssetPrice");

const Trader = artifacts.require("Trader");
const TraderStorage = artifacts.require("TraderStorage");

const Market = artifacts.require("Market");
const Special = artifacts.require("Special");
const SupplySchedule = artifacts.require("SupplySchedule");

const SynthxToken = artifacts.require("SynthxToken");

const Synthx = artifacts.require("Synthx");

module.exports = async function(deployer, network, accounts) {
    await deployer.deploy(Migrations);

    await deployer.deploy(Storage);
    await deployer.deploy(AddressStorage);

    const settingInstance = await deployer.deploy(Setting);
    await deployer.deploy(SettingStorage, Setting.address);
    await settingInstance.setStorage(SettingStorage.address);

    const resolverInstance = await deployer.deploy(Resolver);

    const escrowInstance = await deployer.deploy(Escrow, Resolver.address);
    await deployer.deploy(EscrowStorage, Escrow.address);
    
    await deployer.deploy(Issuer, Resolver.address);

    // must done before 'synthxTokenInstance.initialize(Resolver.address);'
    await resolverInstance.setAddress(Web3Utils.fromAscii('Issuer'), Issuer.address);
    const synthxTokenInstance = await deployer.deploy(SynthxToken);
    await synthxTokenInstance.initialize(Resolver.address);

    const hitoryInstance = await deployer.deploy(History, Resolver.address);

    const liquidatorInstance = await deployer.deploy(Liquidator, Resolver.address);
    await deployer.deploy(LiquidatorStorage, Liquidator.address);

    const stakerInstal = await deployer.deploy(Staker, Resolver.address);
    await deployer.deploy(StakerStorage, Staker.address);

    const assetPriceInstance = await deployer.deploy(AssetPrice);

    const traderInstance = await deployer.deploy(Trader, Resolver.address);
    await deployer.deploy(TraderStorage, Trader.address);

    const marketInstance = await deployer.deploy(Market, Resolver.address);
    await deployer.deploy(Special, Resolver.address);
    await deployer.deploy(SupplySchedule, Resolver.address, 0, 0);

    await resolverInstance.setAddress(Web3Utils.fromAscii('Escrow'), Escrow.address);
    await resolverInstance.setAddress(Web3Utils.fromAscii('Staker'), Staker.address);
    await resolverInstance.setAddress(Web3Utils.fromAscii('AssetPrice'), AssetPrice.address);
    await resolverInstance.setAddress(Web3Utils.fromAscii('Setting'), Setting.address);

    await resolverInstance.setAddress(Web3Utils.fromAscii('Trader'), Trader.address);
    await resolverInstance.setAddress(Web3Utils.fromAscii('SynthxToken'), SynthxToken.address);
    await resolverInstance.setAddress(Web3Utils.fromAscii('Market'), Market.address);
    await resolverInstance.setAddress(Web3Utils.fromAscii('History'), History.address);
    await resolverInstance.setAddress(Web3Utils.fromAscii('Liquidator'), Liquidator.address);

    // resolver, add stake asset
    await resolverInstance.addAsset(Web3Utils.fromAscii('Stake'), Web3Utils.fromAscii('ETH'), accounts[0]);


    // setting

    console.log(Setting.address);
    console.log(settingInstance);
    const res = await settingInstance.getCollateralRate(Web3Utils.fromAscii('ETH'));
    console.log("CollateralRate:", res);

    settingInstance.setCollateralRate(); // x 10**18
    settingInstance.setLiquidationRate();
    settingInstance.setLiquidationRate();
    settingInstance.setLiquidationDelay();
    settingInstance.setTradingFeeRate();
    settingInstance.setMintPeriodDuration(); // second


    const synthxInstance = await deployer.deploy(Synthx);
    synthxInstance.initialize(Resolver.address, Web3Utils.fromAscii('ETH'));
    const nativeCoin = await synthxInstance.nativeCoin();
    console.log("synthx nativeCoin:", Web3Utils.toAscii(nativeCoin));


    // refresh DNS
    await synthxInstance.refreshCache();
    await escrowInstance.refreshCache();
    await stakerInstal.refreshCache();
    await assetPriceInstance.refreshCache();
    await settingInstance.refreshCache();
    await traderInstance.refreshCache();
    await synthxTokenInstance.refreshCache();
    await marketInstance.refreshCache();
    await hitoryInstance.refreshCache();
    await liquidatorInstance.refreshCache();


    // mintFromCoin
    const receipt = await synthxInstance.mintFromCoin({value:10000000000});
    console.log("receipt:", receipt);
};
