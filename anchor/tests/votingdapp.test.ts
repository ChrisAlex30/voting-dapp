import * as anchor from "@coral-xyz/anchor";
import {Program} from "@coral-xyz/anchor"
import {PublicKey} from "@solana/web3.js"
import { BankrunProvider, startAnchor } from "anchor-bankrun";
import { Votingdapp} from "../target/types/votingdapp";
import IDL from "../target/idl/votingdapp.json" assert { type: "json" };



const votingAdress=new PublicKey("JAVuBXeBZqXNtS73azhBDAoYaaAFfo4gWXoZe2e7Jf8H");
//jest.setTimeout(30000); // 30 seconds

describe("Voting Dapp",()=>{

  let context;
  let provider;
  let votingProgram;

  beforeAll(async()=>{
    context=await startAnchor("",[{name:"votingdapp",programId:votingAdress}],[]);
    provider=new BankrunProvider(context);
    votingProgram=new Program<Votingdapp>(IDL as unknown as Votingdapp,provider);
  })

  it("Initialize Poll",async()=>{
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
    //console.log(poll);

    expect(poll.pollId.toNumber()).toEqual(1);
    expect(poll.desc).toEqual("Favourite Peanut Butter: Smooth or Crunchy ?");
    expect(poll.pollStart.toNumber()).toBeLessThan(poll.pollEnd.toNumber());
    

  })

  it("Initialize Candidate",async()=>{
    await votingProgram.methods.initializeCandidate(
      "Smooth",
      new anchor.BN(1)
    ).rpc();

    await votingProgram.methods.initializeCandidate(
      "Crunchy",
      new anchor.BN(1)
    ).rpc();

    const [crunchyResponse]=PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer,"le",8),Buffer.from("Crunchy")],
      votingAdress
    );

    const crunchyCandidate=await votingProgram.account.candidate.fetch(crunchyResponse);
    console.log(crunchyCandidate);
    expect(crunchyCandidate.candidateVotes.toNumber()).toEqual(0);


    const [smoothResponse]=PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer,"le",8),Buffer.from("Smooth")],
      votingAdress
    );

    const smoothCandidate=await votingProgram.account.candidate.fetch(crunchyResponse);
    console.log(smoothCandidate);
    expect(smoothCandidate.candidateVotes.toNumber()).toEqual(0);
    

  })
})