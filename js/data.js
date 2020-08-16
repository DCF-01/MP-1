function getURL(ticker){
    return 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=' + ticker + '&interval=1min&datatype=csv&apikey=PWU390I6GYWLGRYZ';
}

var btn = document.querySelector('button');
var input = document.querySelector('input');

btn.onclick =  function(){
    let canvas = document.getElementById('chart');
    canvas.remove();

    let div = document.querySelector('div');
    let newCanvas = document.createElement('canvas');
    newCanvas.style = 'width:100%; height:100%';
    newCanvas.id = 'chart';
    
    div.appendChild(newCanvas)

    let ticker = input.value;
    input.textContent = '';
    
    chartIT(ticker);

}

async function getData(arg){
    ticker = arg
    url = getURL(ticker);
    let table = [];
    let xlabels = [];
    let yprice = [];
    let response = await fetch(url);
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

        // TESTING - print in console
        console.log(timestamp, close);
        })
    xlabels.reverse();
    yprice.reverse();
    return {xlabels, yprice};
    }

        
async function chartIT(arg){
    ticker = arg;
    const data = await getData(ticker);
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
// default first call
chartIT('AAPL');