//  API KEY: VM5QW21H9GNMSUE2  // 
//  API KEY ALT: PWU390I6GYWLGRYZ  //


const url = "https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=AAPL&interval=1min&apikey=VM5QW21H9GNMSUE2";

function get_data(url){
    fetch(url).then(
        function(response) {
            if(response.status !== 200){
                console.log('fetch error' + response.status);
            }
            else {
                response => {
                    console.log(response);
                    return response.json();
                }
            }
            
            /* parse response text 
            response.json().then(function(data){
                console.log(data);
                return data;
            }) */
        }
        )}

console.log(get_data(url));


        /*
var parsed_data = get_data(url);

console.log(parsed_data.toString());


//document.querySelector('p').textContent = parsed_data.hasOwn


    /*.catch(function(err){
        console.log('Fetch error :-S', err);
    })
    */