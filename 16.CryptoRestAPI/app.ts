import express, { Express, Request, Response } from 'express';
import { dbConnection } from "./src/connection/db.ts";
import { CoinRepository } from "./src/repositories/coin-repository.ts";
import { MarketRepository } from "./src/repositories/market-repository.ts";
import { MarketPricesRepository } from "./src/repositories/market-prices-repository.ts";
import { CoinService } from "./src/services/coin-service.ts";
import { MarketService } from "./src/services/markets-service.ts"
import { MarketPricesService } from "./src/services/market-prices-service.ts"
import { CoinController } from "./src/controllers/coin-controller.ts"
import { MarketController } from "./src/controllers/markets-controller.ts"
import { MarketPricesController } from "./src/controllers/market-price-controller.ts"
import { SaveDataFromMarketController } from "./src/controllers/save-data-from-market-controller.ts"
import { CronScheduler } from "./src/cronFold/job.ts";
import * as dotenv from "dotenv";
dotenv.config();

const coinRepository = new CoinRepository(dbConnection);
const coinService = new CoinService(coinRepository);
const coinController = new CoinController(coinService);

const marketRepository = new MarketRepository(dbConnection);
const marketService = new MarketService(marketRepository);
const marketController = new MarketController(marketService);

const marketPricesRepository = new MarketPricesRepository(dbConnection);
const marketPricesService = new MarketPricesService(marketPricesRepository);
const marketPricesController = new MarketPricesController(marketPricesService, marketService, coinService);

const saveDataFromMarket = new SaveDataFromMarketController(coinService, marketService, marketPricesService); 
const cronScheduler = new CronScheduler(saveDataFromMarket);

const app: Express = express();
const port: string = process.env.PORT || "3000";

app.use(express.json({ "limit": "100kb" }));
app.use(express.urlencoded({ "extended": false }));
app.use((req, res, next) => {
    console.log(`time ${new Date()}`);
    next();
});

cronScheduler.start(); 
app.use(coinController.getRouter());
app.use(marketController.getRoute());
app.use(marketPricesController.getRouter());

app.get("/", (req, res, next) => {
    const date = new Date();
    let dateString = date.toISOString();
    dateString = dateString.replace("T", " ");
    dateString = dateString.replace("Z", "");
    console.log(dateString);


});
app.use(function (req, res, next) {
    var err: Error = new Error('Not Found');
    next(err);
});

app.listen(port, () => {
    console.log(`Express listening on port ${port}`);
}); 