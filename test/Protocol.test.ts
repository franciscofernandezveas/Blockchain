import { expect } from "chai";
import { ethers } from "hardhat";
import { Core, Stablecoin, MockPriceOracle } from "../typechain-types";

describe("Protocol Tests", function () {
    let core: Core;
    let stablecoin: Stablecoin;
    let mockOracle: MockPriceOracle;
    let deployer: any, user: any;
    // Para pruebas, crearemos un token de colateral falso (WETH)
    let collateralToken: any; 

    beforeEach(async function () {
        [deployer, user] = await ethers.getSigners();

        // Desplegar un token ERC20 de prueba para usar como colateral
        const ERC20MockFactory = await ethers.getContractFactory("TestERC20", deployer);
        collateralToken = await ERC20MockFactory.deploy("Wrapped Ether", "WETH");

        // Desplegar los contratos del protocolo
        const OracleFactory = await ethers.getContractFactory("MockPriceOracle", deployer);
        mockOracle = await OracleFactory.deploy();

        const StablecoinFactory = await ethers.getContractFactory("Stablecoin", deployer);
        stablecoin = await StablecoinFactory.deploy();

        const CoreFactory = await ethers.getContractFactory("Core", deployer);
        core = await CoreFactory.deploy(
            await stablecoin.getAddress(),
            await collateralToken.getAddress(),
            await mockOracle.getAddress()
        );

        // **IMPORTANTE**: Darle al contrato Core el permiso para acuñar stablecoins
        await stablecoin.transferOwnership(await core.getAddress());
    });

    it("Debería permitir a un usuario depositar colateral y acuñar stablecoins", async function () {
        // Damos al usuario 10 WETH de colateral para la prueba
        const collateralAmount = ethers.parseUnits("10", 18); // 10 WETH
        await collateralToken.connect(deployer).transfer(user.address, collateralAmount);

        // El usuario aprueba que el contrato Core gaste su WETH
        await collateralToken.connect(user).approve(await core.getAddress(), collateralAmount);

        // El usuario llama a la función para depositar 1 WETH
        const depositAmount = ethers.parseUnits("1", 18); // 1 WETH
        await core.connect(user).depositAndMint(depositAmount);

        // --- Verificaciones ---
        // Precio del Oráculo = $3000. Colateral = 1 WETH ($3000)
        // Ratio = 150%. Valor a acuñar = $3000 / 1.5 = $2000
        // Comisión = 0.5% de $2000 = $10
        // Cantidad final = 2000 - 10 = 1990 MSC
        const expectedAmount = ethers.parseUnits("1990", 18);

        expect(await stablecoin.balanceOf(user.address)).to.equal(expectedAmount);
        expect(await collateralToken.balanceOf(await core.getAddress())).to.equal(depositAmount);
    });
});