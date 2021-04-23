const Web3Utils = require('web3-utils');

const Migrations = artifacts.require("Migrations");

const Storage = artifacts.require("Storage");
const AddressStorage = artifacts.require("AddressStorage");
const SettingStorage = artifacts.require("SettingStorage");
const IssuerStorage = artifacts.require("IssuerStorage");
const EscrowStorage = artifacts.require("EscrowStorage");
const LiquidatorStorage = artifacts.require("LiquidatorStorage");
const StakerStorage = artifacts.require("StakerStorage");
const OracleStorage = artifacts.require("OracleStorage");
const TraderStorage = artifacts.require("TraderStorage");

const Setting = artifacts.require("Setting");
const Resolver = artifacts.require("Resolver");
const Issuer = artifacts.require("Issuer");
const Escrow = artifacts.require("Escrow");
const History = artifacts.require("History");
const Liquidator = artifacts.require("Liquidator");
const Staker = artifacts.require("Staker");
const AssetPrice = artifacts.require("AssetPrice");
const SynthxOracle = artifacts.require("SynthxOracle");
const Trader = artifacts.require("Trader");
const Market = artifacts.require("Market");
const Special = artifacts.require("Special");
const SupplySchedule = artifacts.require("SupplySchedule");

// tokens
const SynthxTokenStorage = artifacts.require("TokenStorage");
const SynthxDTokenStorage = artifacts.require("TokenStorage");

const SynthxToken = artifacts.require("SynthxToken");   // sDIP
const SynthxDToken = artifacts.require("SynthxDToken"); // DToken

// synth token
const TokenStorage = artifacts.require("TokenStorage");
const dTSLATokenStorage = artifacts.require("TokenStorage");
const dAPPLETokenStorage = artifacts.require("TokenStorage");

const DUSD = artifacts.require("Synth");
const dTSLA = artifacts.require("Synth");
const dAPPLE = artifacts.require("Synth");

