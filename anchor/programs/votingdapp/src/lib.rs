#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("5Sz5P5uKKMn2eujZtoPRA3jC3guSLazxkgQsXB7xve6c");

#[program]
pub mod votingdapp {
    use super::*;

    pub fn initialize_poll(ctx:Context<InitiaizePoll>,poll_id:u64,desc:String,poll_start:u64,poll_end:u64)->Result<()>{
        let poll=&mut ctx.accounts.poll;
        poll.poll_id=poll_id;
        poll.desc=desc;
        poll.poll_start=poll_start;
        poll.poll_end=poll_end;
        poll.candidate_amount=0;
        Ok(())
    }

    pub fn initialize_candidate(ctx:Context<InitiaizeCandidate>,candidate_name:String,_poll_id:u64)->Result<()>{
        let candidate=&mut ctx.accounts.candidate;
        candidate.candidate_name=candidate_name;
        candidate.candidate_votes=0;
        let poll=&mut ctx.accounts.poll;
        poll.candidate_amount+=1;
        Ok(())
    }

    pub fn vote(ctx:Context<Vote>,_candidate_name:String,_poll_id:u64)->Result<()>{
        let candidate=&mut ctx.accounts.candidate;
        candidate.candidate_votes+=1;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(candidate_name:String,poll_id:u64)]
pub struct Vote<'info>{
    pub signer:Signer<'info>,

    #[account(
        seeds=[poll_id.to_le_bytes().as_ref()],bump
    )]
    pub poll:Account<'info,Poll>,

    #[account(    
        mut,    
        seeds=[poll_id.to_le_bytes().as_ref(),candidate_name.as_bytes()],bump
    )]
    pub candidate:Account<'info,Candidate>
}



#[account]
#[derive(InitSpace)]
pub struct Candidate{
    #[max_len(280)]
    pub candidate_name:String,
    pub candidate_votes:u64
}

#[derive(Accounts)]
#[instruction(candidate_name:String,poll_id:u64)]
pub struct InitiaizeCandidate<'info>{
    #[account(mut)]
    pub signer:Signer<'info>,

    #[account(
        mut,
        seeds=[poll_id.to_le_bytes().as_ref()],bump
    )]
    pub poll:Account<'info,Poll>,

    #[account(
        init,payer=signer,space=8+Candidate::INIT_SPACE,
        seeds=[poll_id.to_le_bytes().as_ref(),candidate_name.as_bytes()],bump
    )]
    pub candidate:Account<'info,Candidate>,
    pub system_program:Program<'info,System>
}


#[account]
#[derive(InitSpace)]
pub struct Poll{
    pub poll_id:u64,
    #[max_len(280)]
    pub desc:String,
    pub poll_start:u64,
    pub poll_end:u64,
    pub candidate_amount:u64
}

#[derive(Accounts)]
#[instruction(poll_id:u64)]
pub struct InitiaizePoll<'info>{
    #[account(mut)]
    pub signer:Signer<'info>,
    #[account(
        init,payer=signer,space=8+Poll::INIT_SPACE,
        seeds=[poll_id.to_le_bytes().as_ref()],bump
    )]
    pub poll:Account<'info,Poll>,
    pub system_program:Program<'info,System>
}