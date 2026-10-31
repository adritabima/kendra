/* =====================================
    MARKET DASHBOARD
====================================== */

document.addEventListener("DOMContentLoaded",()=>{

loadMarket();

loadClock();

setInterval(loadMarket,30000);

setInterval(loadClock,1000);

});




// ==========================
// MARKET
// ==========================

function loadMarket(){

loadQuote("^NSEI","nifty","niftyChange");

loadQuote("^BSESN","sensex","sensexChange");

loadQuote("^NSEBANK","banknifty","bankChange");

loadQuote("^NSEFIN","finnifty","finChange");

}




// ==========================
// CLOCK
// ==========================

function loadClock(){

const today=new Date();

const time=today.toLocaleTimeString();

console.log(time);

}




// ==========================
// SAMPLE GAINERS
// ==========================

const gainers=[

["RELIANCE",1565.25,"+21.10","+1.36%"],

["TCS",3812.30,"+45.40","+1.21%"],

["HDFC BANK",1748.10,"+28.20","+1.64%"],

["INFY",1644.50,"+14.50","+0.89%"],

["SBIN",842.65,"+8.25","+1.01%"]

];



const losers=[

["BAJAJ AUTO",9234.10,"-56.25","-0.61%"],

["SUNPHARMA",1728.80,"-17.20","-0.98%"],

["ITC",462.30,"-4.20","-0.90%"],

["NESTLE",2456.30,"-18.40","-0.74%"],

["ULTRATECH",11284.20,"-92.30","-0.82%"]

];



function buildTable(id,data,color){

const body=document.querySelector(`#${id} tbody`);

if(!body) return;

body.innerHTML="";

data.forEach(stock=>{

body.innerHTML+=`

<tr>

<td>${stock[0]}</td>

<td>${stock[1]}</td>

<td class="${color}">${stock[2]}</td>

<td class="${color}">${stock[3]}</td>

</tr>

`;

});

}



buildTable("gainersTable",gainers,"green");

buildTable("losersTable",losers,"red");




// ==========================
// SAMPLE NEWS
// ==========================

const news=[

{

title:"Indian markets end higher led by Banking stocks.",

image:"images/news/news1.jpg"

},

{

title:"Gold prices rise ahead of RBI policy meeting.",

image:"images/news/news2.jpg"

},

{

title:"Mutual Fund SIP reaches record inflows.",

image:"images/news/news3.jpg"

}

];



const newsBox=document.getElementById("newsContainer");



if(newsBox){

news.forEach(item=>{

newsBox.innerHTML+=`

<div class="news-card">

<img src="${item.image}">

<div class="news-content">

<h3>${item.title}</h3>

<p>

Updated just now

</p>

</div>

</div>

`;

});

}
// =======================================
// HEATMAP ANIMATION
// =======================================

const heatBoxes = document.querySelectorAll(".heat");

setInterval(() => {

    heatBoxes.forEach(box => {

        let change = (Math.random() * 4 - 2).toFixed(2);

        let span = box.querySelector("span");

        span.innerHTML = `${change}%`;

        if (change >= 0) {

            box.classList.remove("red");
            box.classList.add("green");

        } else {

            box.classList.remove("green");
            box.classList.add("red");

        }

    });

}, 10000);