# Proyecto Stablecoin Comunitaria (Prototipo para Hackathon)

Este repositorio contiene el código fuente de un prototipo de stablecoin descentralizada, colateralizada por un pool de liquidez comunitario. El proyecto está construido sobre Solidity y se utiliza el framework Hardhat para el desarrollo y las pruebas.

---

## ## Concepto Principal

El protocolo permite a los usuarios depositar activos de colateral (como WETH o USDC) en una bóveda comunitaria y, a cambio, acuñar (mintear) una nueva stablecoin (llamada `MSC` en este prototipo). El sistema está diseñado para ser autónomo y generar rendimiento para los proveedores de liquidez a través de comisiones.

El flujo principal es:
1.  **Aporte de Fondos:** Un usuario deposita un activo de colateral en la bóveda del protocolo.
2.  **Acuñación de Stablecoins:** El protocolo acuña una cantidad de nuestra stablecoin proporcional al valor del colateral depositado, manteniendo siempre una sobrecolateralización.
3.  **Uso en el Ecosistema:** Otros usuarios pueden usar esta stablecoin para transacciones, DApps, etc.
4.  **Cobro de Comisiones:** El protocolo cobra una pequeña comisión por operaciones clave (como la acuñación inicial).
5.  **Reparto de Ganancias:** Las comisiones acumuladas se reparten entre los usuarios que aportaron el colateral, recompensando su liquidez.

---

## ## Arquitectura de los Smart Contracts

El sistema se compone de los siguientes contratos principales:

* **`Core.sol`**: Es el cerebro del protocolo. Sus responsabilidades son:
    * Gestionar los depósitos y retiros de colateral.
    * Calcular la cantidad de stablecoins a acuñar basándose en el precio del oráculo y el ratio de colateralización.
    * Orquestar la acuñación y quema de tokens llamando al contrato `Stablecoin.sol`.
    * Acumular las comisiones generadas por el protocolo.

* **`Stablecoin.sol`**: Es el token de nuestra stablecoin, un contrato **ERC-20** estándar con una modificación de seguridad clave:
    * Solo la dirección del contrato `Core.sol` tiene el permiso para acuñar (`mint`) o quemar (`burn`) tokens. Esto se logra transfiriendo la propiedad (`owner`) del contrato `Stablecoin` al contrato `Core` durante el despliegue.

* **`contracts/mocks/`**: Esta carpeta contiene contratos de prueba esenciales para un entorno de desarrollo local:
    * **`MockPriceOracle.sol`**: Simula un oráculo de precios, devolviendo un valor fijo para el activo de colateral. **No usar en producción.**
    * **`TestERC20.sol`**: Un token ERC-20 desplegable que usamos como colateral en nuestras pruebas (simulando WETH, por ejemplo).

---

## ## Desarrollo Local

Para configurar este proyecto en tu máquina local, sigue estos pasos.

1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/TU_USUARIO/TU_REPOSITORIO.git](https://github.com/TU_USUARIO/TU_REPOSITORIO.git)
    cd TU_REPOSITORIO
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Compilar los contratos:**
    ```bash
    npx hardhat compile
    ```
    Este comando también genera las definiciones de tipo para TypeScript en la carpeta `typechain-types`.

4.  **Ejecutar las pruebas:**
    ```bash
    npx hardhat test
    ```

---

## ## Comandos Útiles

* **Compilar:** `npx hardhat compile`
* **Probar:** `npx hardhat test`
* **Iniciar nodo local:** `npx hardhat node`
* **Desplegar en nodo local:** `npx hardhat run scripts/deploy.ts --network localhost`

---

## ## Puntos Clave para Desarrolladores

Al trabajar en este código, ten en cuenta las siguientes decisiones de diseño y simplificaciones:

### 1. Oráculo de Precios
Actualmente, el sistema utiliza un `MockPriceOracle` que devuelve un precio fijo. Para un sistema real, este es el componente más crítico y debe ser reemplazado por una solución robusta como los **Price Feeds de Chainlink** para evitar manipulaciones de precios.

### 2. Ratio de Colateralización
La constante `COLLATERALIZATION_RATIO` en `Core.sol` (fijada en 150%) asegura que siempre haya más valor en colateral que stablecoins en circulación. Este búfer protege al protocolo de pequeñas fluctuaciones de precios del colateral.

### 3. Autoridad de Acuñación (Seguridad)
El patrón de diseño donde solo el contrato `Core.sol` puede acuñar `Stablecoin.sol` es fundamental. Previene la inflación descontrolada y asegura que cada token en circulación esté respaldado por colateral dentro del sistema. Esto se configura en el script de despliegue (`scripts/deploy.ts`) con la línea `stablecoin.transferOwnership(...)`.

### 4. Simplificaciones para la Hackathon
Para este prototipo, se han omitido intencionadamente varias características complejas:
* **Liquidaciones:** No hay un mecanismo para liquidar posiciones que caigan por debajo del ratio de colateralización.
* **Distribución de Comisiones:** La lógica para repartir `totalFeesCollected` entre los proveedores de liquidez no está implementada.
* **Gobernanza:** Parámetros como el ratio o las comisiones están fijos en el código. Un sistema real requeriría un mecanismo de gobernanza para ajustarlos.

## ## Próximos Pasos

-   [ ] Implementar un mecanismo de liquidaciones.
-   [ ] Integrar un oráculo de producción (Chainlink).
-   [ ] Desarrollar la lógica para la distribución de comisiones a los proveedores de liquidez.
-   [ ] Crear una interfaz de usuario (dApp) para interactuar con los contratos.

---

## ## Licencia

Este proyecto está bajo la Licencia MIT.
