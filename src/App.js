import './main.css';
import React from "react";
import {Container, Row, Col} from 'react-grid-system';
import ReactLoading from 'react-loading';
import {Button} from "@mui/material";

const {Zilliqa} = require('@zilliqa-js/zilliqa');
const {BN, Long, units} = require('@zilliqa-js/util');

const mintContractAddress = "0x3f81cc88109d7f27bb82ddb1eabf2d06b7d3655a";
const heroesEvolutionContractAddress = "0x0a229a74b752f916b262422a08a1d9661c1334ce";
const dlHeroesEvolutionContractAddress = "0x419e6d806a7d1d304c8f0213faf5dd07663de7eb";
const gearsEvolutionContractAddress = "0xa32ec48a1df1df911010e6d93e77685774056ef0";
const HOLAddress = "0x516fe17db252d6de4ed8f3e3c19f5418cba75c3b";
const CASTAddress = "0xcdd65171b5ec8aa1bb8b13bd1a0c9ae0b6787a21";
const StakingAddress = "0x7d24d901f519a84182412b6fb38a9eb26a3a476d";

const {
    StatusType,
    MessageType,
} = require('@zilliqa-js/subscriptions');

class App extends React.Component {
    //---------------
    //* constructor *
    //---------------
    constructor(props) {
        super(props);
        // init the state variables

        this.state = {
            account: "",
            isLoadingH13Mint: false,
            isLoadingH35Mint: false,
            isLoadingHDLMint: false,
            isLoadingG13Mint: false,
            isLoadingG35Mint: false,
            isLoadingH13BatchMint: false,
            isLoadingH35BatchMint: false,
            isLoadingG13BatchMint: false,
            isLoadingG35BatchMint: false,
            isLoadingHeroesEvolution: false,
            isLoadingDLHeroesEvolution: false,
            isLoadingGearsEvolution: false,
            isLoadingStake: false,
            heroesEvMax: 0,
            heroesEvAny: 0,
            dlHeroesEvMax: 0,
            dlHeroesEvAny: 0,
            gearsEvMax: 0,
            gearsEvAny: 0,
            document: "",
            stakeAmount: 10
        };

    }

