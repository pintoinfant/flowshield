import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const USDCModule = buildModule("USDCModule", (m) => {
  // Get the deployer account - this will be the initial owner of the USDC contract
  const deployer = m.getAccount(0);

  // Deploy USDC contract with deployer as initial owner
  const usdc = m.contract("USDC", [deployer], {
    id: "USDC",
  });

  return { usdc };
});

export default USDCModule;
