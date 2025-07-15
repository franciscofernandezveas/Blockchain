import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config"; // Asegúrate de que las variables de entorno se carguen

// Carga las variables de entorno del archivo .env
const LISK_SEPOLIA_RPC_URL = process.env.LISK_SEPOLIA_RPC_URL || "https://rpc.sepolia-api.lisk.com";
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// Verifica que la clave privada esté definida en el .env
if (!PRIVATE_KEY) {
  console.warn("ADVERTENCIA: La clave privada (PRIVATE_KEY) no está definida en el archivo .env");
}

const config: HardhatUserConfig = {
  solidity: "0.8.20", // Versión de Solidity usada en tus contratos
  
  // Definición de las redes a las que te puedes conectar
  networks: {
    // Red para pruebas locales
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    // Red de prueba de Lisk Sepolia para la hackathon
    liskSepolia: {
      url: LISK_SEPOLIA_RPC_URL,
      // Usa la clave privada solo si está definida
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 4202,
    },
  },
  
  // Configuración para verificar los contratos en exploradores de bloques
  etherscan: {
    // La API Key para Blockscout puede ser cualquier string, no es obligatoria
    apiKey: {
      liskSepolia: 'no-api-key-needed',
    },
    // Definición de redes personalizadas para que Hardhat sepa cómo interactuar con Blockscout
    customChains: [
      {
        network: "liskSepolia",
        chainId: 4202,
        urls: {
          apiURL: "https://sepolia-blockscout.lisk.com/api",
          browserURL: "https://sepolia-blockscout.lisk.com",
        },
      },
    ],
  },
};

export default config;