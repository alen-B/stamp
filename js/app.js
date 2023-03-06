import { HOP_abi, HOP_address, USDT_abi, USDT_address, exchange_abi, exchange_address } from "./abi_address.js"
window.onload = async () => {
    window.app = {};
    window.app.update = {}
    await start()
}



function showMsg(strCN, strEN) {
    let str = ""
    if ($("#lang").val() == "cn"){
        str = strCN
    }else{
        str = strEN
    }
    if (typeof imtoken == 'undefined') {
        alert(str)
    } else {
        imToken.callAPI('native.alert', str)
    }
}

function jumpToEtherscan(address) {
    showMsg("正在前往 etherscan", "redirecting to etherscan")
    setTimeout(() => {
        window.location = 'https://cn.etherscan.com/address/' + address + '#transactions'
    }, 2000)
}


async function start() {
    // Modern dApp browsers...
    if (window.ethereum) {

        window.web3 = new Web3(ethereum)
        try {
            // await ethereum.enable()
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        } catch (error) {
            showMsg(error, error)
        }
    }
    // Legacy dApp browsers...
    else if (window.web3) {
        window.web3 = new Web3(web3.currentProvider)
    }
    // Non-dApp browsers...
    else {
         window.web3 = new Web3(web3.currentProvider)
        showMsg("请链接 Metamask","Please connect to Metamask.")
    }

    window.BN = web3.utils.BN
    let accounts = await web3.eth.getAccounts();
    $("#user_address").html(accounts[0]);
    
    window.app.current_account = accounts[0];
    let network = await web3.eth.net.getNetworkType();
    $("#network_type").html(network)

    window.app.usdt = new web3.eth.Contract(USDT_abi, USDT_address)

    await injectContractBaseInfo()

    // if (window.app.current_account == window.app.owner) {
    //     $("#contract_owner").show()
    // }
    // if (window.app.current_account == window.app.fundAddress) {
    //     $("#hop_woner").show()
    // }
    // $("#owner_addr").html(window.app.owner)
    // $("#fund_addr").html(window.app.fundAddress)

    let now = (new Date()).getTime();
    let width = getProgress(now) + '%'
    // $("#progress").css('width', width)
    // $('#progress_hop').html(width)

    //calculate new time
    // let day = 24 * 60 * 60 * 1000
    // let times = [window.app.exchangeEndTime + day / 2, window.app.onlineTime]
    // for (var i = 0; i < 11; i++) {
    //     times.push(times[times.length - 1] + 30 * day)
    // }
    // window.app.times = times
    // for (var i in times) {
    //     if (now < times[i])
    //         $("#next_release").html(formatDate(new Date(times[i])))
    //     break;
    // }

    ethereum.on('accountsChanged', async () => {
        location.reload()
    })

    ethereum.on('chainChanged', async () => {
        location.reload()
    })

    //init
    await syncBalance()
    // showExchangeRate()
    // handleTime()
    // attachEvents()

}

async function injectContractBaseInfo() {
  
    // let p1 = window.app.exchange.methods.mutiplier().call()
    
    // let p2 = window.app.exchange.methods.HOP_FUND().call()
    // let p3 = window.app.exchange.methods.owner().call()
    // let p4 = window.app.hop.methods.totalSupply().call()
    // let p5 = window.app.exchange.methods.EXCHANGE_END_TIME().call()
    // let p6 = window.app.exchange.methods.ONLINE_TIME().call()
    // let p7 = window.app.usdt.methods._totalSupply().call()
    // let values = await Promise.all([p1, p2, p3, p4, p5, p6, p7])
   
    // window.app.mutipler = values[0]
    // window.app.fundAddress = values[1]
    // window.app.owner = values[2]
    // window.app.totalHop = values[3]
    // window.app.exchangeEndTime = values[4] * 1000
    // window.app.onlineTime = values[5] * 1000
    // window.app.totalSupply = values[6]
}

function handleTime() {
    const st = new Date(window.app.exchangeEndTime)
    const rt = new Date(window.app.onlineTime);
    let stop_time = formatDate(st)
    let release_time = formatDate(rt)
    $("#stop_time").html(stop_time)
    $("#release_time").html(release_time)
}

function getProgress(current) {
    let day = 24 * 60 * 60 * 1000
    if (current < window.app.exchangeEndTime + day / 2) {
        return 0
    }
    if (current < window.app.onlineTime) {
        return 20
    }
    let period = (current - window.app.onlineTime) / (30 * day) + 1
    if (period >= 12) {
        return 100
    }
    let p = Math.floor(period)
    return 20 + p * (80 / 12)
}

function formatDate(now) {
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var date = now.getDate();
    var hour = now.getHours();
    var minute = now.getMinutes();
    var second = now.getSeconds();
    return year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second;
}

async function syncBalance() {
    {
        
        let currentTime = Math.floor(Date.now() / 1000)
        let account = window.app.current_account
        web3.eth.getBalance(account).then(function(balance){
            console.log(balance)
            $("#balance").html(balance)
        });
      
        // $("#hop_balance").html(window.app.hopBalance / 1e18 + "")
       
        // $("#Total_balance").html(window.app.balanceDetail.totalBalance / 1e18 + "")
        // $("#claimable").html(window.app.claimInfo[2] / 1e18 + "")
        // $("#wait_claim").html((window.app.claimInfo[0] - window.app.claimInfo[1]) / 1e18 + "")

        // if(parseInt(window.app.allowance) > 10000000000000000){
        //     $("#user_address").html(window.app.current_account + "✅")
        // }
    }
}

