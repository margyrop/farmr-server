const cAAVE = { cName: "cAAVE", name: 'Aave Token' };
const cBAT = { cName: "cBAT", name: 'Basic Attention Token' };
const cCOMP = { cName: "cCOMP", name: 'Compound Governance Token' };
const cDAI = { cName: "cDAI", name: 'Dai' };
const cETH = { cName: "cETH", name: 'Ether' };
const cFEI = { cName: "cFEI", name: 'Fei USD' };
const cLINK = { cName: "cLINK", name: 'ChainLink Token' };
const cMKR = { cName: "cMKR", name: 'Maker' };
const cREP = { cName: "cREP", name: 'Augur' };
const cSAI = { cName: "cSAI", name: 'SAI' };
const cSUSHI = { cName: "cSUSHI", name: 'SushiToken' };
const cTUSD = { cName: "cTUSD", name: 'TrueUSD' };
const cUNI = { cName: "cUNI", name: 'Uniswap' };
const cUSDC = { cName: "cUSDC", name: 'USD Coin' };
const cUSDP = { cName: "cUSDP", name: 'Pax Dollar' };
const cUSDT = { cName: "cUSDT", name: 'Tether' };
const cWBTC = { cName: "cWBTC", name: 'Wrapped Bitcoin' };
const cYFI = { cName: "cYFI", name: 'yearn.finance' };
const cZRX = { cName: 'cZRX', name: '0x' };

const ALL_COINS = [cAAVE, cFEI, cLINK, cMKR, cETH, cSUSHI, cTUSD, cUSDP, cBAT, cYFI, cCOMP, cDAI, cREP, cSAI, cUNI, cUSDC, cUSDT, cWBTC, cZRX];

const express = require('express');
var bodyParser = require('body-parser')
// create application/json parser
var jsonParser = bodyParser.json()
var cors = require('cors');
const Compound = require('@compound-finance/compound-js');
const app = express();
const axios = require('axios');
app.use(cors());

app.get('/supplyRates', (async (req, res) => {
    var allRates = await Compound.api.cToken();
    allRates = allRates.cToken;
    var ret = allRates.map(function (rate) {
        return {
            asset: rate.underlying_symbol,
            supplyRate: rate.supply_rate.value,
            cName: rate.symbol,
            borrowRate: rate.borrow_rate.value,
            collateralFactor: rate.collateral_factor.value,
            underlyingPrice: rate.underlying_price.value,
            volatility: 0,
            underlyingSymbol: rate.underlying_symbol
        };
    });
    res.json(ret);
}));

app.post('/volatility', jsonParser, (async (req, res) => {
    const rates = [];
    for (var i = 0; i < req.body.rates.length; i++) {
        const marketData = await Compound.api.marketHistory({
            "asset": Compound.util.getAddress(req.body.rates[i].cName),
            "min_block_timestamp": Math.ceil(new Date().getTime() / 1000) - 1000000,
            "max_block_timestamp": Math.ceil(new Date().getTime() / 1000),
            "num_buckets": 20,
        }).catch(error => {
            console.log(error)
            rates.push(req.body.rates[i]);
        });
        if (marketData) {
            if (marketData.prices_usd.length > 10) {
                var prices = marketData.prices_usd.slice(-10);
            } else {
                var prices = marketData.prices_usd;
            }
            var mean = prices.reduce((partialSum, a) => {
                return partialSum + parseFloat(a.price.value)
            }, 0) / prices.length;
            var squaredDeviations = prices.map((data) => Math.pow(parseFloat(data.price.value) - mean, 2));
            var varience = squaredDeviations.reduce((partialSum, a) => {
                return partialSum + a
            }, 0) / prices.length;
            var standardDeviation = Math.sqrt(varience);
            var volatility = prices[prices.length - 1] ? (standardDeviation / parseFloat(prices[prices.length - 1].price.value)) : 0;
            rates.push({ ...req.body.rates[i], volatility: volatility })
        }
    }

    res.json(rates);

}));

app.get('/ethPrice', (async (req, res) => {
    axios.get(`https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD`).then(result => {
        if (result.data) {
            res.json(result.data);
        }
        else {
            //Error
            console.error('Unable to retreive ETH rate.');
        }
    })
}));



app.listen(3001);