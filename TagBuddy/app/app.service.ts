import { Injectable } from "@angular/core";
import {
  AngularFirestore,
  AngularFirestoreCollection
} from "angularfire2/firestore";
import { User, Chat, Friend } from "./app.models";
import { appconfig } from "./app.config";

import { Observable } from "rxjs";


@Injectable()
export class ChatService {
  users: AngularFirestoreCollection<User>;

  chats: AngularFirestoreCollection<Chat>;

  friends: AngularFirestoreCollection<Friend>;

  data:Observable<any>;
  //The pair string for the two users currently chatting
  currentChatPairId;
  currentChatPartner;

  constructor(private db: AngularFirestore) {
    this.users = db.collection<User>(appconfig.users_endpoint);
    this.chats = db.collection<Chat>(appconfig.chats_endpoint);
    this.friends = db.collection<Friend>(appconfig.friends_endpoint);
  }

  addUser(payload) {
    return this.users.add(payload);
  } //addUser

  addChat(chat: Chat) {
    return this.chats.add(chat);
  } //addChat

caesarShift(str, amount) {
    // Wrap the amount
    if (amount < 0)
      return this.caesarShift(str, amount + 26);
    
    // Make an output variable
    var output = '';
    for (var i = 0; i < str.length; i ++) {
      // Get the character we'll be appending
      var c = str[i];
      // checks using regular expression if it's a letter
      if (c.match(/[a-z]/i)) {
        var code = str.charCodeAt(i); //ascii code
        // Uppercase letters
        if ((code >= 65) && (code <= 90))
          c = String.fromCharCode(((code - 65 + amount) % 26) + 65);

        // Lowercase letters
        else if ((code >= 97) && (code <= 122))
          c = String.fromCharCode(((code - 97 + amount) % 26) + 97);
      }
      output += c;
    }
    return output;
  }
}


