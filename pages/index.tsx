import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import { useState, useEffect } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import Contracts from '../utils/contract';
import PoolABI from "../utils/Pool.json";
import { writeContract, waitForTransaction, readContract } from '@wagmi/core'
import { formatEther, parseEther } from 'viem';
import Link from 'next/link';
import { erc20ABI } from 'wagmi';
import toast, { Toaster } from 'react-hot-toast';


const Home: NextPage = () => {
  const [amount, setAmount] = useState(0)
  const { address } = useAccount()
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const getBalance = async () => {
      const balanceDAI = await readContract({
        address: `0x${Contracts.DAI_Testnet}`,
        abi: erc20ABI,
        functionName: 'balanceOf',
        args: [address!],
        account: address!
      })
      setBalance(Number(formatEther(BigInt(Number(isNaN(Number(balanceDAI)) ? 0 : balanceDAI)))))
      console.log(balanceDAI)
    }

    getBalance()
  }, [])


  const supply = async () => {
    try {

      setLoading(true)
      toast('Approve Pool Contract to Access Your DAI Tokens', {
        style: {
          background: "blue",
          color: "white"
        }
      })
      /** Approving DAI to be spent from Pool Contract */
      const { hash: ApproveTxHash } = await writeContract({
        address: `0x${Contracts.DAI_Testnet}`,
        abi: erc20ABI,
        functionName: 'approve',
        account: address,
        args: [`0x${Contracts.Pool}`, parseEther(String(amount))]
      })
      console.log(ApproveTxHash)
      await waitForTransaction({
        hash: ApproveTxHash,
      })

      toast('Supply DAI Token to Pool Contract', {
        style: {
          background: "blue",
          color: "white"
        }
      })
      /** Supplying DAI to Pool Contract */
      const { hash: SupplyTxHash } = await writeContract({
        address: `0x${Contracts.Pool}`,
        abi: PoolABI,
        functionName: 'supply',
        account: address,
        args: [`0x${Contracts.DAI_Testnet}`, parseEther(String(amount)), address, 0]
      })

      await waitForTransaction({
        hash: SupplyTxHash,
      })
      toast('Successfully Supplied DAI to AAVE Polygon Mumbai', {
        style: {
          background: "green",
          color: "white"
        }
      })
      console.log("supplied")
      setAmount(0)
      setLoading(false)

    } catch (e) {
      console.log(e)
      setLoading(false)
    }
  }

  return (
    <div className='container'  >
      <Link href="/faucet" className='font-bold '  >
        {`Faucet For Testnet DAI on Polygon Mumbai >`}
      </Link>

      <div className=' flex flex-col  items-center justify-center  mt-14' >
        <div className=' font-bold text-2xl ' >Anmol Plena Assignment</div>
        <div className=' font-semibold text-sm  mt-2 ' >AAVE Polygon Mumbai Pool Contract Supply Interaction</div>
        <div className=' font-semibold text-lg my-4 ' >{`Your DAI Balance = ${balance}`}</div>
        <ConnectButton />

        <input
          type="number"
          value={amount}
          onChange={(e) => {
            const value = Number(e.target.value)
            if (value > balance) return
            if (value < 0) return
            setAmount(value)
          }}

          className=' mt-8 px-4 py-4 font-medium w-[30%] border-2 rounded-lg focus:outline-none'
        />
        {
          !loading ?
            <>  <button
              disabled={amount === 0 ? true : false}
              className={` ${amount === 0 ? "bg-[#a8c7ee]" : "bg-[#0e76fd]"}  rounded-lg px-8 py-2 text-white font-bold  mt-4 w-[30%] button-elevation   `}
              onClick={supply}>
              {`${amount === 0 ? "Enter Supply Amount" : "SUPPLY"}`}
            </button>
            </>
            :
            <>
              <div className="loader"></div>
            </>
        }
      </div>
      <Toaster />
    </div>
  );
};

export default Home;
