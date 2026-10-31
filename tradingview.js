new TradingView.widget({

    "container_id":"tradingview_chart",

    "width":"100%",

    "height":600,

    "symbol":"NSE:NIFTY",

    "interval":"15",

    "timezone":"Asia/Kolkata",

    "theme":"dark",

    "style":"1",

    "locale":"en",

    "toolbar_bg":"#0F172A",

    "enable_publishing":false,

    "allow_symbol_change":true,

    "hide_top_toolbar":false,

    "save_image":true,

    "withdateranges":true,

    "details":true,

    "studies":[

        "RSI@tv-basicstudies",

        "MACD@tv-basicstudies",

        "MASimple@tv-basicstudies",

        "Volume@tv-basicstudies"

    ]

});