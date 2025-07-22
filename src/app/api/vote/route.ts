import {ActionGetResponse, ActionPostRequest, ACTIONS_CORS_HEADERS, createPostResponse} from '@solana/actions'
import { Votingdapp} from "@/../anchor/target/types/votingdapp";
import IDL from "@/../anchor/target/idl/votingdapp.json" assert { type: "json" };
import {Program} from '@coral-xyz/anchor'
import {Connection,PublicKey, Transaction} from "@solana/web3.js"
import * as anchor from '@coral-xyz/anchor'

export const OPTIONS=GET;

export async function GET(req:Request){

    const actionMetadata:ActionGetResponse={
        icon:"https://images.getrecipekit.com/20230102102018-peanut_butter_01_520x500.webp?aspect_ratio=1:1&quality=90&",
        title:"Vote for your Favorite type of Peanut Butter!",
        description:"Vote Either Crunchy or Smooth ?",
        label:"Vote",
        links:{
            actions:[
                {
                    label:"Vote for Crunchy",
                    href:"/api/vote?candidate=Crunchy",
                    type:'post'
                },
                {
                    label:"Vote for Smooth",
                    href:"/api/vote?candidate=Smooth",
                    type:'post'
                }
            ]
        }
    }

    return Response.json(actionMetadata,{headers:ACTIONS_CORS_HEADERS});

}

export async function POST(req:Request){
    const url= new URL(req.url);
    const candidate=url.searchParams.get("candidate");
    if(candidate!=="Crunchy" && candidate!=="Smooth")
        return Response.json("Invalid Candidate",{status:400,headers:ACTIONS_CORS_HEADERS});


    const conn=new Connection("http://127.0.0.1:8899","confirmed");
    const program:Program<Votingdapp>= new Program(IDL as unknown as Votingdapp,{connection:conn});

    const body:ActionPostRequest=await req.json();
    let voter;
    try {
        voter=new PublicKey(body.account);
    } catch (error) {
        return Response.json("Invalid Candidate",{status:400,headers:ACTIONS_CORS_HEADERS});
    }
    

    const ix=await program.methods.vote(candidate,new anchor.BN(1)).accounts({signer:voter}).instruction();
    const blockhash=await conn.getLatestBlockhash();
    const txn=new Transaction({
        feePayer:voter,
        blockhash:blockhash.blockhash,
        lastValidBlockHeight:blockhash.lastValidBlockHeight,
    }).add(ix);

    const response=await createPostResponse({
        fields:{
            transaction:txn,
            type:'transaction'
        }
    })

    return Response.json(response,{status:200,headers:ACTIONS_CORS_HEADERS});

}