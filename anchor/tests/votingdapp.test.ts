import * as anchor from "@coral-xyz/anchor";
import {Program} from "@coral-xyz/anchor"
import {PublicKey} from "@solana/web3.js"
import { BankrunProvider, startAnchor } from "anchor-bankrun";
import { Votingdapp} from "../target/types/votingdapp";
import IDL from "../target/idl/votingdapp.json" assert { type: "json" };



const votingAdress=new PublicKey("JAVuBXeBZqXNtS73azhBDAoYaaAFfo4gWXoZe2e7Jf8H");
//jest.setTimeout(30000); // 30 seconds

describe("Voting Dapp",()=>{
  it("Initialize Poll",async()=>{
    const context=await startAnchor("",[{name:"votingdapp",programId:votingAdress}],[]);
    const provider=new BankrunProvider(context);
    const votingProgram=new Program<Votingdapp>(IDL as unknown as Votingdapp,provider);

    await votingProgram.methods.initializePoll(
      new anchor.BN(1),
      "Favourite Peanut Butter: Smooth or Crunchy ?",
      new anchor.BN(1752914344),
      new anchor.BN(1762914344),
    ).rpc();

    const [pollAddress]=PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer,"le",8)],
      votingAdress
    );

    const poll=await votingProgram.account.poll.fetch(pollAddress);
    console.log(poll);

  })
})