    //-------------------------------------
    //* Get the current account in ZilPay *
    //-------------------------------------
    getCurrentAccount = () => {
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
    connectZilPay = () => {
        if (window.zilPay) {
            console.log("ZilPay Present")
            this.getCurrentAccount()
            this.subscribeToEvents();
            this.subscribeToHeroesEvolutionEvents();
            this.subscribeToDLHeroesEvolutionEvents();
            this.subscribeToGearsEvolutionEvents();
        } else {
            console.log("Cannot Find ZilPay")
        }
    }

    subscribeToEvents = () => {
        // use https://api.zilliqa.com/ for Mainnet
        const zilliqa = new Zilliqa('https://dev-api.zilliqa.com');
        const subscriber =
            zilliqa.subscriptionBuilder.buildEventLogSubscriptions(
                'wss://dev-ws.zilliqa.com', // use wss://api-ws.zilliqa.com
                // for Mainnet
                {
                    addresses: [mintContractAddress],
                }
            );
        // subscribed successfully
        subscriber.emitter.on(StatusType.SUBSCRIBE_EVENT_LOG,
            (event) => {
                console.log('Subscribed: ', event);
            });
        // fired when an event is received
        subscriber.emitter.on(MessageType.EVENT_LOG,
            (event) => {
                console.log('get new event log: ', JSON.stringify(event));
                if ("value" in event) {
                    for (let eventObj of event["value"][0]["event_logs"]) {
                        console.log("TO ACCOUNT==========>", eventObj["params"][1]["value"]);
                        if (eventObj["_eventname"] === "Mint13Heroes" && eventObj["params"][1]["value"].toLowerCase() === this.state.account.toLowerCase()) {
                            this.setState({isLoadingH13Mint: false});
                        } else if (eventObj["_eventname"] === "Mint35Heroes" && eventObj["params"][1]["value"].toLowerCase() === this.state.account.toLowerCase()) {
                            this.setState({isLoadingH35Mint: false});
                        } else if (eventObj["_eventname"] === "MintDLHeroes" && eventObj["params"][1]["value"].toLowerCase() === this.state.account.toLowerCase()) {
                            this.setState({isLoadingHDLMint: false});
                        } else if (eventObj["_eventname"] === "Mint13Gears" && eventObj["params"][1]["value"].toLowerCase() === this.state.account.toLowerCase()) {
                            this.setState({isLoadingG13Mint: false});
                        } else if (eventObj["_eventname"] === "Mint35Gears" && eventObj["params"][1]["value"].toLowerCase() === this.state.account.toLowerCase()) {
                            this.setState({isLoadingG35Mint: false});
                        } else if (eventObj["_eventname"] === "BatchMint13Heroes" && eventObj["params"][1]["value"].toLowerCase() === this.state.account.toLowerCase()) {
                            this.setState({isLoadingH13BatchMint: false});
                        } else if (eventObj["_eventname"] === "BatchMint35Heroes" && eventObj["params"][1]["value"].toLowerCase() === this.state.account.toLowerCase()) {
                            this.setState({isLoadingH35BatchMint: false});
                        } else if (eventObj["_eventname"] === "BatchMint13Gears" && eventObj["params"][1]["value"].toLowerCase() === this.state.account.toLowerCase()) {
                            this.setState({isLoadingG13BatchMint: false});
                        } else if (eventObj["_eventname"] === "BatchMint35Gears" && eventObj["params"][1]["value"].toLowerCase() === this.state.account.toLowerCase()) {
                            this.setState({isLoadingG35BatchMint: false});
                        }
                    }

                }
            });
        // unsubscribed successfully
        subscriber.emitter.on(MessageType.UNSUBSCRIBE, (event) => {
            console.log('Unsubscribed: ', event);
        });
        subscriber.start();
    }

    subscribeToHeroesEvolutionEvents = () => {
        // use https://api.zilliqa.com/ for Mainnet
        const zilliqa = new Zilliqa('https://dev-api.zilliqa.com');
        const subscriber =
            zilliqa.subscriptionBuilder.buildEventLogSubscriptions(
                'wss://dev-ws.zilliqa.com', // use wss://api-ws.zilliqa.com
                // for Mainnet
                {
                    addresses: [heroesEvolutionContractAddress],
                }
            );
        // subscribed successfully
        subscriber.emitter.on(StatusType.SUBSCRIBE_EVENT_LOG,
            (event) => {
                console.log('Subscribed: ', event);
            });
        // fired when an event is received
        subscriber.emitter.on(MessageType.EVENT_LOG,
            (event) => {
                console.log('get new event log: ', JSON.stringify(event));
                if ("value" in event) {
                    for (let eventObj of event["value"][0]["event_logs"]) {
                        // if (eventObj["_eventname"] === "NFT Evolved") {
                        if (eventObj["_eventname"] === "EvolveHeroes") {
                            this.setState({isLoadingHeroesEvolution: false});
                        }
                    }

                }
            });
        // unsubscribed successfully
        subscriber.emitter.on(MessageType.UNSUBSCRIBE, (event) => {
            console.log('Unsubscribed: ', event);
        });
        subscriber.start();
    }

    subscribeToDLHeroesEvolutionEvents = () => {
        // use https://api.zilliqa.com/ for Mainnet
        const zilliqa = new Zilliqa('https://dev-api.zilliqa.com');
        const subscriber =
            zilliqa.subscriptionBuilder.buildEventLogSubscriptions(
                'wss://dev-ws.zilliqa.com', // use wss://api-ws.zilliqa.com
                // for Mainnet
                {
                    addresses: [dlHeroesEvolutionContractAddress],
                }
            );
        // subscribed successfully
        subscriber.emitter.on(StatusType.SUBSCRIBE_EVENT_LOG,
            (event) => {
                console.log('Subscribed: ', event);
            });
        // fired when an event is received
        subscriber.emitter.on(MessageType.EVENT_LOG,
            (event) => {
                console.log('get new event log: ', JSON.stringify(event));
                if ("value" in event) {
                    for (let eventObj of event["value"][0]["event_logs"]) {
                        // if (eventObj["_eventname"] === "NFT Evolved") {
                        if (eventObj["_eventname"] === "EvolveDLHeroes") {
                            this.setState({isLoadingDLHeroesEvolution: false});
                        }
                    }

                }
            });
        // unsubscribed successfully
        subscriber.emitter.on(MessageType.UNSUBSCRIBE, (event) => {
            console.log('Unsubscribed: ', event);
        });
        subscriber.start();
    }

    subscribeToGearsEvolutionEvents = () => {
        // use https://api.zilliqa.com/ for Mainnet
        const zilliqa = new Zilliqa('https://dev-api.zilliqa.com');
        const subscriber =
            zilliqa.subscriptionBuilder.buildEventLogSubscriptions(
                'wss://dev-ws.zilliqa.com', // use wss://api-ws.zilliqa.com
                // for Mainnet
                {
                    addresses: [gearsEvolutionContractAddress],
                }
            );
        // subscribed successfully
        subscriber.emitter.on(StatusType.SUBSCRIBE_EVENT_LOG,
            (event) => {
                console.log('Subscribed: ', event);
            });
        // fired when an event is received
        subscriber.emitter.on(MessageType.EVENT_LOG,
            (event) => {
                console.log('get new event log: ', JSON.stringify(event));
                if ("value" in event) {
                    for (let eventObj of event["value"][0]["event_logs"]) {
                        // if (eventObj["_eventname"] === "NFT Evolved") {
                        if (eventObj["_eventname"] === "EvolveGears") {
                            this.setState({isLoadingGearsEvolution: false});
                        }
                    }

                }
            });
        // unsubscribed successfully
        subscriber.emitter.on(MessageType.UNSUBSCRIBE, (event) => {
            console.log('Unsubscribed: ', event);
        });
        subscriber.start();
    }

    subscribeToIncreaseAllowanceEvents = () => {
        // use https://api.zilliqa.com/ for Mainnet
        const zilliqa = new Zilliqa('https://dev-api.zilliqa.com');
        const subscriber =
            zilliqa.subscriptionBuilder.buildEventLogSubscriptions(
                'wss://dev-ws.zilliqa.com', // use wss://api-ws.zilliqa.com
                // for Mainnet
                {
                    addresses: [HOLAddress],
                }
            );
        // subscribed successfully
        subscriber.emitter.on(StatusType.SUBSCRIBE_EVENT_LOG,
            (event) => {
                console.log('Subscribed: ', event);
            });
        // fired when an event is received
        subscriber.emitter.on(MessageType.EVENT_LOG,
            (event) => {
                console.log('get new event log: ', JSON.stringify(event));
                if ("value" in event) {
                    for (let eventObj of event["value"][0]["event_logs"]) {
                        if (eventObj["_eventname"] === "IncreasedAllowance" && eventObj["params"][0]["value"].toLowerCase() === this.state.account.toLowerCase()) {
                            this.stakeHol();
                            subscriber.stop();
                        }
                    }

                }
            });
        // unsubscribed successfully
        subscriber.emitter.on(MessageType.UNSUBSCRIBE, (event) => {
            console.log('Unsubscribed: ', event);
        });
        subscriber.start();
    }

    //-----------------------
    //* Call Mint transition *
    //-----------------------
    mint13Heroes = () => {
        this.setState({isLoadingH13Mint: true})
        const mintContract =
            window.zilPay.contracts.at(mintContractAddress);
        try {
            mintContract.call(
                'Mint13Heroes',
                [],
                {
                    version: 21823489,   // For mainnet, it is 65537
                                         // For testnet, it is 21823489
                    amount: new BN(0),
                    gasPrice: units.toQa('2000', units.Units.Li),
                    gasLimit: Long.fromNumber(8000)
                }
            );
        } catch (err) {
            console.log(err);
            this.setState({isLoadingH13Mint: false})
        }
    }

    mint35Heroes = () => {
        this.setState({isLoadingH35Mint: true})
        const mintContract =
            window.zilPay.contracts.at(mintContractAddress);
        try {
            mintContract.call(
                'Mint35Heroes',
                [],
                {
                    version: 21823489,   // For mainnet, it is 65537
                                         // For testnet, it is 21823489
                    amount: new BN(0),
                    gasPrice: units.toQa('2000', units.Units.Li),
                    gasLimit: Long.fromNumber(8000)
                }
            );
        } catch (err) {
            console.log(err);
            this.setState({isLoadingH35Mint: false})
        }
    }

    mintDLHeroes = () => {
        this.setState({isLoadingHDLMint: true})
        const mintContract =
            window.zilPay.contracts.at(mintContractAddress);
        try {
            mintContract.call(
                'MintDLHeroes',
                [],
                {
                    version: 21823489,   // For mainnet, it is 65537
                                         // For testnet, it is 21823489
                    amount: new BN(0),
                    gasPrice: units.toQa('2000', units.Units.Li),
                    gasLimit: Long.fromNumber(8000)
                }
            );
        } catch (err) {
            console.log(err);
            this.setState({isLoadingHDLMint: false})
        }
    }

    mint13Gears = () => {
        this.setState({isLoadingG13Mint: true})
        const mintContract =
            window.zilPay.contracts.at(mintContractAddress);
        try {
            mintContract.call(
                'Mint13Gears',
                [],
                {
                    version: 21823489,   // For mainnet, it is 65537
                                         // For testnet, it is 21823489
                    amount: new BN(0),
                    gasPrice: units.toQa('2000', units.Units.Li),
                    gasLimit: Long.fromNumber(8000)
                }
            );
        } catch (err) {
            console.log(err);
            this.setState({isLoadingG13Mint: false})
        }
    }

    mint35Gears = () => {
        this.setState({isLoadingG35Mint: true})
        const mintContract =
            window.zilPay.contracts.at(mintContractAddress);
        try {
            mintContract.call(
                'Mint35Gears',
                [],
                {
                    version: 21823489,   // For mainnet, it is 65537
                                         // For testnet, it is 21823489
                    amount: new BN(0),
                    gasPrice: units.toQa('2000', units.Units.Li),
                    gasLimit: Long.fromNumber(8000)
                }
            );
        } catch (err) {
            console.log(err);
            this.setState({isLoadingG35Mint: false})
        }
    }

    batchMint13Heroes = () => {
        this.setState({isLoadingH13BatchMint: true})
        const mintContract =
            window.zilPay.contracts.at(mintContractAddress);
        try {
            mintContract.call(
                'BatchMint13Heroes',
                [],
                {
                    version: 21823489,   // For mainnet, it is 65537
                                         // For testnet, it is 21823489
                    amount: new BN(0),
                    gasPrice: units.toQa('2000', units.Units.Li),
                    gasLimit: Long.fromNumber(8000)
                }
            );
        } catch (err) {
            console.log(err);
            this.setState({isLoadingH13BatchMint: false})
        }
    }

    batchMint35Heroes = () => {
        this.setState({isLoadingH35BatchMint: true})
        const mintContract =
            window.zilPay.contracts.at(mintContractAddress);
        try {
            mintContract.call(
                'BatchMint35Heroes',
                [],
                {
                    version: 21823489,   // For mainnet, it is 65537
                                         // For testnet, it is 21823489
                    amount: new BN(0),
                    gasPrice: units.toQa('2000', units.Units.Li),
                    gasLimit: Long.fromNumber(8000)
                }
            );
        } catch (err) {
            console.log(err);
            this.setState({isLoadingH35BatchMint: false})
        }
    }


    batchMint13Gears = () => {
        this.setState({isLoadingG13BatchMint: true})
        const mintContract =
            window.zilPay.contracts.at(mintContractAddress);
        try {
            mintContract.call(
                'BatchMint13Gears',
                [],
                {
                    version: 21823489,   // For mainnet, it is 65537
                                         // For testnet, it is 21823489
                    amount: new BN(0),
                    gasPrice: units.toQa('2000', units.Units.Li),
                    gasLimit: Long.fromNumber(8000)
                }
            );
        } catch (err) {
            console.log(err);
            this.setState({isLoadingG13BatchMint: false})
        }
    }

    batchMint35Gears = () => {
        this.setState({isLoadingG35BatchMint: true})
        const mintContract =
            window.zilPay.contracts.at(mintContractAddress);
        try {
            mintContract.call(
                'BatchMint35Gears',
                [],
                {
                    version: 21823489,   // For mainnet, it is 65537
                                         // For testnet, it is 21823489
                    amount: new BN(0),
                    gasPrice: units.toQa('2000', units.Units.Li),
                    gasLimit: Long.fromNumber(8000)
                }
            );
        } catch (err) {
            console.log(err);
            this.setState({isLoadingG35BatchMint: false})
        }
    }
    handleHeroesEvolution = () => {
        if (this.state.heroesEvMax === 0 || this.state.heroesEvAny === 0) {
            alert("Please type correct IDs");
            return;
        }
        this.setState({isLoadingHeroesEvolution: true})
        const evolutionContract =
            window.zilPay.contracts.at(heroesEvolutionContractAddress);
        try {
            evolutionContract.call(
                'EvolveHeroes',
                [
                    {
                        vname: 'id_lv_max',
                        type: 'Uint256',
                        value: this.state.heroesEvMax
                    },
                    {
                        vname: 'id_lv_any',
                        type: 'Uint256',
                        value: this.state.heroesEvAny
                    },
                ],
                {
                    version: 21823489,   // For mainnet, it is 65537
                                         // For testnet, it is 21823489
                    amount: new BN(0),
                    gasPrice: units.toQa('2000', units.Units.Li),
                    gasLimit: Long.fromNumber(8000)
                }
            );
        } catch (err) {
            console.log(err);
            this.setState({isLoadingHeroesEvolution: false})
        }
    }

    handleDLHeroesEvolution = () => {
        if (this.state.dlHeroesEvMax === 0 || this.state.dlHeroesEvAny === 0) {
            alert("Please type correct IDs");
            return;
        }
        this.setState({isLoadingDLHeroesEvolution: true})
        const evolutionContract =
            window.zilPay.contracts.at(dlHeroesEvolutionContractAddress);
        try {
            evolutionContract.call(
                'EvolveHeroes',
                [
                    {
                        vname: 'id_lv_max',
                        type: 'Uint256',
                        value: this.state.dlHeroesEvMax
                    },
                    {
                        vname: 'id_lv_any',
                        type: 'Uint256',
                        value: this.state.dlHeroesEvAny
                    },
                ],
                {
                    version: 21823489,   // For mainnet, it is 65537
                                         // For testnet, it is 21823489
                    amount: new BN(0),
                    gasPrice: units.toQa('2000', units.Units.Li),
                    gasLimit: Long.fromNumber(8000)
                }
            );
        } catch (err) {
            console.log(err);
            this.setState({isLoadingDLHeroesEvolution: false})
        }
    }

    handleGearsEvolution = () => {
        if (this.state.gearsEvMax === 0 || this.state.gearsEvAny === 0) {
            alert("Please type correct IDs");
            return;
        }
        this.setState({isLoadingGearsEvolution: true})
        const evolutionContract =
            window.zilPay.contracts.at(gearsEvolutionContractAddress);
        try {
            evolutionContract.call(
                'EvolveGears',
                [
                    {
                        vname: 'id_lv_max',
                        type: 'Uint256',
                        value: this.state.gearsEvMax
                    },
                    {
                        vname: 'id_lv_any',
                        type: 'Uint256',
                        value: this.state.gearsEvAny
                    },
                ],
                {
                    version: 21823489,   // For mainnet, it is 65537
                                         // For testnet, it is 21823489
                    amount: new BN(0),
                    gasPrice: units.toQa('2000', units.Units.Li),
                    gasLimit: Long.fromNumber(8000)
                }
            );
        } catch (err) {
            console.log(err);
            this.setState({isLoadingGearsEvolution: false})
        }
    }
    increaseAllowance = () => {
        const holContractAddress = window.zilPay.contracts.at(HOLAddress);
        try {
            holContractAddress.call(
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
                        value: this.state.stakeAmount
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
    stakeHol = () => {
        const stakingAddress = window.zilPay.contracts.at(StakingAddress);
        try {
            stakingAddress.call(
                'Stake',
                [
                    {
                        vname: 'amount',
                        type: 'Uint128',
                        value: this.state.stakeAmount
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
    stake = () => {
        this.setState({isLoadingStake: true});
        this.increaseAllowance();
        this.subscribeToIncreaseAllowanceEvents();
    }
    unstake = () => {

    }
    withdrawUnstake = () => {

    }
    claimRewards = () => {

    }
    depositDist = () => {

    }

    render() {
        return (
            <div className="container">
                <div className="headerContainer">
                    {this.state.account === "" ?
                        <button id="btnConnectZilPay" onClick={this.connectZilPay}>Connect ZilPay</button> : <></>}
                </div>
                <Container>
                    <Row>
                        <Col sm={12} md={6}>
                            <div className="totalNetworkContainer">
                                <div className="stakeFormSection">
                                    <h1>Add stake</h1>
                                    <div className="oneLineFlex">
                                        <input type="number"/>
                                    </div>
                                    <div className="oneLineFlex">
                                        <Button variant="contained">Stake</Button>;
                                    </div>
                                </div>
                                <div className="stakeFormSection">
                                    <h1>Add stake</h1>
                                    <div className="oneLineFlex">
                                        <input type="number"/>
                                    </div>
                                    <div className="oneLineFlex">
                                        <button id="btnNotarize">Stake</button>
                                    </div>
                                </div>
                            </div>

                        </Col>
                        <Col sm={12} md={6}>
                            {
                                this.state.isLoadingH35Mint ?
                                    <ReactLoading type={"balls"} color={'gray'}></ReactLoading> :
                                    <button id="btnNotarize" onClick={this.mint35Heroes}>Mint 3* ~ 5* Heroes</button>
                            }
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }
}

export default App;