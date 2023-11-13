import { UsersService } from "../services/users-service.ts";
import { FavoriteService } from "../services/favorite-cryptos-service.ts";
import { Controller } from "./controller.ts";
import { Message } from "node-telegram-bot-api";
import { DataGetter } from "../cryptoRestConnection/data-getter.ts";
import { bot } from "../bot.ts";

export class AddToFavoriteController extends Controller {
    private userService: UsersService;
    private favoriteService: FavoriteService;
    private dataGetter: DataGetter;
    constructor(userService: UsersService, favoriteService: FavoriteService, dataGetter: DataGetter) {
        super(/\/addToFavorite [a-zA-Z]+$/);
        this.userService = userService;
        this.favoriteService = favoriteService;
        this.dataGetter = dataGetter;
    }

    onCommand = async (msg: Message, match: RegExpExecArray | null): Promise<void> => {
        const coin = match?.input.split(" ")[1];
        const chatId = msg.chat.id;
        if (coin === undefined) {
            bot.sendMessage(chatId, "Invalid input");
        }
        const coins = await this.dataGetter.getCoinBySymbol(coin as string);
        if (coins.length < 1) {
            bot.sendMessage(chatId, "Can't add or this coin in your favorite list");
        } else {
            const user = await this.userService.insertOne(chatId);
            this.favoriteService.insertToFavorite(user.id, coins[0]).then((data) => {
                bot.sendMessage(chatId, `${coin?.toUpperCase()} successfully added to your favorite list. To view the list use /listFavorite command`);
            }).catch((err) => {
                console.log(err);
                if (err.code === "P2002") {
                    bot.sendMessage(chatId, "Coin already in your list. To view the list use /listFavorite command");
                } else {
                    bot.sendMessage(chatId, "Can't add or this coin in your favorite list. To view the list use /listFavorite command");
                }
            });

        }
    }
}