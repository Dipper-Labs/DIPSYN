// SPDX-License-Identifier: MIT
pragma solidity ^0.5.17;

import './lib/SafeERC20.sol';
import './base/Rewards.sol';
import './interfaces/IHolder.sol';
import './interfaces/storages/IHolderStorage.sol';
import './interfaces/IERC20.sol';
import './interfaces/ISynthxDToken.sol';


contract Holder is Rewards, IHolder {
    using SafeERC20 for IERC20;

    address public constant LOCK_ADDRESS = 0x010C10C10C10C10c10c10C10c10C10c10c10C10c;

    constructor(IResolver _resolver) public Importable(_resolver) {
        setContractName(CONTRACT_HOLDER);
        imports = [CONTRACT_SYNTHX, CONTRACT_SUPPLY_SCHEDULE, CONTRACT_SYNTHX_DTOKEN];
    }

    function Storage() private view returns (IHolderStorage) {
        return IHolderStorage(getStorage());
    }

    function SynthxDToken() private view returns (ISynthxDToken) {
        return ISynthxDToken(requireAddress(CONTRACT_SYNTHX_DTOKEN));
    }

    function ERC20DToken() private view returns (IERC20) {
        return IERC20(requireAddress(CONTRACT_SYNTHX_DTOKEN));
    }

    function _setBalance(address account) private {
        uint256 balance = ERC20DToken().balanceOf(account);
        uint256 totalSupply = ERC20DToken().totalSupply();
        Storage().setBalance(account, getCurrentPeriod(), balance, totalSupply);
    }

    function getBalance(address account) external view returns (uint256) {
        return ERC20DToken().balanceOf(account);
    }

    function getTotalSupply() external view returns (uint256) {
        return ERC20DToken().totalSupply();
    }

    function getPeriodBalance(
        address account,
        uint256 period
    ) external view returns (uint256) {
        return Storage().getBalance(account, period);
    }

    function claim(address account)
        external
        onlyAddress(CONTRACT_SYNTHX)
        returns (
            uint256 period,
            uint256 amount
        )
    {
        uint256 claimable = getClaimable(account);
        require(claimable > 0, 'Holder: claimable is zero');

        uint256 claimablePeriod = getClaimablePeriod();
        setClaimed(account, claimablePeriod, claimable);

        ERC20DToken().safeTransfer(account, claimable);
        return (claimablePeriod, claimable);
    }

    function getClaimable(address account) public view returns (uint256) {
        uint256 rewards = getRewardSupply(CONTRACT_HOLDER);
        if (rewards == 0) return 0;

        uint256 claimablePeriod = getClaimablePeriod();
        if (getClaimed(account, claimablePeriod) > 0) return 0;

        uint256 totalSuppy = Storage().getBalance(address(0), claimablePeriod);
        uint256 accountBalance = Storage().getBalance(account, claimablePeriod);
        uint256 percentage = accountBalance.decimalDivide(totalSuppy);
        return rewards.decimalMultiply(percentage);
    }
}
