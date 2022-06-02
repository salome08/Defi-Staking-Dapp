import React, { useEffect, useState } from "react";

const Airdrop = ({ stakingBalance, decentralBank, accountNumber }) => {
  // Timer that counts down
  // Initialize count after staking

  const [counter, setCounter] = useState(20);

  useEffect(() => {
    if (stakingBalance >= "50000000000000000000")
      counter > 0
        ? setTimeout(() => setCounter(counter - 1), 1000)
        : decentralBank.methods
            .issueTokens()
            .send({ from: accountNumber })
            .on("transactionHash", (hash) => {})
            .on("error", (error, receipt) => {
              console.log("error");
            });
  }, [counter]);

  const secondsToTime = (secs) => {
    let h, s, m, rest;

    h = Math.trunc(secs / (60 * 60));
    rest = secs % (60 * 60);

    m = Math.trunc(rest / 60);
    rest = rest % 60;

    s = rest;

    const obj = {
      h: h,
      m: m,
      s: s,
    };

    return obj;
  };

  return (
    <div style={{ color: "black" }}>
      {secondsToTime(counter).m}:{secondsToTime(counter).s}
    </div>
  );
};

export default Airdrop;
