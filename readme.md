Hardhat commands

<!-- Compile contracts -->
npx hardhat compile 

<!-- Run deployment script -->

npx hardhat run scripts/deploy.js --network lukso --show-stack-traces 

<!-- Verify contract on block explorer  -->

npx hardhat verify --contract contracts/Lukso.sol:Lukso 'ADDRESS' --network luksoT  --show-stack-traces