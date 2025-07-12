import { ethers } from "hardhat";

async function main() {
    console.log("Desplegando contratos...");
    const deployer = (await ethers.getSigners())[0];

    // 1. Desplegar Oráculo (en una red real, usarías una dirección existente)
    const OracleFactory = await ethers.getContractFactory("MockPriceOracle");
    const oracle = await OracleFactory.deploy();
    await oracle.waitForDeployment();
    console.log(`MockPriceOracle desplegado en: ${await oracle.getAddress()}`);

    // 2. Desplegar el token de Colateral (ej. WETH)
    // En una red real, usarías la dirección del WETH oficial.
    const ERC20MockFactory = await ethers.getContractFactory("TestERC20", deployer);
    const collateralToken = await ERC20MockFactory.deploy("Wrapped Ether", "WETH");
    await collateralToken.waitForDeployment();
    console.log(`Token de colateral (WETH) desplegado en: ${await collateralToken.getAddress()}`);

    // 3. Desplegar Stablecoin
    const StablecoinFactory = await ethers.getContractFactory("Stablecoin");
    const stablecoin = await StablecoinFactory.deploy();
    await stablecoin.waitForDeployment();
    console.log(`Stablecoin desplegado en: ${await stablecoin.getAddress()}`);

    // 4. Desplegar Core
    const CoreFactory = await ethers.getContractFactory("Core");
    const core = await CoreFactory.deploy(
        await stablecoin.getAddress(),
        await collateralToken.getAddress(),
        await oracle.getAddress()
    );
    await core.waitForDeployment();
    console.log(`Core desplegado en: ${await core.getAddress()}`);

    // 5. Transferir propiedad del Stablecoin al Core
    console.log("Transfiriendo propiedad del Stablecoin al Core...");
    const tx = await stablecoin.transferOwnership(await core.getAddress());
    await tx.wait();
    console.log("¡Propiedad transferida!");

    console.log("\n🚀 Despliegue completado.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});