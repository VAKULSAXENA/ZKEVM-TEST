import { expect } from "chai";
import dotenv from "dotenv";
dotenv.config();
import { setupWallet, zkEVM_provider, ownerSigner } from "./utils/setupWallet";
import { ethers, Contract } from "ethers";
import { checkBalances } from "./utils/checkBalances";
import counter_artifacts from "../artifacts/src/interface_contracts/interface.sol/Counter.json";
import myContract_artifacts from "../artifacts/src/interface_contracts/interface.sol/MyContract.json";

describe("Interface contract deployment & tests on zkEVM", async () => {
    // declare an instance of the contract to be deployed
    let counter: any;
    let myContract: any;

    // setup atleast 5 wallet addresses for testing
    const derivedNode = await setupWallet();
    before(async () => {
        console.log("\n-----------------------------------------------------------------------------------");
        console.log("Deploying Fallback smart contract on zkEVM chain....");
        console.log("-----------------------------------------------------------------------------------\n");

        // check & display current balances
        await checkBalances(derivedNode);

        // get the contract factory
        const counter_Factory = new ethers.ContractFactory(
            counter_artifacts.abi,
            counter_artifacts.bytecode,
            ownerSigner
        );
        const myContract_Factory = new ethers.ContractFactory(
            myContract_artifacts.abi,
            myContract_artifacts.bytecode,
            ownerSigner
        );

        // deploy the contract
        const counter_contract = await counter_Factory.deploy();
        const myContract_contract = await myContract_Factory.deploy();

        // wait for the contract to get deployed
        await counter_contract.deployed();
        await myContract_contract.deployed();

        // get the instance of the deployed contract
        counter = new Contract(counter_contract.address, counter_artifacts.abi, zkEVM_provider);
        myContract = new Contract(myContract_contract.address, myContract_artifacts.abi, zkEVM_provider);

        console.log("\nInterface Contract Deployed at: ", myContract.address);
        console.log(`Contract Details: https://explorer.public.zkevm-test.net/address/${myContract.address}`);
    });

    describe("Interface contract functionalities tests", async () => {
        it("...can increment value", async () => {
            const tx = await myContract.connect(ownerSigner).incrementCounter(counter.address);
            await tx.wait(2);
            expect(await myContract.getCount(counter.address)).eq("1");
        });
    });
});
