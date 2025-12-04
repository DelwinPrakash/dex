use anchor_lang::prelude::*;

declare_id!("2ePEtYQZ68aNbYY8trRKuJLCd74JUyaSxsuqUCzhUs3u");

#[program]
pub mod dex {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
