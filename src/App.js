import './main.css';
import React from "react";
import {Container, Row, Col} from 'react-grid-system';
import ReactLoading from 'react-loading';
import {Button, FilledInput, FormControl, IconButton, InputAdornment, InputLabel} from "@mui/material";


const {Zilliqa} = require('@zilliqa-js/zilliqa');
const {BN, Long, units} = require('@zilliqa-js/util');

const HOLAddress = "0x516fe17db252d6de4ed8f3e3c19f5418cba75c3b";
const StakingAddress = "0xdec808a8dbf33bca8973be33ba4ae80c363c4fba";


class App extends React.Component {
    //---------------
    //* constructor *
    //---------------
    constructor(props) {
        super(props);
        // init the state variables

        this.state = {
            account: "",
            isLoadingStake: false,
            stakeAmount: "",
            unstakeAmount: "",
            holBalance: 0,
            totalStackedAmount: 0,
            stakedAmount: 0,
            unstakedAmount: 0,
        };

    }

    //-------------------------------------
    //* Get the current account in ZilPay *
    //-------------------------------------
    getCurrentAccount = async () => {
        let that = this;
        window.zilPay.wallet.connect()
            .then(
                function (connected) {
                    console.log(connected)
                    console.log(window.zilPay.wallet.net);
                    console.log(window.zilPay.wallet.defaultAccount);
                    // subscribe to network changes
                    window.zilPay.wallet.observableNetwork().subscribe(
                        function (network) {
                            console.log("Network has been changed to " + network);
                        });
                    // subscribe to user account changes
                    window.zilPay.wallet.observableAccount().subscribe(
                        function (account) {
                            console.log("Account has been changed to " +
                                account.base16 + " (" + account.bech32 + ")");
                            that.setState({account: account.base16})
                            window.zilPay.blockchain.getBalance(account.bech32)
                                .then(function (resp) {
                                    console.log(resp);
                                })
                        })
                }
            )
    }
    //-----------------------------------------------
    //* Check if ZilPay is installed on the browser *
    //-----------------------------------------------
    connectZilPay = async () => {
        if (window.zilPay) {
            await this.getCurrentAccount();
            const isNeedToIncrease = await this.checkAccountInformation();
            if (isNeedToIncrease) {
                await this.increaseAllowance();
            }
        } else {
            console.log("Cannot Find ZilPay")
        }
    }

