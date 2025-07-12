// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Stablecoin.sol";
import "./MockPriceOracle.sol"; // Usamos la interfaz

contract Core {
    Stablecoin public immutable stablecoin;
    IERC20 public immutable collateralToken;
    IPriceOracle public immutable priceOracle;

    uint256 public constant COLLATERALIZATION_RATIO = 150; // 150%
    uint256 public constant MINTING_FEE = 50; // 0.5% (50 / 10000)

    mapping(address => uint256) public collateralBalances;
    uint256 public totalFeesCollected;

    event Deposited(address indexed user, uint256 collateralAmount, uint256 stablecoinMinted);
    event Withdrawn(address indexed user, uint256 stablecoinBurned, uint256 collateralReturned);

    constructor(address _stablecoinAddress, address _collateralTokenAddress, address _oracleAddress) {
        stablecoin = Stablecoin(_stablecoinAddress);
        collateralToken = IERC20(_collateralTokenAddress);
        priceOracle = IPriceOracle(_oracleAddress);
    }

    function depositAndMint(uint256 _collateralAmount) external {
        require(_collateralAmount > 0, "Amount must be > 0");
        collateralToken.transferFrom(msg.sender, address(this), _collateralAmount);

        uint256 collateralValue = (_collateralAmount * priceOracle.getAssetPrice()) / 1e8;
        uint256 amountToMint = (collateralValue * 1e18 * 100) / COLLATERALIZATION_RATIO / 1e18;

        uint256 fee = (amountToMint * MINTING_FEE) / 10000;
        uint256 finalAmountToMint = amountToMint - fee;

        totalFeesCollected += fee;

        collateralBalances[msg.sender] += _collateralAmount;
        stablecoin.mint(msg.sender, finalAmountToMint);

        emit Deposited(msg.sender, _collateralAmount, finalAmountToMint);
    }
}