// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Este es un contrato ERC20 simple que SÍ se puede desplegar.
// Es perfecto para usar como colateral en nuestras pruebas.
contract TestERC20 is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        // Acuña una cantidad inicial de tokens para la persona que lo despliega.
        _mint(msg.sender, 1_000_000 * 10**decimals());
    }
}