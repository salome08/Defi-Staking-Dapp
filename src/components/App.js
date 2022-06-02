import React, { useEffect, useState } from "react";
import "./App.css";
import NavBar from "./NavBar";
import Main from "./Main";
import Web3 from "web3";
import Tether from "../truffle_abis/Tether.json";
import Rwd from "../truffle_abis/RWD.json";
import DecentralBank from "../truffle_abis/DecentralBank.json";
import ParticleSettings from "./ParticleSettings";

const App = () => {
  const [accountNumber, setAccountNumber] = useState(null);
  const [tether, setTether] = useState({});
  // const [rwd, setRwd] = useState({});
  const [decentralBank, setDecentralBank] = useState({});
  const [tetherBalance, setTetherBalance] = useState("0");
  const [rwdBalance, setRwdBalance] = useState("0");
  const [stakingBalance, setStakingBalance] = useState("0");
  const [loading, setLoading] = useState(true);

  const loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert("No ethereum detected! checkout metamask !");
    }
  };

  const getAccount = async () => {
    const web3 = window.web3;
    const account = await web3.eth.getAccounts();
    setAccountNumber(account[0]);
  };

  const loadBlockchainData = async () => {
    const web3 = window.web3;

    const networkId = await web3.eth.net.getId();

    // TETHER load
    const tetherData = Tether.networks[networkId];

    if (tetherData) {
      try {
        const tether = new web3.eth.Contract(Tether.abi, tetherData.address);
        setTether(tether);

        let tetherBalance = await tether.methods
          .balanceOf(accountNumber)
          .call();
        setTetherBalance(tetherBalance.toString());
      } catch (e) {
        console.log("e", e);
      }
    } else {
      window.alert(
        "Error! Tether contract not deployed - no detected network !"
      );
    }

    // RWD load
    const rwdData = Rwd.networks[networkId];
    if (rwdData) {
      const rwd = new web3.eth.Contract(Rwd.abi, rwdData.address);
      // setRwd(rwd);
      let rwdBalance = await rwd.methods.balanceOf(accountNumber).call();
      setRwdBalance(rwdBalance.toString());
    } else {
      window.alert("Error! Rwd contract not deployed - no detected network !");
    }

    // DECENTRAL BANK load
    const decentralBankData = DecentralBank.networks[networkId];
    if (decentralBankData) {
      const decentralBank = new web3.eth.Contract(
        DecentralBank.abi,
        decentralBankData.address
      );
      setDecentralBank(decentralBank);
      let stakingBalance = await decentralBank.methods
        .stakingBalance(accountNumber)
        .call();

      setStakingBalance(stakingBalance.toString());
    } else {
      window.alert(
        "Error! Decentral Bank contract not deployed - no detected network !"
      );
    }

    setLoading(false);
  };

  // Staking function
  const stakeTokens = (amount) => {
    // grab from decentralBank depositToken
    setLoading(true);
    tether.methods
      .approve(decentralBank._address, amount)
      .send({ from: accountNumber })
      .on("transactionHash", (hash) => {
        decentralBank.methods
          .depositToken(amount)
          .send({ from: accountNumber })
          .on("transactionHash", (hash) => {
            setLoading(false);
          })
          .on("error", (error, receipt) => {
            console.log("error");
            setLoading(false);
          });
      });
  };

  // Unstaking function
  const unstakeTokens = () => {
    // grab from decentralBank unstakeTokens
    setLoading(true);
    decentralBank.methods
      .unstakeTokens()
      .send({ from: accountNumber })
      .on("transactionHash", (hash) => {
        setLoading(false);
      })
      .on("error", (error, receipt) => {
        console.log("error");
        setLoading(false);
      });
  };

  const Loader = () => {
    return (
      <p
        id="loader"
        className="text-center"
        style={{ margin: "30px", color: "white" }}
      >
        LODING PLEASE...
      </p>
    );
  };

  React.useEffect(() => {
    loadWeb3();
    getAccount();
  }, []);

  useEffect(() => {
    if (accountNumber) {
      loadBlockchainData();
    }
  }, [accountNumber]);

  return (
    <div className="App" style={{ position: "relative" }}>
      <div style={{ position: "absolute" }}>
        <ParticleSettings />
      </div>

      <NavBar accountNumber={accountNumber} />
      <div className="container-fluid mt-5">
        <div className="row content"></div>
        <main
          role="main"
          className="col-lg-12 ml-auto mr-auto"
          style={{ maxWidth: "600px", minHeight: "100vm" }}
        >
          <div>
            {loading ? (
              <Loader />
            ) : (
              <Main
                tetherBalance={tetherBalance}
                rwdBalance={rwdBalance}
                stakingBalance={stakingBalance}
                stakeTokens={stakeTokens}
                unstakeTokens={unstakeTokens}
                decentralBank={decentralBank}
                accountNumber={accountNumber}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
