(function() { 
	let shadowRoot;
	let doc;

	let template = document.createElement("template");
	template.innerHTML = `
		<div class="tradingview-widget-container">
			<div id=tradingview-container class="tradingview-widget-container__widget"></div>
		</div>
	`;

	const chartWidget = "https://s3.tradingview.com/tv.js";
	const marketOverviewWidget = "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js";
	const fundamentalWidget = "https://s3.tradingview.com/external-embedding/embed-widget-financials.js";

	let marketOverviewJson = JSON.stringify({
		"colorTheme": "light",
		"dateRange": "12M",
		"showChart": true,
		"locale": "de_DE",
		"largeChartUrl": "",
		"isTransparent": false,
		"showSymbolLogo": true,
		"width": "400",
		"height": "660",
		"plotLineColorGrowing": "rgba(33, 150, 243, 1)",
		"plotLineColorFalling": "rgba(33, 150, 243, 1)",
		"gridLineColor": "rgba(240, 243, 250, 1)",
		"scaleFontColor": "rgba(120, 123, 134, 1)",
		"belowLineFillColorGrowing": "rgba(33, 150, 243, 0.12)",
		"belowLineFillColorFalling": "rgba(33, 150, 243, 0.12)",
		"symbolActiveColor": "rgba(33, 150, 243, 0.12)",
		"tabs": [
		  {
			"title": "Indizes",
			"symbols": [
			  {
				"s": "FOREXCOM:SPXUSD",
				"d": "S&P 500"
			  },
			  {
				"s": "FOREXCOM:NSXUSD",
				"d": "Nasdaq 100"
			  },
			  {
				"s": "FOREXCOM:DJI",
				"d": "Dow 30"
			  },
			  {
				"s": "INDEX:NKY",
				"d": "Nikkei 225"
			  },
			  {
				"s": "INDEX:DEU30",
				"d": "DAX Index"
			  },
			  {
				"s": "FOREXCOM:UKXGBP",
				"d": "FTSE 100"
			  }
			],
			"originalTitle": "Indices"
		  },
		  {
			"title": "Rohstoffe",
			"symbols": [
			  {
				"s": "CME_MINI:ES1!",
				"d": "S&P 500"
			  },
			  {
				"s": "CME:6E1!",
				"d": "Euro"
			  },
			  {
				"s": "COMEX:GC1!",
				"d": "Gold"
			  },
			  {
				"s": "NYMEX:CL1!",
				"d": "Crude Oil"
			  },
			  {
				"s": "NYMEX:NG1!",
				"d": "Natural Gas"
			  },
			  {
				"s": "CBOT:ZC1!",
				"d": "Corn"
			  }
			],
			"originalTitle": "Commodities"
		  },
		  {
			"title": "Bonds",
			"symbols": [
			  {
				"s": "CME:GE1!",
				"d": "Eurodollar"
			  },
			  {
				"s": "CBOT:ZB1!",
				"d": "T-Bond"
			  },
			  {
				"s": "CBOT:UB1!",
				"d": "Ultra T-Bond"
			  },
			  {
				"s": "EUREX:FGBL1!",
				"d": "Euro Bund"
			  },
			  {
				"s": "EUREX:FBTP1!",
				"d": "Euro BTP"
			  },
			  {
				"s": "EUREX:FGBM1!",
				"d": "Euro BOBL"
			  }
			],
			"originalTitle": "Bonds"
		  },
		  {
			"title": "Devisen",
			"symbols": [
			  {
				"s": "FX:EURUSD"
			  },
			  {
				"s": "FX:GBPUSD"
			  },
			  {
				"s": "FX:USDJPY"
			  },
			  {
				"s": "FX:USDCHF"
			  },
			  {
				"s": "FX:AUDUSD"
			  },
			  {
				"s": "FX:USDCAD"
			  }
			],
			"originalTitle": "Forex"
		  }
		]
	  });
	
	let fundamentalJson = JSON.stringify({
		"symbol": "NASDAQ:AAPL",
		"colorTheme": "light",
		"isTransparent": false,
		"largeChartUrl": "",
		"displayMode": "regular",
		"width": 480,
		"height": 830,
		"locale": "de_DE"
	  });

	function loadScript(src) {
		console.log("LOAD");
		return new Promise(function(resolve, reject) {
		  let script = document.createElement('script');
		  if(src === marketOverviewWidget){
			script.innerHTML = marketOverviewJson;
		  }
		  script.src = src;
  
		  script.onload = () => {console.log("Load: " + src); resolve(script);}
		  script.onerror = () => reject(new Error(`Script load error for ${src}`));
  
		  doc.appendChild(script);
		});
	}


	class StockWidget extends HTMLElement {
		constructor() {
			super(); 
			//shadowRoot = this.attachShadow({mode: "open"});
			//shadowRoot.appendChild(template.content.cloneNode(true));
			this.appendChild(template.content.cloneNode(true));
			this.addEventListener("click", event => {
				var event = new Event("onClick");
				this.dispatchEvent(event);
			});
			doc = this;
			this._props = {};
			this._widget;
			this.ticker="MSFT"
			this.market="NASDAQ"
		}

		onCustomWidgetBeforeUpdate(changedProperties) {
			this._props = { ...this._props, ...changedProperties };
		}

		onCustomWidgetAfterUpdate(changedProperties) {

			async function LoadAndDraw(){
				try {
					console.log("TRY");
					if(this.widgetType === "chart"){
						await loadScript(chartWidget);
					}else{
						await loadScript(marketOverviewWidget);
					}
					
				} catch (e) {
					alert(e);
				} finally {
					console.log("FINALLY: " + this.widgetType);
					if(this.widgetType === "chart"){
						const container = document.querySelector(".tradingview-widget-container__widget");						
						//const container = document.getElementById("test");
						if(container){
							new TradingView.widget(
								{
								"width": container.clientWidth,
								"height": container.clientHeight,
								"symbol": this.market+":"+this.ticker,
								"interval": "D",
								"timezone": "Etc/UTC",
								"theme": "light",
								"style": "1",
								"locale": "de_DE",
								"toolbar_bg": "#f1f3f6",
								"enable_publishing": false,
								"allow_symbol_change": true,
								"container_id" : container.id
							}
							);
						}else{
							console.log("Container not available");
						}
					}
						
				}
			}
			LoadAndDraw.apply(this);
		}

		setContainer(container){
			debugger;
		}
		
	}

	customElements.define("com-conet-widget-stockwidget", StockWidget);
})();