let ticker;

let chart_url;
let earnings_url; 
let cash_flow_url;
let balance_sheet_url;



// alt VM5QW21H9GNMSUE2  
//PWU390I6GYWLGRYZ
const key = 'PWU390I6GYWLGRYZ';

function setUrls(){
    chart_url = 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=' + ticker + '&interval=1min&datatype=csv&apikey=' + key;
    earnings_url = 'https://www.alphavantage.co/query?function=EARNINGS&symbol=' + ticker + '&apikey=' + key;
    cash_flow_url = 'https://www.alphavantage.co/query?function=CASH_FLOW&symbol=' + ticker + '&apikey=' + key;
    balance_sheet_url = 'https://www.alphavantage.co/query?function=BALANCE_SHEET&symbol=' + ticker + '&apikey=' + key;
}

let test_url = 'https://www.alphavantage.co/query?function=EARNINGS&symbol=' + 'AAPL' + '&apikey=' + key;

//------------display-ratios------------------
const pe_display = document.getElementById('pe');
const dy_display = document.getElementById('div-yield');
const eps_display = document.getElementById('eps');
const ann_ds_display = document.getElementById('annual-div-share');
//--------------------------------------------

const btn = document.querySelector('button');
const input = document.querySelector('input');
const spinner = document.getElementById('spinner');

btn.addEventListener('click', renderData)
input.addEventListener('keypress', (e) => {
    if(e.key === 'Enter'){
        renderData();
    }
})


function renderData(){
    spinner.className = 'spinner-border';

    //get ticker value and set urls

    ticker = input.value;
    input.textContent = '';
    setUrls(ticker);

    //reload canvas
    let canvas = document.getElementById('chart');
    canvas.remove();
    let panel_container = document.querySelector('.panel-container');
    let newCanvas = document.createElement('canvas');
    newCanvas.id = 'chart';
    newCanvas.style.height='100%'
    newCanvas.style.width='100%'
    panel_container.appendChild(newCanvas);

    
    chartIT(ticker);
    getRatios()
        .catch(err => {
            console.log(err);
        })

}

async function getChartData(){
    let table = [];
    let xlabels = [];
    let yprice = [];
    let response = await fetch(chart_url);
    let data = await response.text();
    //console.log(data);

    table = data.split('\n').slice(1);  // bew line break makes arrays[num]

    table.forEach(row => {
        const column = row.split(','); // splits each element in every row array
        const timestamp = column[0];
        const open = column[1];
        const high = column[2];
        const low = column[3];
        const close = column[4];
        const volume = column[5];
        xlabels.push(timestamp); // labels x-axis
        yprice.push(close); // prices y-axis

        })
    xlabels.reverse();
    yprice.reverse();

    return {xlabels, yprice};
    }

        
async function chartIT(){
    const data = await getChartData(ticker);
    const ctx = document.getElementById('chart').getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
        labels: data.xlabels,
        datasets: [{
        label: ticker,
        pointRadius: '2.2',
        data: data.yprice,
        backgroundColor: 'rgb(39, 179, 53, 0.35)',
        borderColor: 'rgb(25, 128, 0, 1)',
        borderWidth: 1,
        fill: true
            
        }], },
        options: {
        scales: {
            yAxes: [{
                ticks: {
                    // Include a dollar sign in the ticks
                    callback: function(value, index, values) {
                        return '$' + value;
                            }
                        }
                    }]
                }
            }
        })
}


async function getRatios() {
    // [0] = earnings; [1] = cash flow; [2] = balance sheet
    const data_array = [];

    const promise_array = await Promise.all([
        fetch(earnings_url), 
        fetch(cash_flow_url), 
        fetch(balance_sheet_url)
    ]);

    for await (let item of promise_array){
        data_array.push(await item.json());
    }

    setRatios()
        .catch(err => {
            console.log(err);
        })


    async function setRatios(){
        //current price
        let price_close = await getChartData().then((res) => {
            return res.yprice[100];
        });
        
        console.log(data_array);
        if(data_array[0].Note || !price_close){
            throw new Error('Api Error: call limit exceeded!');
        }
        else {
            //earnings per share trailing 12m
            let eps_TTM = sumLastFour(data_array[0]) 

            function sumLastFour(data){
                let sum = 0;
                for(let i = 0; i < 4; i++){
                    sum += parseFloat(data.quarterlyEarnings[i].reportedEPS);
                }
                return sum.toFixed(2);
            }

            // let cash_flow_data = (await fetch(cash_flow_url)).json();
            let dividend_payout = Math.abs(data_array[1].annualReports[0].dividendPayout);

            // let balance_sheet_data = (await fetch(balance_sheet_url)).json();
            let common_shares = Math.abs(data_array[2].annualReports[0].commonStockSharesOutstanding);
            
            //    
            let price_earnings_ratio =  (parseFloat(price_close / eps_TTM)).toFixed(2);
            //
            let annual_dividend_per_share = (parseFloat(dividend_payout / common_shares)).toFixed(2); 
            //
            let divident_yield =  (parseFloat((annual_dividend_per_share / price_close) * 100)).toFixed(2);

            populateFields(price_earnings_ratio, divident_yield, eps_TTM, annual_dividend_per_share);
        }
    }
}

function populateFields(pe, dy, eps, adps) {
    if (!isNaN(dy)) {
        dy_display.textContent = `${dy}%`;
        ann_ds_display.textContent = adps;
    }
    else if (isNaN(dy)){
        dy_display.textContent = '-';
        ann_ds_display.textContent = '-';
    }
    pe_display.textContent = pe;
    eps_display.textContent = eps;

    spinner.className = '';
}

