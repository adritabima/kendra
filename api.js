/* ==========================================
   ADRITA BIMA KENDRA
   API CONFIGURATION
========================================== */

// =============================
// API KEYS
// =============================

// Replace these with your own keys

const FINNHUB_API_KEY = "YOUR_FINNHUB_API_KEY";

const ALPHA_API_KEY = "YOUR_ALPHA_VANTAGE_KEY";

const NEWS_API_KEY = "YOUR_MARKETAUX_KEY";


// =============================
// API URLS
// =============================

const API = {

    quote(symbol){

        return `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`;

    },

    search(keyword){

        return `https://finnhub.io/api/v1/search?q=${keyword}&token=${d9dllc9r01qui7p2nuj0d9dllc9r01qui7p2nujg}`;

    },

    news(){

        return `https://api.marketaux.com/v1/news/all?language=en&filter_entities=true&api_token=${NEWS_API_KEY}`;

    }

};



// ====================================
// FETCH JSON
// ====================================

async function getJSON(url){

    try{

        const response = await fetch(url);

        if(!response.ok){

            throw new Error("Network Error");

        }

        return await response.json();

    }

    catch(error){

        console.error(error);

        return null;

    }

}



// ====================================
// MARKET QUOTE
// ====================================

async function loadQuote(symbol,id,changeId){

    const data = await getJSON(API.quote(symbol));

    if(!data) return;

    document.getElementById(id).innerHTML =
        Number(data.c).toFixed(2);

    const change = document.getElementById(changeId);

    change.innerHTML =
        `${data.d.toFixed(2)} (${data.dp.toFixed(2)}%)`;

    if(data.d>=0){

        change.className="green";

    }else{

        change.className="red";

    }

}



// ====================================
// SEARCH STOCK
// ====================================

async function searchStock(){

    const keyword =
        document.getElementById("stockSearch").value;

    if(keyword==="") return;

    const result =
        await getJSON(API.search(keyword));

    console.log(result);

}



// ====================================
// BUTTON
// ====================================

const searchButton =
document.querySelector(".market-search button");

if(searchButton){

searchButton.addEventListener("click",searchStock);

}