    checkAccountInformation = async () => {
        const zilliqa = new Zilliqa('https://dev-api.zilliqa.com');
        const holTokenAContract = zilliqa.contracts.at(HOLAddress);
        const holContractState = await holTokenAContract.getState();
        const thisAddress = this.state.account.toLowerCase();

        const holBalanceString = holContractState['balances'][thisAddress];
        const holBalanceFormatted = parseFloat(holBalanceString) / 100000;
        this.setState({holBalance: holBalanceFormatted});

        const stakeContract = zilliqa.contracts.at(StakingAddress);
        const stakeContractState = await stakeContract.getState();

        // Total Staked Amount
        const totalStakedAmountString = stakeContractState['total_staked_amount'];
        const totalStakedAmountStringFormatted = parseFloat(totalStakedAmountString) / 100000;
        this.setState({totalStackedAmount: totalStakedAmountStringFormatted})

        if (stakeContractState['records'][thisAddress]) {
            console.log("===========>", stakeContractState['records'][thisAddress])
            // Staked Amount
            const stakedAmountString = stakeContractState['records'][thisAddress]['arguments'][0];
            const stakedAmountStringFormatted = parseFloat(stakedAmountString) / 100000;
            this.setState({ stakedAmount: stakedAmountStringFormatted});

            // Unstaked Amount
            const unstakedAmountString = stakeContractState['records'][thisAddress]['arguments'][1];
            const unstakedAmountStringFormatted = parseFloat(unstakedAmountString) / 100000;
            this.setState({ unstakedAmount: unstakedAmountStringFormatted});
        }
        if (holContractState['allowances'][thisAddress]) {
            const allowance = holContractState['allowances'][thisAddress][StakingAddress];
            if (allowance && allowance !== "0") {
                return false;
            }
        }
        return true;
    };
    increaseAllowance = async () => {
        const holContractAddress = window.zilPay.contracts.at(HOLAddress);
        try {
            await holContractAddress.call(
                'IncreaseAllowance',
                [
                    {
                        vname: 'spender',
                        type: 'ByStr20',
                        value: StakingAddress
                    },
                    {
                        vname: 'amount',
                        type: 'Uint128',
                        value: '10000000000000'
                    }
                ],
                {
                    version: 21823489,   // For mainnet, it is 65537
                                         // For testnet, it is 21823489
                    amount: new BN(0),
                    gasPrice: units.toQa('2000', units.Units.Li),
                    gasLimit: Long.fromNumber(8000)
                }
            )
        } catch (e) {
            console.log(e);
        }
    }
    stakeHol = async () => {
        if  (this.state.stakeAmount === "" || this.state.stakeAmount === "0") {
            alert("Stake amount must be not zero");
            return;
        }
        const stakeAmountString = (this.state.stakeAmount * 100000).toString(10);
        const stakingAddress = window.zilPay.contracts.at(StakingAddress);
        try {
            await stakingAddress.call(
                'Stake',
                [
                    {
                        vname: 'amount',
                        type: 'Uint128',
                        value: stakeAmountString
                    }
                ],
                {
                    version: 21823489,   // For mainnet, it is 65537
                                         // For testnet, it is 21823489
                    amount: new BN(0),
                    gasPrice: units.toQa('2000', units.Units.Li),
                    gasLimit: Long.fromNumber(8000)
                }
            )
        } catch (e) {
            console.log(e);
        }
    }
    unstake = async () => {
        if (this.state.unstakeAmount === "" || this.state.unstakeAmount === "0") {
            alert("Unstake amount must be not zero");
            return;
        }
        const unstakeAmountString = (this.state.unstakeAmount * 100000).toString(10);
        const stakingAddress = window.zilPay.contracts.at(StakingAddress);
        try {
            await stakingAddress.call(
                'Unstake',
                [
                    {
                        vname: 'amount',
                        type: 'Uint128',
                        value: unstakeAmountString
                    }
                ],
                {
                    version: 21823489,   // For mainnet, it is 65537
                                         // For testnet, it is 21823489
                    amount: new BN(0),
                    gasPrice: units.toQa('2000', units.Units.Li),
                    gasLimit: Long.fromNumber(8000)
                }
            )
        } catch (e) {
            console.log(e);
        }
    }
    withdrawUnstake = () => {

    }
    claimRewards = () => {

    }
    depositDist = () => {

    }
    handleChange = (field) => (event) => {
        this.setState({[field]: event.target.value });
    }
    render() {
        return (
            <div className="container">
                <div className="headerContainer">
                </div>
                <Container>
                    <Row>
                        <Col sm={12} md={6}>
                            <div className="totalNetworkContainer">
                                <div className="stakeFormSection">
                                    <p className="font-bold">Add stake</p>
                                    <div className="oneLineFlex">
                                        <FormControl fullWidth sx={{ m: 1}} variant="outlined">
                                            <InputLabel htmlFor="filled-adornment-password">Amount</InputLabel>
                                            <FilledInput
                                                id="filled-adornment-password"
                                                type="number"
                                                value={this.state.stakeAmount}
                                                onChange={this.handleChange('stakeAmount')}
                                                classes={{root: "colorYellow"}}
                                                endAdornment={
                                                    <InputAdornment position="end">
                                                        <Button onClick={() => {this.setState({stakeAmount: this.state.holBalance})}}>MAX</Button>
                                                    </InputAdornment>
                                                }
                                            />
                                        </FormControl>
                                    </div>
                                    <div className="oneLineFlex">
                                        <Button sx={{m: 1, width: '25ch'}} variant="contained" onClick={() => this.stakeHol()}>Stake</Button>
                                    </div>
                                </div>
                                <div className="stakeFormSection">
                                    <p className="font-bold">Remove Stake</p>
                                    <div className="oneLineFlex">
                                        <FormControl fullWidth sx={{ m: 1}} variant="outlined">
                                            <InputLabel htmlFor="filled-adornment-password">Amount</InputLabel>
                                            <FilledInput
                                                id="filled-adornment-password"
                                                type="number"
                                                value={this.state.unstakeAmount}
                                                onChange={this.handleChange('unstakeAmount')}
                                                classes={{root: "colorYellow"}}
                                                // value={values.password}
                                                // onChange={handleChange('password')}
                                            />
                                        </FormControl>
                                    </div>
                                    <div className="oneLineFlex">
                                        <Button sx={{m: 1, width: '25ch'}} variant="contained" onClick={() => this.unstake()}>Unstake</Button>
                                    </div>
                                </div>
                            </div>

                        </Col>
                        <Col sm={12} md={6}>
                            <Row>
                                <Col sm={12}>
                                    <div className="totalNetworkContainer">
                                        <div className="oneLineBetween">
                                            <p className="font-bold">My $HOL Balance: </p>
                                            <p>{this.state.account === "" ? "CONNECT WALLET TO SEE ADDRESS" : '$HOL   ' + this.state.holBalance}</p>
                                        </div>
                                        <p>TOTAL STACKED</p>
                                        {this.state.account !== "" ? <p>{ this.state.stakedAmount }</p> : <p>---</p>}
                                        <Button fullWidth sx={{ m: 1}} variant="contained" onClick={this.connectZilPay} disabled={this.state.account !== ""}>Connect to Zilpay Wallet</Button>
                                    </div>
                                </Col>
                            </Row>
                            <Row>
                                <Col sm={6}>
                                    <div className="totalNetworkContainer">
                                        <p><span className="font-bold">OVERALL NETWORK STAKED: </span>$HOL</p>
                                        <p>{this.state.totalStackedAmount}</p>
                                    </div>
                                </Col>
                                <Col sm={6}>
                                    <div className="totalNetworkContainer">
                                        <p><span className="font-bold">ESTIMATED REWARDS: </span>$HOL</p>
                                        <p>100,000</p>
                                        <Button fullWidth size="small" variant="contained" style={{textTransform: "none"}}>Claim Rewards!</Button>
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }
}

export default App;