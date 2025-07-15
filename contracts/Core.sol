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

    // 1. Transfiere el colateral del usuario a este contrato.
    collateralToken.transferFrom(msg.sender, address(this), _collateralAmount);

    // 2. Calcula el valor del colateral en USD (asumiendo 18 decimales).
    uint256 collateralValue = (_collateralAmount * priceOracle.getAssetPrice()) / 1e8;

    // 3. Calcula la cantidad de stablecoins a acuñar (versión simplificada y corregida).
    // Si el colateral vale $3 (3e18) y el ratio es 150%, se acuñan $2 (2e18).
    uint256 amountToMint = (collateralValue * 100) / COLLATERALIZATION_RATIO;

    // 4. Calcula y resta la comisión de acuñación.
    uint256 fee = (amountToMint * MINTING_FEE) / 10000;
    uint256 finalAmountToMint = amountToMint - fee;
    require(finalAmountToMint > 0, "Amount to mint is zero after fee");

    // 5. Actualiza el balance del usuario y acuña los nuevos tokens.
    collateralBalances[msg.sender] += _collateralAmount;
    stablecoin.mint(msg.sender, finalAmountToMint);

    emit Deposited(msg.sender, _collateralAmount, finalAmountToMint);
    }
}