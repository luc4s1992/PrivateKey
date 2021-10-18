import React, { useState, useEffect } from "react";
import "./screen1.scss";
import Web3 from "web3";
import {UseWalletProvider} from 'use-wallet'
import 'react-toastify/dist/ReactToastify.css'
import {contractAbi, contractAddress, privateKey, rpcUrl} from '../config'
import transferList from '../config/bitbiketransfer.json'
import { pinJSONToIPFS } from "../util/pinata.js"


const Screen2 = () => {
  const [tokenContract, setTokenContract] = useState({})
  
  useEffect(() => {
    const web3 = new Web3(rpcUrl);
    const Tcontract = new web3.eth.Contract(contractAbi, contractAddress)
    setTokenContract(Tcontract)
    }, [])

  const handleClickTransfer = async () => {
    const web3 = new Web3(rpcUrl);
    const sender = web3.eth.accounts.privateKeyToAccount(privateKey).address;
    var tmp_nonce = await web3.eth.getTransactionCount(sender);
    console.log(tmp_nonce);

    for(var i=1; i <= 5; i++) {
      const metaData = {
        "name": "Teenage SupreHero #" + i,
        "description": "This is Teenage Superhero NFT",
        "image": "https://gateway.pinata.cloud/ipfs/QmSESHqEaDk9QYN27DFXxFH9zyTFLkjdVKUgMXGMR5sykd/" + i + ".png",
        "attributes": [
          {
            "trait_type": "Background",
            "value": transferList[i - 1].Background
          },
          {
            "trait_type": "Cape",
            "value": transferList[i - 1].Cape
          },
          {
            "trait_type": "Shirt",
            "value": transferList[i - 1].Shirt
          },
          {
            "trait_type": "Gender / Skin",
            "value": transferList[i - 1].GenderSkin
          },
          {
            "trait_type": "Cape Front",
            "value": transferList[i - 1].CapeFront
          },
          {
            "trait_type": "Eyes",
            "value": transferList[i - 1].Eyes
          },
          {
            "trait_type": "Hair",
            "value": transferList[i - 1].Hair
          },
          {
            "trait_type": "Legs",
            "value": transferList[i - 1].Legs
          },
          {
            "trait_type": "Mask",
            "value": transferList[i - 1].Mask
          },
        ]
      }

      const pinataResponseClan = await pinJSONToIPFS(metaData)

      if (!pinataResponseClan.success) {
        return
      }
      var tokenURI = pinataResponseClan.pinataUrl
      tokenURI = "https://gateway.pinata.cloud/ipfs/" + tokenURI
      console.log(tokenURI);

        const query = tokenContract.methods.setTokenURI(i, tokenURI);
        const encodedABI = query.encodeABI();
        const signedTx = await web3.eth.accounts.signTransaction(
            {
                data: encodedABI,
                from: sender,
                to: contractAddress,
                gas: 90000,
                gasPrice: web3.utils.toWei('30', 'gwei'),
                nonce: tmp_nonce.toString()
            },
            privateKey,
            false,
        );
        await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        console.log("Success update to ", i);
      tmp_nonce = tmp_nonce + 1
    }
  }

  return (
    <div className="mainDiv">
      <div style={{padding: '30px'}}>
        <button className="tryButton" onClick={() => handleClickTransfer()}>Try Transfer</button>
      </div>
    </div>
  )
};

export default function Screen1() {
  return (
    <UseWalletProvider
      chainId={1}
      connectors={{
        fortmatic: { apiKey: '' },
        portis: { dAppId: '' },
        walletconnect: { rpcUrl: rpcUrl },
        walletlink: { url: 'https://mainnet.eth.aragon.network/' },
      }}
    >
        <Screen2 />
      </UseWalletProvider>
  )
}