function showExchangeRate() {
    $("#rate").html(window.app.mutipler / 1e12)
}

function attachEvents() {

    $("#input_usdt").keyup(() => {
        let number = $("#input_usdt").val()
        $("#hop_amount").html(number * window.app.mutipler / 1e12)
    })

    $("#all").click(() => {
        window.app.usdt.methods.balanceOf(window.app.current_account).call().then(x => {
            $("#input_usdt").val(x / 1e6)
            $("#input_usdt").keyup()
        })
    })

    $("#exchange").click(async () => {

        if(!white_list.includes(window.app.current_account)){
            showMsg("当前账户不在白名单", "current account is not in whitelist")
            return
        }

        let number = parseInt(parseFloat($("#input_usdt").val()) * 1e6)
        if(isNaN(number) || number == 0){
            showMsg("请输入大于0的数字/浮点数","please input a number greater than 0")
            return
        }
        
        let balance = window.app.usdtBalance

        if (number - balance > 0) {
            showMsg("usdt不足", "insufficient usdt")
            return
        }

        let cost = number
        let address = window.app.current_account
        let allowance = await window.app.usdt.methods.allowance(address, exchange_address).call()

        if (allowance < number) {

            showMsg("授权 USDT", "approve USDT")
            try {
                await window.app.usdt.methods.approve(exchange_address, window.app.totalSupply).send({ from: address })
                showMsg("授权成功", "approve succeed")
            } catch (error) {
                jumpToEtherscan(address)
            }
        } else {

            try {
                await window.app.exchange.methods.exchangeForHOP(cost).send({ from: address })
                showMsg("购买成功", "exchange succeed")
                await syncBalance()
            } catch (error) {
                jumpToEtherscan(address)
            }
        }

    })

    $("#claim").click(async () => {
        try{
            window.app.exchange.methods.claimHOP(window.app.claimInfo[2]).send({ from: window.app.current_account })
            showMsg("收取成功", "claim succeed")
            await syncBalance()
        }catch (error){
            jumpToEtherscan(address)
        }
    })

    $("#approve_hop").click(() => {
        window.app.hop.methods.approve(exchange_address, window.app.totalHop).send({ from: window.app.fundAddress })
            .then(async () => {
                showMsg("授权成功","approve success!")
            })
    })

    $("#set_rate").click(() => {
        let r = $("#new_rate").val()
        window.app.exchange.methods.setRate(r).send({ from: window.app.owner })
            .then(async () => {
                showMsg("汇率变化","rate changed!")
                await showExchangeRate()
            })
    })

    $("#change_address").click(() => {
        let f_address = $("#f_addr").val()
        let b_address = $("#b_addr").val()
        window.app.exchange.methods.changeAddress(f_address, b_address).send({ from: window.app.owner })
            .then(() => {
                showMsg("地址改变，请刷新","address changed, please reload")
            })
    })

    $("#append").click(() => {
        let address = $("#append_address").val()
        if (!web3.utils.isAddress(address)) {
            showMsg("无效的账户地址","not an address!")
            return
        }
        if (address in window.app.update) {
            showMsg("地址已经存在","address already inserted!")
            return
        }
        let value = new BN($("#append_value").val()).mul(new BN(1e9)).mul(new BN(1e9)).toString()
        let text = $("#sell_record").val()
        if (text != "") {
            text = text + "\n"
        }
        text = text + address + "\t" + value.toString()
        $("#sell_record").val(text)
        $("#append_address").val("")
        $("#append_value").val("")
        //reconstruct update
        let lines = text.split("\n")
        window.app.update = {}
        for (var index in lines) {
            let line = lines[index]
            let pair = line.split("\t")
            let addr = pair[0]
            let balance = pair[1]
            if (addr in window.app.update) {
                showMsg("地址已经插入","address already inserted")
                return
            }
            window.app.update[addr] = balance
        }
    })

    $("#update").click(() => {
        let text = $("#sell_record").val()
        let lines = text.split("\n")
        window.app.update = {}
        for (var index in lines) {
            let line = lines[index]
            let pair = line.split("\t")
            let addr = pair[0]
            let balance = pair[1]
            if (addr in window.app.update) {
                showMsg("地址已经插入","address already inserted")
                return
            }
            window.app.update[addr] = balance
        }
        let addr_array = []
        let val_array = []
        for (var a in window.app.update) {
            addr_array.push(a)
            val_array.push(window.app.update[a])
        }
        let address = window.app.current_account
        window.app.exchange.methods.editBalance(addr_array, val_array).send({ from: address }).then(() => {
            showMsg("数据成功插入","data inserted")
        })
    })

    var defaultLang = "cn"

    // languageSelect(defaultLang);
    var lang = $("#lang")
    lang.change(() => {
        defaultLang = lang.val()
        languageSelect(defaultLang)
    })

}

function languageSelect(defaultLang){
    $("[i18n]").i18n({
        defaultLang: defaultLang,
        filePath: "./i18n/",
        filePrefix: "i18n_",
        fileSuffix: "",
        forever: true,
        callback: function(res) {}
    });
}