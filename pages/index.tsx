import type { NextPage } from 'next';
import Link from 'next/link';


const Home: NextPage = () => {
  return (
    <div className='container'  >
      <Link href="/faucet" className='font-bold '  >
        {`Faucet For Testnet DAI on Polygon Mumbai >`}
      </Link>


    </div>
  );
};

export default Home;
