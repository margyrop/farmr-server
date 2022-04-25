const cAAVE = {cName: "cAAVE", name: 'Aave Token'};
const cBAT = {cName: "cBAT", name: 'Basic Attention Token'};
const cCOMP = {cName: "cCOMP", name: 'Compound Governance Token'};
const cDAI = {cName: "cDAI", name: 'Dai'};
const cETH = {cName: "cETH", name: 'Ether'};
const cFEI = {cName: "cFEI", name: 'Fei USD'};
const cLINK = {cName: "cLINK", name: 'ChainLink Token'};
const cMKR = {cName: "cMKR", name: 'Maker'};
const cREP = {cName: "cREP", name: 'Augur'};
const cSAI = {cName: "cSAI", name: 'SAI'};
const cSUSHI = {cName: "cSUSHI", name: 'SushiToken'};
const cTUSD = {cName: "cTUSD", name: 'TrueUSD'};
const cUNI = {cName: "cUNI", name: 'Uniswap'};
const cUSDC = {cName: "cUSDC", name: 'USD Coin'};
const cUSDP = {cName: "cUSDP", name: 'Pax Dollar'};
const cUSDT = {cName: "cUSDT", name: 'Tether'};
const cWBTC = {cName: "cWBTC", name: 'Wrapped Bitcoin'};
const cYFI = {cName: "cYFI", name: 'yearn.finance'};
const cZRX = {cName: 'cZRX', name: '0x'};

const ALL_COINS = [cAAVE, cFEI, cLINK, cMKR, cETH, cSUSHI, cTUSD, cUSDP, cBAT, cYFI, cCOMP, cDAI, cREP, cSAI, cUNI, cUSDC, cUSDT, cWBTC, cZRX];

const express = require('express');
var cors = require('cors');
const Compound = require('@compound-finance/compound-js');
const app = express();
app.use(cors());

app.get('/supplyRates', (async (req, res) => {
    var allRates = await Compound.api.cToken();
    allRates = allRates.cToken;
    console.log(allRates[3]);
    var ret = allRates.map(function(rate) {
        console.log(rate);
        return {asset: rate.underlying_symbol, supplyRate: rate.supply_rate.value, cName: rate.symbol, borrowRate: rate.borrow_rate.value};
    });
    res.json(ret);  
}));

app.listen(3001);