const Synthx = artifacts.require("Synthx");
const Stats = artifacts.require("Stats");

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
    await escrowInstance.setStorage(EscrowStorage.address);
    
    const issuerInstance = await deployer.deploy(Issuer, Resolver.address);
    await deployer.deploy(IssuerStorage, Issuer.address);
    await issuerInstance.setStorage(IssuerStorage.address);

    // must done before 'synthxTokenInstance.initialize(Resolver.address);'
    await resolverInstance.setAddress(Web3Utils.fromAscii('Issuer'), Issuer.address);
    const synthxTokenInstance = await deployer.deploy(SynthxToken);
    await synthxTokenInstance.initialize(Resolver.address);
    const synthxTokenStorageInstance = await deployer.deploy(SynthxTokenStorage, synthxTokenInstance.address);
    await synthxTokenInstance.setStorage(synthxTokenStorageInstance.address);

    const synthxDTokenInstance = await deployer.deploy(SynthxDToken,Resolver.address);
    await synthxDTokenInstance.initialize();
    const synthxDTokenStorageInstance = await deployer.deploy(SynthxDTokenStorage, synthxDTokenInstance.address);
    await synthxDTokenInstance.setStorage(synthxDTokenStorageInstance.address);


    const hitoryInstance = await deployer.deploy(History, Resolver.address);

    // liquidator
    const liquidatorInstance = await deployer.deploy(Liquidator, Resolver.address);
    await deployer.deploy(LiquidatorStorage, Liquidator.address);
    await liquidatorInstance.setStorage(LiquidatorStorage.address)

    // staker
    const stakerInstance = await deployer.deploy(Staker, Resolver.address);
    await deployer.deploy(StakerStorage, Staker.address);
    await stakerInstance.setStorage(StakerStorage.address);

    const dUSDInstance = await deployer.deploy(DUSD);
    const dUSDStorageInstance = await deployer.deploy(TokenStorage, DUSD.address);
    // synth asset
    // dUSD
    await dUSDInstance.setStorage(dUSDStorageInstance.address);
    await dUSDInstance.initialize(Issuer.address, "dUSD", "dUSD", Web3Utils.fromAscii('erc20'));
    // dTSLA
    const dTSLAInstance = await deployer.deploy(dTSLA);
    const dTSLAStorageInstance = await deployer.deploy(dTSLATokenStorage, dTSLA.address);
    await dTSLAInstance.setStorage(dTSLAStorageInstance.address);
    await dTSLAInstance.initialize(Issuer.address, "dTSLA", "dTSLA", Web3Utils.fromAscii('2'));
    // dAPPLE
    const dAPPLEInstance = await deployer.deploy(dAPPLE);
    const dAPPLEStorageInstance = await deployer.deploy(dAPPLETokenStorage, dAPPLE.address);
    await dAPPLEInstance.setStorage(dAPPLEStorageInstance.address);
    await dAPPLEInstance.initialize(Issuer.address, "dAPPLE", "dAPPLE", Web3Utils.fromAscii('2'));

    // AssetPrice
    const assetPriceInstace = await deployer.deploy(AssetPrice);

    // Oracle
    const SynthxOracleInstance = await deployer.deploy(SynthxOracle);
    await deployer.deploy(OracleStorage, SynthxOracle.address);
    await SynthxOracleInstance.setStorage(OracleStorage.address);

    // set asset oracle
    assetPriceInstace.setOracle(Web3Utils.fromAscii('ETH'), SynthxOracle.address);
    assetPriceInstace.setOracle(Web3Utils.fromAscii('BTC'), SynthxOracle.address);
    assetPriceInstace.setOracle(Web3Utils.fromAscii('dTSLA'), SynthxOracle.address);
    assetPriceInstace.setOracle(Web3Utils.fromAscii('dAPPLE'), SynthxOracle.address);

    // set asset price
    SynthxOracleInstance.setPrice(Web3Utils.fromAscii('ETH'), Web3Utils.toWei('2000', 'ether'));
    SynthxOracleInstance.setPrice(Web3Utils.fromAscii('BTC'), Web3Utils.toWei('50000', 'ether'));
    SynthxOracleInstance.setPrice(Web3Utils.fromAscii('dTSLA'), Web3Utils.toWei('750', 'ether'));
    SynthxOracleInstance.setPrice(Web3Utils.fromAscii('dAPPLE'), Web3Utils.toWei('150', 'ether'));

    // Trader
    const traderInstance = await deployer.deploy(Trader, Resolver.address);
    await deployer.deploy(TraderStorage, Trader.address);
    await traderInstance.setStorage(TraderStorage.address);

    // Market
    const marketInstance = await deployer.deploy(Market, Resolver.address);
    await deployer.deploy(Special, Resolver.address);
    const supplyScheduleInstance = await deployer.deploy(SupplySchedule, Resolver.address, 0, 0);

    // resolver
    await resolverInstance.setAddress(Web3Utils.fromAscii('Escrow'), Escrow.address);
    await resolverInstance.setAddress(Web3Utils.fromAscii('Staker'), Staker.address);
    await resolverInstance.setAddress(Web3Utils.fromAscii('AssetPrice'), AssetPrice.address);
    await resolverInstance.setAddress(Web3Utils.fromAscii('Setting'), Setting.address);
    await resolverInstance.setAddress(Web3Utils.fromAscii('Oracle'), SynthxOracle.address);
    await resolverInstance.setAddress(Web3Utils.fromAscii('Trader'), Trader.address);
    await resolverInstance.setAddress(Web3Utils.fromAscii('SynthxToken'), SynthxToken.address);
    await resolverInstance.setAddress(Web3Utils.fromAscii('SynthxDToken'), SynthxDToken.address);
    await resolverInstance.setAddress(Web3Utils.fromAscii('Market'), Market.address);
    await resolverInstance.setAddress(Web3Utils.fromAscii('History'), History.address);
    await resolverInstance.setAddress(Web3Utils.fromAscii('Liquidator'), Liquidator.address);
    await resolverInstance.setAddress(Web3Utils.fromAscii('SupplySchedule'), SupplySchedule.address);
    await resolverInstance.setAddress(Web3Utils.fromAscii('Team'), accounts[0]); // Team address

    // resolver, add stake asset
    await resolverInstance.addAsset(Web3Utils.fromAscii('Stake'), Web3Utils.fromAscii('ETH'), accounts[0]);
    // await resolverInstance.addAsset(Web3Utils.fromAscii('Stake'), Web3Utils.fromAscii('BTC'), BTC.address);
    await resolverInstance.addAsset(Web3Utils.fromAscii('Synth'), Web3Utils.fromAscii('dUSD'), DUSD.address);
    await resolverInstance.addAsset(Web3Utils.fromAscii('Synth'), Web3Utils.fromAscii('dTSLA'), dTSLA.address);
    await resolverInstance.addAsset(Web3Utils.fromAscii('Synth'), Web3Utils.fromAscii('dAPPLE'), dAPPLE.address);

    // setting
    settingInstance.setCollateralRate(Web3Utils.fromAscii('ETH'), Web3Utils.toWei('2', 'ether'));
    settingInstance.setLiquidationRate(Web3Utils.fromAscii('ETH'), Web3Utils.toWei('1', 'ether'));
    settingInstance.setLiquidationDelay(36000);
    settingInstance.setTradingFeeRate(Web3Utils.fromAscii('ETH'), Web3Utils.toWei('2', 'milliether'));
    settingInstance.setMintPeriodDuration(1); // second

    let res = await settingInstance.getCollateralRate(Web3Utils.fromAscii('ETH'));
    console.log("CollateralRate:", res.toString());

    const synthxInstance = await deployer.deploy(Synthx);
    synthxInstance.initialize(Resolver.address, Web3Utils.fromAscii('ETH'));


    await resolverInstance.setAddress(Web3Utils.fromAscii('Synthx'), Synthx.address);

    // refresh DNS
    await synthxInstance.refreshCache();
    await escrowInstance.refreshCache();
    await stakerInstance.refreshCache();
    await traderInstance.refreshCache();
    await marketInstance.refreshCache();
    await hitoryInstance.refreshCache();
    await liquidatorInstance.refreshCache();
    await issuerInstance.refreshCache();
    await supplyScheduleInstance.refreshCache();
    await synthxDTokenInstance.refreshCache();


    // Stats
    const statsInstance = await deployer.deploy(Stats, Resolver.address);
    await statsInstance.refreshCache();

    console.log("-------- mint synths -------- ");
    /////////////// mintFromCoin
    receipt = await synthxInstance.mintFromCoin({value:Web3Utils.toWei('20', 'ether')});
    // console.log("receipt:", receipt);

    bal = await dUSDInstance.balanceOf(accounts[0]);
    console.log("dUSD balance:", Web3Utils.fromWei(bal, 'ether'));

    dTokenBal = await synthxDTokenInstance.balanceOf(accounts[0]);
    console.log("dToken balance:", Web3Utils.fromWei(dTokenBal, 'ether'));

    // getTotalCollateral
    col = await statsInstance.getTotalCollateral(accounts[0])
    console.log("totalDebt:", Web3Utils.fromWei(col.totalDebt, 'ether'));

    console.log("-------- burn synths -------- ");
    await new Promise(r => setTimeout(r, 2000)); // sleep

    ///////////////  burn
    await synthxInstance.burn(Web3Utils.fromAscii('ETH'), Web3Utils.toWei('2000', 'ether'));
    bal = await dUSDInstance.balanceOf(accounts[0]);
    console.log("dUSD balance:", Web3Utils.fromWei(bal, 'ether'));

    dTokenBal = await synthxDTokenInstance.balanceOf(accounts[0]);
    console.log("dToken balance:", Web3Utils.fromWei(dTokenBal, 'ether'));

    // getTotalCollateral
    col = await statsInstance.getTotalCollateral(accounts[0])
    console.log("totalDebt:", Web3Utils.fromWei(col.totalDebt, 'ether'));

    res = await statsInstance.getRewards(accounts[0]);
    console.log("rewards: ", Web3Utils.fromWei(res, 'ether'))

    res = await statsInstance.getWithdrawable(accounts[0]);
    console.log("getWithdrawable:", Web3Utils.fromWei(res, 'ether'));

    console.log("-------- claim rewards -------- ");
    ///////////////  claimReward
    await synthxInstance.claimReward();
    bal = await synthxTokenInstance.balanceOf(accounts[0]);
    console.log("synthx balance:", Web3Utils.fromWei(bal, 'ether'));

};
