import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import USDCModule from "./USDC.js";

const FlowshieldModule = buildModule("FlowshieldModule", (m) => {
  // Import the USDC deployment
  const { usdc } = m.useModule(USDCModule);

  // Deploy Flowshield contract with USDC address
  const flowshield = m.contract("Flowshield", [usdc], {
    id: "Flowshield",
  });

  return { flowshield, usdc };
});

export default FlowshieldModule;
