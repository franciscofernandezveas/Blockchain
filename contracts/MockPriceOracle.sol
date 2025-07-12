// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IPriceOracle {
    function getAssetPrice() external view returns (uint256);
}

contract MockPriceOracle is IPriceOracle {
    // Devuelve un precio fijo de $3,000 con 8 decimales
    function getAssetPrice() external pure returns (uint256) {
        return 3000 * 1e8;
    }
}